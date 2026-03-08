const Reservation = require('../models/Reservation');

const createReservation = async (req, res) => {
    try {
        const { name, phone, guests, date, time, notes } = req.body;
        if (!name || !phone || !guests || !date || !time) {
            return res.status(400).json({ success: false, message: 'All required fields must be filled' });
        }
        const reservation = await Reservation.create({ name, phone, guests, date, time, notes });
        res.status(201).json({ success: true, message: 'Reservation confirmed!', reservation });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        res.json({ success: true, reservations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateReservationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
        res.json({ success: true, reservation });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteReservation = async (req, res) => {
    try {
        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Reservation deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createReservation, getAllReservations, updateReservationStatus, deleteReservation };
