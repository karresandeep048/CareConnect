const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');

// @desc    Open a dispute for a booking
// @route   POST /api/disputes
const createDispute = async (req, res) => {
  try {
    const { bookingId, reason, description, evidenceUrls } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const againstUser = req.user._id.toString() === booking.customer.toString()
      ? booking.provider
      : booking.customer;

    const ticketId = `DISP-${Date.now().toString().slice(-6)}`;

    const dispute = await Dispute.create({
      ticketId,
      booking: bookingId,
      raisedBy: req.user._id,
      againstUser,
      reason,
      description,
      evidenceUrls: evidenceUrls || [],
      status: 'OPEN'
    });

    // Mark booking status as DISPUTED
    booking.status = 'DISPUTED';
    await booking.save();

    res.status(201).json(dispute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all disputes (Support Agent / Ops Manager / Admin sees all, users see their own)
// @route   GET /api/disputes
const getDisputes = async (req, res) => {
  try {
    let filter = {};

    if (['customer', 'provider'].includes(req.user.role)) {
      filter.$or = [{ raisedBy: req.user._id }, { againstUser: req.user._id }];
    }

    const disputes = await Dispute.find(filter)
      .populate('raisedBy', 'name email phone avatar role')
      .populate('againstUser', 'name email phone avatar role')
      .populate('assignedAgent', 'name email')
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve dispute (Support Agent / Ops Manager / Admin)
// @route   PUT /api/disputes/:id/resolve
const resolveDispute = async (req, res) => {
  try {
    const { resolutionType, refundAmount, notes } = req.body;
    const dispute = await Dispute.findById(req.params.id).populate('booking');
    if (!dispute) return res.status(404).json({ message: 'Dispute ticket not found' });

    dispute.status = 'RESOLVED';
    dispute.resolution = {
      resolutionType: resolutionType || 'FULL_REFUND',
      refundAmount: refundAmount || 0,
      notes: notes || 'Resolved by Support Agent',
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    };
    await dispute.save();

    // Handle invoice refund status if applicable
    if (refundAmount > 0 && dispute.booking) {
      const invoice = await Invoice.findOne({ booking: dispute.booking._id });
      if (invoice) {
        invoice.paymentStatus = refundAmount >= invoice.totalAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
        await invoice.save();
      }
    }

    // Log audit event
    await AuditLog.create({
      action: 'DISPUTE_RESOLVED',
      performedBy: req.user._id,
      targetResource: 'Dispute',
      targetResourceId: dispute._id.toString(),
      details: { ticketId: dispute.ticketId, resolutionType, refundAmount }
    });

    res.json({ message: 'Dispute ticket resolved successfully', dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDispute, getDisputes, resolveDispute };
