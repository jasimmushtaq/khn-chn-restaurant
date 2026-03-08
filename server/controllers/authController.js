const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Admin Login
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check for approval
        if (!admin.isApproved) {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval by the main administrator.'
            });
        }

        const token = generateToken(admin._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                isMainAdmin: admin.isMainAdmin
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// @desc    Get Admin Profile
// @route   GET /api/auth/profile
// @access  Private
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-password');
        res.status(200).json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Register admin or delivery boy
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        if (role === 'admin') {
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ success: false, message: 'Admin already exists' });
            }

            const admin = await Admin.create({ email, password, isApproved: false });
            return res.status(201).json({
                success: true,
                message: 'Registration successful. Waiting for main admin approval.',
                admin: { id: admin._id, email: admin.email }
            });
        } else if (role === 'delivery') {
            const DeliveryBoy = require('../models/DeliveryBoy');
            const existingBoy = await DeliveryBoy.findOne({ email });
            if (existingBoy) {
                return res.status(400).json({ success: false, message: 'Delivery boy already exists' });
            }

            const deliveryBoy = await DeliveryBoy.create({ email, password, name, phone, isApproved: false });
            return res.status(201).json({
                success: true,
                message: 'Delivery boy registered successfully. Waiting for admin approval.',
                deliveryBoy: { id: deliveryBoy._id, email: deliveryBoy.email }
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// @desc    Get All Pending Accounts (Main Admin only)
// @route   GET /api/auth/pending-admins
// @access  Private (Main Admin)
const getPendingAdmins = async (req, res) => {
    try {
        const DeliveryBoy = require('../models/DeliveryBoy');
        const [pendingAdmins, pendingDelivery] = await Promise.all([
            Admin.find({ isApproved: false, isMainAdmin: false }).select('-password').lean(),
            DeliveryBoy.find({ isApproved: false }).select('-password').lean()
        ]);

        const pending = [
            ...pendingAdmins.map(a => ({ ...a, role: 'admin' })),
            ...pendingDelivery.map(d => ({ ...d, role: 'delivery' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ success: true, pending });
    } catch (error) {
        console.error('Fetch pending error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Approve Account (Main Admin only)
// @route   PUT /api/auth/approve-admin/:id
// @access  Private (Main Admin)
const approveAdmin = async (req, res) => {
    try {
        const { role } = req.body;
        let account;

        if (role === 'delivery') {
            const DeliveryBoy = require('../models/DeliveryBoy');
            account = await DeliveryBoy.findById(req.params.id);
        } else {
            account = await Admin.findById(req.params.id);
        }

        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        account.isApproved = true;
        await account.save();
        res.json({ success: true, message: 'Approved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get All Admins (Main Admin only)
// @route   GET /api/auth/admins
// @access  Private (Main Admin)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ isMainAdmin: { $ne: true } }).select('-password');
        res.json({ success: true, admins });
    } catch (error) {
        console.error('Fetch admins staff error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update Admin
// @route   PUT /api/auth/admins/:id
// @access  Private (Main Admin)
const updateAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const update = {};
        if (email) update.email = email;
        if (password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(password, salt);
        }
        const admin = await Admin.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
        res.json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete Admin
// @route   DELETE /api/auth/admins/:id
// @access  Private (Main Admin)
const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
        res.json({ success: true, message: 'Admin removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    loginAdmin,
    getAdminProfile,
    registerAdmin: registerUser,
    getPendingAdmins,
    approveAdmin,
    getAllAdmins,
    updateAdmin,
    deleteAdmin
};
