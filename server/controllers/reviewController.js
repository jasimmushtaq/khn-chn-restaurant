const Review = require('../models/Review');

const createReview = async (req, res) => {
    try {
        const { name, message, rating } = req.body;
        if (!name || !message) {
            return res.status(400).json({ success: false, message: 'Name and message are required' });
        }
        const review = await Review.create({ name, message, rating: rating || 5 });
        res.status(201).json({ success: true, message: 'Thank you for your feedback!', review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createReview, getAllReviews, deleteReview };
