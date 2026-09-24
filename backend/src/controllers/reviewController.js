const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');

// @desc    Submit a review for a completed booking
// @route   POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, punctualityRating, qualityRating, communicationRating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'A review has already been submitted for this booking' });
    }

    const providerProfile = await ProviderProfile.findOne({ user: booking.provider });
    if (!providerProfile) return res.status(404).json({ message: 'Provider profile not found' });

    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      provider: booking.provider,
      providerProfile: providerProfile._id,
      rating,
      punctualityRating: punctualityRating || 5,
      qualityRating: qualityRating || 5,
      communicationRating: communicationRating || 5,
      comment
    });

    // Recompute provider profile dynamic rating average
    const allReviews = await Review.find({ providerProfile: providerProfile._id });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    providerProfile.reviewCount = allReviews.length;
    providerProfile.ratingAvg = parseFloat((totalRating / allReviews.length).toFixed(1));
    await providerProfile.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getProviderReviews };
