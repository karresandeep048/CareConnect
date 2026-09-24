const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');
const { createNotification } = require('../services/notificationService');

// @desc    Get user invoices
// @route   GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const { bookingId } = req.query;
    let filter = {};

    if (bookingId) filter.booking = bookingId;
    else if (req.user.role === 'customer') filter.customer = req.user._id;
    else if (req.user.role === 'provider') filter.provider = req.user._id;

    const invoices = await Invoice.find(filter)
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pay an invoice (Customer)
// @route   POST /api/invoices/:id/pay
const payInvoice = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (invoice.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Invoice is already paid' });
    }

    invoice.paymentStatus = 'PAID';
    invoice.paymentMethod = paymentMethod || 'Credit Card / Digital Wallet';
    invoice.paidAt = new Date();
    await invoice.save();

    await AuditLog.create({
      action: 'INVOICE_PAID',
      performedBy: req.user._id,
      targetResource: 'Invoice',
      targetResourceId: invoice._id.toString(),
      details: { amount: invoice.totalAmount, invoiceNumber: invoice.invoiceNumber }
    });

    // Notify Provider of payment receipt
    await createNotification({
      recipient: invoice.provider,
      sender: req.user._id,
      title: '💰 Payment Received',
      message: `$${invoice.totalAmount} was paid by ${req.user.name} for Invoice #${invoice.invoiceNumber}.`,
      type: 'INVOICE_PAID',
      relatedId: invoice._id,
      link: '/provider-dashboard?tab=jobs'
    });

    // Notify Customer confirming payment
    await createNotification({
      recipient: req.user._id,
      title: 'Invoice Payment Confirmed',
      message: `Your payment of $${invoice.totalAmount} for Invoice #${invoice.invoiceNumber} was processed successfully.`,
      type: 'INVOICE_PAID',
      relatedId: invoice._id,
      link: '/customer-dashboard?tab=invoices'
    });

    res.json({ message: 'Payment successful', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInvoices, payInvoice };
