const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile, registerAdmin, getPendingAdmins, approveAdmin, getAllAdmins, updateAdmin, deleteAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', protect, getAdminProfile);
router.get('/pending-admins', protect, getPendingAdmins);
router.put('/approve-admin/:id', protect, approveAdmin);

// Staff management
router.get('/staff', protect, getAllAdmins);
router.put('/staff/:id', protect, updateAdmin);
router.delete('/staff/:id', protect, deleteAdmin);

module.exports = router;
