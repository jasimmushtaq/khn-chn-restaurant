const { Server } = require('socket.io');
const { createServer } = require('http');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
const { filterPII } = require('./utils/piiFilter');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Chat server connected to MongoDB'))
  .catch(err => console.error('❌ Chat server MongoDB error:', err));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.warn('⚠️ Supabase environment variables missing. Chat will NOT start.');
}

if (process.env.REDIS_URL) {
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Redis adapter connected');
    })
    .catch((err) => {
      console.warn('⚠️ Redis connection failed, falling back to local memory adapter:', err.message);
    });
} else {
  console.log('ℹ️ No REDIS_URL found, using local memory adapter (single instance mode)');
}

const messageCounts = new Map();

const rateLimit = (socketId) => {
  const now = Date.now();
  const userData = messageCounts.get(socketId) || { count: 0, lastReset: now };

  if (now - userData.lastReset > 60000) {
    userData.count = 1;
    userData.lastReset = now;
  } else {
    userData.count++;
  }

  messageCounts.set(socketId, userData);
  return userData.count <= 10;
};

const User = require('./models/User'); 
const DeliveryBoy = require('./models/DeliveryBoy');
const Order = require('./models/Order');

const { setDriverStatus, getActiveDriversInArea } = require('./services/deliveryService');
const { checkPendingQueue } = require('./services/orderAssignment');

const eventBus = require('./services/eventBus');

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  // DEMO BYPASS
  if (token === 'demo-token') {
    const dId = "69aeb5620a7a7ad0f1688f90";
    socket.data.userId = dId;
    socket.data.role = 'delivery';
    if (mongoose.connection.readyState === 1) {
        socket.data.user = await DeliveryBoy.findById(dId);
    }
    return next();
  }

  // GUEST MODE
  if (!token || token === 'undefined' || token === 'null') {
    socket.data.userId = `guest-${socket.id}`;
    socket.data.role = 'customer';
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = decoded.id;

    // Determine role 
    let role = 'customer';
    let userData = null;
    
    // Check if Mongoose is connected before querying
    if (mongoose.connection.readyState === 1) {
      const isDelivery = await DeliveryBoy.findById(userId);
      if (isDelivery) {
        role = 'delivery';
        userData = isDelivery;
      }
    }

    socket.data.userId = userId;
    socket.data.role = role;
    socket.data.user = userData;
    next();
  } catch (err) {
    // If token is invalid, fallback to guest instead of error
    socket.data.userId = `guest-${socket.id}`;
    socket.data.role = 'customer';
    next();
  }
});

io.on('connection', async (socket) => {
  const { orderId, type } = socket.handshake.query;
  const userId = socket.data.userId;
  const role = socket.data.role;

  // Personal room for notifications
  if (userId) {
     if (role === 'delivery') {
        socket.join(`driver:${userId}`);
        const area = socket.data.user?.assignedArea || 'General';
        socket.join(`area:${area}`);
        console.log(`Driver ${userId} joined room driver:${userId} and area:${area}`);
        
        // Check if there are pending orders for this area when driver connects
        checkPendingQueue(userId, area, io);
     } else {
        socket.join(`user:${userId}`);
     }
  }

  // Handle Order Accept/Reject from Delivery Boy
  socket.on('accept_order', async ({ orderId }) => {
      if (role !== 'delivery') return;
      try {
          const order = await Order.findById(orderId);
          if (order && order.status === 'received') {
              order.status = 'preparing';
              order.deliveryPartner = {
                  partnerId: userId,
                  name: socket.data.user.name,
                  photoUrl: socket.data.user.photoUrl,
                  // ... other fields
              };
              await order.save();
              
              await setDriverStatus(userId, 'BUSY', socket.data.user.assignedArea);
              
              // Notify assignment service
              eventBus.emit('order_accepted', { orderId, driverId: userId });
              
              socket.emit('order_accepted', { orderId });
              // Notify customer
              io.to(`order:${orderId}`).emit('order_status_update', { status: 'preparing', partner: order.deliveryPartner });
          } else {
              socket.emit('error', 'Order no longer available');
          }
      } catch (err) {
          console.error(err);
      }
  });

  // Handle Chat Logic only if orderId and type='chat' is provided
  if (type === 'chat' && orderId && mongoose.Types.ObjectId.isValid(orderId)) {
    // Strictly block chat if order is delivered or cancelled
    try {
        const order = await Order.findById(orderId);
        if (!order || order.status === 'delivered' || order.status === 'cancelled') {
            console.log(`Chat blocked for order ${orderId}: Status is ${order?.status || 'not found'}`);
            socket.emit('error', 'Chat is closed for this order.');
            socket.disconnect();
            return;
        }
    } catch (err) {
        console.error('Error checking order status on connection:', err);
    }

    let roomId;
    let room;

    if (supabase) {
        const { data, error: roomError } = await supabase
            .from('chat_rooms')
            .select('id, customer_id, partner_id, status')
            .eq('order_id', orderId)
            .single();
        room = data;
        if (roomError || !room) {
            socket.disconnect();
            return;
        }
        roomId = room.id;
    } else {
        // OFFLINE MODE / NO SUPABASE
        roomId = `offline-${orderId}`;
        room = { id: roomId, customer_id: 'any', partner_id: 'any', status: 'active' };
    }

    socket.join(`order:${orderId}`);

    if (supabase) {
        const { data: history, error: historyError } = await supabase
            .from('chat_messages')
            .select('id, sender_role, body, sent_at')
            .eq('room_id', roomId)
            .order('sent_at', { ascending: true })
            .limit(50);

        if (!historyError && history) {
            socket.emit('history', history.map(h => ({
                id: h.id,
                senderRole: h.sender_role,
                body: h.body,
                sentAt: h.sent_at
            })));
        }
    } else {
        socket.emit('history', []); // Start fresh in offline mode
    }

    socket.on('message', async (text) => {
        if (!text || text.length > 500) return;

        if (!rateLimit(socket.id)) {
            socket.emit('error', 'Rate limit exceeded. Max 10 messages per minute.');
            return;
        }

        // Secondary status check before sending
        try {
            const order = await Order.findById(orderId);
            if (order && (order.status === 'delivered' || order.status === 'cancelled')) {
                socket.emit('error', 'Chat is now closed.');
                socket.disconnect();
                return;
            }
        } catch (err) {
            console.error('Error checking order status on message:', err);
        }

        const filteredBody = filterPII(text);
        const msgData = {
            room_id: roomId,
            sender_id: userId,
            sender_role: role,
            body: filteredBody,
            sent_at: new Date().toISOString(),
        };

        if (supabase) {
            const { data, error } = await supabase
                .from('chat_messages')
                .insert([msgData])
                .select('id, sender_role, body, sent_at')
                .single();
            
            if (error) {
                console.error('Error saving message:', error);
                return;
            }
            
            io.to(`order:${orderId}`).emit('message', {
                id: data.id,
                senderRole: data.sender_role,
                body: data.body,
                sentAt: data.sent_at,
            });
        } else {
            // OFFLINE BROADCAST
            io.to(`order:${orderId}`).emit('message', {
                id: `offline-${Date.now()}`,
                senderRole: role,
                body: filteredBody,
                sentAt: new Date().toISOString(),
            });
        }
    });
  }

  socket.on('disconnect', () => {
    messageCounts.delete(socket.id);
  });
});

module.exports = { httpServer, io, supabase };

const PORT = process.env.CHAT_PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
  if (!supabase) {
    console.warn('⚠️ WORKING IN OFFLINE MODE: Messages will not be saved to Supabase.');
  }
});
