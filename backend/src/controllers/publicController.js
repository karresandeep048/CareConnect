const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc  Public, non-sensitive platform statistics for the landing page
// @route GET /api/public/stats
const getPublicStats = async (req, res) => {
  try {
    const [providers, verified, completedJobs, customers, ratingAgg] = await Promise.all([
      ProviderProfile.countDocuments(),
      ProviderProfile.countDocuments({ verificationStatus: 'verified' }),
      Booking.countDocuments({ status: 'COMPLETED' }),
      User.countDocuments({ role: 'customer' }),
      ProviderProfile.aggregate([{ $group: { _id: null, avg: { $avg: '$ratingAvg' } } }])
    ]);
    const reviews = await Review.countDocuments();
    res.json({
      providers,
      verifiedProviders: verified,
      completedJobs,
      customers,
      reviews,
      averageRating: ratingAgg[0] ? Number(ratingAgg[0].avg.toFixed(1)) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPublicStats };
