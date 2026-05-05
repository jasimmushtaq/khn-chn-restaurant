const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

let isConnected = false;

const connectRedis = async () => {
    if (!process.env.REDIS_URL) {
        console.warn('⚠️ No REDIS_URL found. Real-time status system will use local memory fallback.');
        return null;
    }
    if (!isConnected) {
        await redisClient.connect();
        isConnected = true;
        console.log('✅ Redis connected for Delivery System');
    }
    return redisClient;
};

module.exports = { redisClient, connectRedis };
