const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const ProviderProfile = require('../models/ProviderProfile');
const Dispute = require('../models/Dispute');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// @desc    Get Platform Analytics & KPI Summary
// @route   GET /api/analytics/dashboard
const getPlatformAnalytics = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await ProviderProfile.countDocuments({ verificationStatus: 'verified' });
    const pendingProviders = await ProviderProfile.countDocuments({ verificationStatus: 'pending' });

    const totalRequests = await ServiceRequest.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $in: ['SCHEDULED', 'IN_PROGRESS', 'WORK_COMPLETE'] } });
    const completedBookings = await Booking.countDocuments({ status: 'COMPLETED' });
    const openDisputes = await Dispute.countDocuments({ status: 'OPEN' });

    // Financial calculations
    const paidInvoices = await Invoice.find({ paymentStatus: 'PAID' });
    const totalPlatformVolume = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPlatformRevenue = paidInvoices.reduce((sum, inv) => sum + inv.platformFee, 0);

    // Recent audit logs
    const auditLogs = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Category breakdown
    const requestsByCategory = await ServiceRequest.aggregate([
      { $group: { _id: '$categoryName', count: { $sum: 1 } } }
    ]);

    res.json({
      metrics: {
        totalCustomers,
        totalProviders,
        pendingProviders,
        totalRequests,
        activeBookings,
        completedBookings,
        openDisputes,
        totalPlatformVolume,
        totalPlatformRevenue
      },
      requestsByCategory,
      auditLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlatformAnalytics };
