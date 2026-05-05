const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.warn('⚠️ Supabase environment variables missing. Chat features will not work.');
}

/**
 * Creates a new chat room when a driver is assigned.
 */
const createChatRoom = async (orderId, customerId, partnerId) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);

  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }
  const { data, error } = await supabase
    .from('chat_rooms')
    .insert([
      {
        order_id: orderId,
        customer_id: customerId,
        partner_id: partnerId,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }

  return data.id;
};

/**
 * Closes a chat room when an order is delivered.
 */
const closeChatRoom = async (orderId) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('chat_rooms')
    .update({ status: 'closed' })
    .eq('order_id', orderId);

  if (error) {
    console.error('Error closing chat room:', error);
    throw error;
  }
};

module.exports = { createChatRoom, closeChatRoom };
