const { redisClient, connectRedis } = require('../config/redis');
const supabase = require('../config/supabase');
const DeliveryBoy = require('../models/DeliveryBoy');

const setDriverStatus = async (driverId, status, area) => {
    try {
        const client = await connectRedis();
        const timestamp = Date.now();
        
        const statusData = {
            id: driverId,
            status,
            area: area || 'General',
            updatedAt: timestamp
        };

        // 1. Update Redis (Real-time cache)
        if (client) {
            await client.hSet(`driver:${driverId}`, {
                status,
                area: area || 'General',
                updatedAt: timestamp.toString()
            });

            // Maintain area-based set for fast lookup
            if (status === 'ACTIVE') {
                await client.sAdd(`area:${area || 'General'}:active`, driverId.toString());
            } else {
                await client.sRem(`area:${area || 'General'}:active`, driverId.toString());
            }
        }

        // 2. Update MongoDB (Main DB)
        await DeliveryBoy.findByIdAndUpdate(driverId, {
            workStatus: status,
            assignedArea: area || 'General',
            lastStatusUpdate: new Date(timestamp)
        });

        // 3. Update Supabase (Persistent Real-time Mirror if needed)
        if (supabase) {
            try {
                await supabase
                    .from('delivery_statuses')
                    .upsert({
                        driver_id: driverId,
                        status,
                        area: area || 'General',
                        updated_at: new Date(timestamp).toISOString()
                    });
            } catch (supaErr) {
                console.warn('Supabase mirror sync failed:', supaErr.message);
                // Don't throw, let the main system proceed
            }
        }

        return statusData;
    } catch (error) {
        console.error('Error setting driver status:', error);
        throw error;
    }
};

const getActiveDriversInArea = async (area) => {
    try {
        const client = await connectRedis();
        if (client) {
            const driverIds = await client.sMembers(`area:${area}:active`);
            return driverIds;
        }
        
        // Fallback to MongoDB
        const drivers = await DeliveryBoy.find({ 
            assignedArea: area, 
            workStatus: 'ACTIVE' 
        }).select('_id');
        return drivers.map(d => d._id.toString());
    } catch (error) {
        console.error('Error getting active drivers:', error);
        return [];
    }
};

module.exports = {
    setDriverStatus,
    getActiveDriversInArea
};
