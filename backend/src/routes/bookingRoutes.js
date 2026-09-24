const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getBookingById, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
