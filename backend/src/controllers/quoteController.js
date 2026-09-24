const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const ProviderProfile = require('../models/ProviderProfile');
const { createNotification } = require('../services/notificationService');

// @desc    Submit a quote for a service request (Provider)
// @route   POST /api/quotes
const createQuote = async (req, res) => {
  try {
    const { serviceRequestId, price, estimatedHours, notes, proposedDate, proposedTimeSlot } = req.body;

    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) return res.status(404).json({ message: 'Service request not found' });

    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });

    // Check if quote already submitted by this provider
    const existingQuote = await Quote.findOne({ serviceRequest: serviceRequestId, provider: req.user._id });
    if (existingQuote) {
      return res.status(400).json({ message: 'You have already submitted a quote for this request' });
    }

    const quote = await Quote.create({
      serviceRequest: serviceRequestId,
      provider: req.user._id,
      providerProfile: providerProfile ? providerProfile._id : null,
      price,
      estimatedHours: estimatedHours || 2,
      notes: notes || '',
      proposedDate: proposedDate || serviceRequest.preferredDate || new Date().toISOString().split('T')[0],
      proposedTimeSlot: proposedTimeSlot || serviceRequest.preferredTimeSlot || '09:00 - 11:00'
    });

    // Update service request status to QUOTED
    if (serviceRequest.status === 'OPEN') {
      serviceRequest.status = 'QUOTED';
      await serviceRequest.save();
    }

    // Notify Customer about new quote
    await createNotification({
      recipient: serviceRequest.customer,
      sender: req.user._id,
      title: 'New Service Quote Received',
      message: `${req.user.name} submitted a price quote of $${price} for "${serviceRequest.title}".`,
      type: 'QUOTE_SUBMITTED',
      relatedId: quote._id,
      link: '/customer-dashboard?tab=requests'
    });

    // Notify Provider of successful submission
    await createNotification({
      recipient: req.user._id,
      title: 'Quote Submitted Successfully',
      message: `Your quote of $${price} for "${serviceRequest.title}" was submitted to the customer.`,
      type: 'QUOTE_SUBMITTED',
      relatedId: quote._id,
      link: '/provider-dashboard?tab=quotes'
    });

    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quotes for a specific request or for a provider
// @route   GET /api/quotes
const getQuotes = async (req, res) => {
  try {
    const { serviceRequestId } = req.query;
    let filter = {};

    if (serviceRequestId) {
      filter.serviceRequest = serviceRequestId;
    } else if (req.user.role === 'provider') {
      filter.provider = req.user._id;
    }

    const quotes = await Quote.find(filter)
      .populate('provider', 'name email phone avatar')
      .populate('providerProfile')
      .populate('serviceRequest')
      .sort({ createdAt: -1 });

    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createQuote, getQuotes };
