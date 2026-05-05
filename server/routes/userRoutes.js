const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUserOrders,
    deleteUserProfile
} = require('../controllers/userController');
const { userProtect } = require('../middleware/userAuthMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', userProtect, getUserProfile);
router.put('/profile', userProtect, updateUserProfile);
router.delete('/profile', userProtect, deleteUserProfile);
router.get('/orders', userProtect, getUserOrders);

module.exports = router;
