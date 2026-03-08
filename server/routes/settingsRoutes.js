const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getSettings);
router.put('/', protect, upload.fields([{ name: 'orderQrCode', maxCount: 1 }, { name: 'cancelQrCode', maxCount: 1 }]), updateSettings);

module.exports = router;
