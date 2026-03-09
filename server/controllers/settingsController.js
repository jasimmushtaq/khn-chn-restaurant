const Settings = require('../models/Settings');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/uploadMiddleware');
const { cloudinary } = upload;

// Helper to delete image (local or Cloudinary)
const deleteImage = async (imagePath) => {
    if (!imagePath) return;

    if (imagePath.includes('cloudinary.com')) {
        try {
            const parts = imagePath.split('/');
            const filename = parts[parts.length - 1];
            const folder = parts[parts.length - 2];
            const publicId = `${folder}/${filename.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Cloudinary delete error:', error);
        }
    } else {
        const fullPath = path.join(__dirname, '..', imagePath.startsWith('/') ? imagePath.slice(1) : imagePath);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
            } catch (error) {
                console.error('Local file delete error:', error);
            }
        }
    }
};

exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.status(200).json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }

        if (req.files) {
            if (req.files.orderQrCode && req.files.orderQrCode[0]) {
                await deleteImage(settings.orderQrCode);
                settings.orderQrCode = req.files.orderQrCode[0].path;
            }

            if (req.files.cancelQrCode && req.files.cancelQrCode[0]) {
                await deleteImage(settings.cancelQrCode);
                settings.cancelQrCode = req.files.cancelQrCode[0].path;
            }
        }

        await settings.save();
        res.status(200).json({ success: true, settings, message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
