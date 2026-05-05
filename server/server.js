const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const posterRoutes = require('./routes/posterRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const { protect } = require('./middleware/authMiddleware');
const settingsRoutes = require('./routes/settingsRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const seedAdmin = require('./seed');

const app = express();

app.get('/', (req, res) => {
    res.send('KHN CHN Backend is Live! Use /api/health for system status.');
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    if (req.headers.authorization) console.log('Auth:', req.headers.authorization.slice(0, 15) + '...');
    next();
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({
    origin: '*', // Allows access from any frontend during testing
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/posters', posterRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
const deliveryAdminRoutes = require('./routes/deliveryAdminRoutes');
app.use('/api/admin/deliveryboys', protect, deliveryAdminRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'KHN CHN API is running!', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ FATAL ERROR: MONGO_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        seedAdmin();
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => console.log(`🚀 KHN CHN server on http://localhost:${PORT}`));
        }
    })
    .catch((err) => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });

module.exports = app;
