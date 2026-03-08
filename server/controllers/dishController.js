const Dish = require('../models/Dish');
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

// @desc    Get all dishes
// @route   GET /api/dishes
// @access  Public
const getAllDishes = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = {};
        if (category && category !== 'All') filter.category = category;

        const dishes = await Dish.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: dishes.length, dishes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dishes' });
    }
};

// @desc    Get single dish
// @route   GET /api/dishes/:id
// @access  Public
const getDishById = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id);
        if (!dish) {
            return res.status(404).json({ success: false, message: 'Dish not found' });
        }
        res.status(200).json({ success: true, dish });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dish' });
    }
};

// @desc    Create new dish
// @route   POST /api/dishes
// @access  Private (Admin)
const createDish = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        if (!name || !description || !price) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please provide name, description, and price' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a dish image' });
        }

        const dish = await Dish.create({
            name,
            description,
            price: parseFloat(price),
            category: category || 'Main Course',
            image: `/uploads/${req.file.filename}`,
        });

        res.status(201).json({ success: true, message: 'Dish created successfully', dish });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Failed to create dish' });
    }
};

// @desc    Update dish
// @route   PUT /api/dishes/:id
// @access  Private (Admin)
const updateDish = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id);
        if (!dish) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Dish not found' });
        }

        const { name, description, price, category, isAvailable } = req.body;

        if (req.file) {
            deleteImage(dish.image);
            dish.image = `/uploads/${req.file.filename}`;
        }

        dish.name = name || dish.name;
        dish.description = description || dish.description;
        dish.price = price ? parseFloat(price) : dish.price;
        dish.category = category || dish.category;
        if (isAvailable !== undefined) dish.isAvailable = isAvailable === 'true';

        await dish.save();

        res.status(200).json({ success: true, message: 'Dish updated successfully', dish });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Failed to update dish' });
    }
};

// @desc    Delete dish
// @route   DELETE /api/dishes/:id
// @access  Private (Admin)
const deleteDish = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id);
        if (!dish) {
            return res.status(404).json({ success: false, message: 'Dish not found' });
        }

        deleteImage(dish.image);
        await dish.deleteOne();

        res.status(200).json({ success: true, message: 'Dish deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete dish' });
    }
};

module.exports = { getAllDishes, getDishById, createDish, updateDish, deleteDish };
