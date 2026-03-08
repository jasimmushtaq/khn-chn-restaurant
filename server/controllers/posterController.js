const Poster = require('../models/Poster');
const fs = require('fs');
const path = require('path');

// Helper to delete old image
const deleteImage = (imagePath) => {
    if (imagePath) {
        const fullPath = path.join(__dirname, '..', 'uploads', path.basename(imagePath));
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};

// @desc    Get all active posters
// @route   GET /api/posters
// @access  Public
const getAllPosters = async (req, res) => {
    try {
        const posters = await Poster.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: posters.length, posters });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch posters' });
    }
};

// @desc    Get all posters (admin)
// @route   GET /api/posters/admin
// @access  Private (Admin)
const getAllPostersAdmin = async (req, res) => {
    try {
        const posters = await Poster.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: posters.length, posters });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch posters' });
    }
};

// @desc    Create new poster
// @route   POST /api/posters
// @access  Private (Admin)
const createPoster = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please provide a title' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a poster image' });
        }

        const poster = await Poster.create({
            title,
            description: description || '',
            image: `/uploads/${req.file.filename}`,
        });

        res.status(201).json({ success: true, message: 'Poster created successfully', poster });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Failed to create poster' });
    }
};

// @desc    Update poster
// @route   PUT /api/posters/:id
// @access  Private (Admin)
const updatePoster = async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id);
        if (!poster) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Poster not found' });
        }

        const { title, description, isActive } = req.body;

        if (req.file) {
            deleteImage(poster.image);
            poster.image = `/uploads/${req.file.filename}`;
        }

        poster.title = title || poster.title;
        poster.description = description !== undefined ? description : poster.description;
        if (isActive !== undefined) poster.isActive = isActive === 'true';

        await poster.save();

        res.status(200).json({ success: true, message: 'Poster updated successfully', poster });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Failed to update poster' });
    }
};

// @desc    Delete poster
// @route   DELETE /api/posters/:id
// @access  Private (Admin)
const deletePoster = async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id);
        if (!poster) {
            return res.status(404).json({ success: false, message: 'Poster not found' });
        }

        deleteImage(poster.image);
        await poster.deleteOne();

        res.status(200).json({ success: true, message: 'Poster deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete poster' });
    }
};

module.exports = { getAllPosters, getAllPostersAdmin, createPoster, updatePoster, deletePoster };
