const express = require('express');
const router = express.Router();
const { createReservation, getAllReservations, updateReservationStatus, deleteReservation } = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createReservation);
router.get('/', protect, getAllReservations);
router.put('/:id/status', protect, updateReservationStatus);
router.delete('/:id', protect, deleteReservation);

module.exports = router;
