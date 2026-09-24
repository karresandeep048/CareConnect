/**
 * Availability Engine
 * Prevents overlapping provider bookings and validates booking time slots.
 */

const Booking = require('../models/Booking');

const checkProviderAvailability = async (providerId, scheduledDate, timeSlot, excludeBookingId = null) => {
  const query = {
    provider: providerId,
    scheduledDate: scheduledDate,
    timeSlot: timeSlot,
    status: { $in: ['SCHEDULED', 'IN_PROGRESS'] }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBooking = await Booking.findOne(query);

  if (existingBooking) {
    return {
      available: false,
      conflictBooking: existingBooking,
      message: `Provider is already booked for date ${scheduledDate} during slot (${timeSlot}).`
    };
  }

  return {
    available: true,
    message: 'Time slot is available.'
  };
};

module.exports = { checkProviderAvailability };
