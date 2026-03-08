const Settings = require('../models/Settings');
const fs = require('fs');
const path = require('path');

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
                const oldPath = settings.orderQrCode;
                if (oldPath && oldPath.startsWith('/uploads/')) {
                    const fullOldPath = path.join(__dirname, '..', oldPath.replace(/^\//, ''));
                    try {
                        if (fs.existsSync(fullOldPath)) fs.unlinkSync(fullOldPath);
                    } catch (e) { console.error('Error deleting old QR:', e); }
                }
                settings.orderQrCode = '/uploads/' + req.files.orderQrCode[0].filename;
            }

            if (req.files.cancelQrCode && req.files.cancelQrCode[0]) {
                const oldPath = settings.cancelQrCode;
                if (oldPath && oldPath.startsWith('/uploads/')) {
                    const fullOldPath = path.join(__dirname, '..', oldPath.replace(/^\//, ''));
                    try {
                        if (fs.existsSync(fullOldPath)) fs.unlinkSync(fullOldPath);
                    } catch (e) { console.error('Error deleting old cancellation QR:', e); }
                }
                settings.cancelQrCode = '/uploads/' + req.files.cancelQrCode[0].filename;
            }
        }

        await settings.save();
        res.status(200).json({ success: true, settings, message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
