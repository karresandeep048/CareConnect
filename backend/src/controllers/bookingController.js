const Booking = require('../models/Booking');
const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const Invoice = require('../models/Invoice');
const ProviderProfile = require('../models/ProviderProfile');
const Coupon = require('../models/Coupon');
const { evaluateCoupon } = require('../services/couponService');
const { checkProviderAvailability } = require('../services/availabilityEngine');
const { createNotification } = require('../services/notificationService');

// @desc    Accept quote & create booking (locks provider slot & checks availability)
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { quoteId, couponCode } = req.body;
    if (!quoteId) return res.status(400).json({ message: 'Quote ID is required' });

    const quote = await Quote.findById(quoteId).populate('serviceRequest');
    if (!quote) return res.status(404).json({ message: 'Quote not found' });

    if (quote.status === 'ACCEPTED') {
      return res.status(400).json({ message: 'This quote has already been accepted.' });
    }

    if (quote.serviceRequest && quote.serviceRequest.status === 'BOOKED') {
      return res.status(400).json({ message: 'A quote for this service request has already been booked.' });
    }

    const scheduledDate = quote.proposedDate || quote.serviceRequest?.preferredDate || new Date().toISOString().split('T')[0];
    const timeSlot = quote.proposedTimeSlot || quote.serviceRequest?.preferredTimeSlot || '09:00 - 11:00';

    const providerId = quote.provider?._id || quote.provider;

    // Check availability slot using conflict engine
    const availabilityCheck = await checkProviderAvailability(providerId, scheduledDate, timeSlot);
    if (!availabilityCheck.available) {
      return res.status(400).json({ message: availabilityCheck.message });
    }

    // Validate optional coupon BEFORE locking anything
    let couponDoc = null;
    let discount = 0;
    if (couponCode && String(couponCode).trim()) {
      couponDoc = await Coupon.findOne({ code: String(couponCode).trim().toUpperCase() });
      const result = evaluateCoupon(couponDoc, quote.price);
      if (!result.valid) return res.status(400).json({ message: result.reason });
      discount = result.discount;
    }

    // Lock quote status
    quote.status = 'ACCEPTED';
    await quote.save();

    // Reject other quotes for this service request if serviceRequest exists
    if (quote.serviceRequest) {
      await Quote.updateMany(
        { serviceRequest: quote.serviceRequest._id, _id: { $ne: quote._id } },
        { status: 'REJECTED' }
      );

      // Update service request status to BOOKED
      const serviceRequest = await ServiceRequest.findById(quote.serviceRequest._id);
      if (serviceRequest) {
        serviceRequest.status = 'BOOKED';
        await serviceRequest.save();
      }
    }

    // Create Booking (verification pass will generate when service provider accepts and starts job)
    const booking = await Booking.create({
      serviceRequest: quote.serviceRequest?._id || quote.serviceRequest,
      quote: quote._id,
      customer: req.user._id,
      provider: quote.provider,
      scheduledDate,
      timeSlot,
      totalPrice: quote.price,
      status: 'SCHEDULED',
      verificationCode: ''
    });

    // Auto-generate invoice in UNPAID state
    const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
    const platformFee = Math.round(quote.price * 0.10); // 10% platform commission
    const laborCost = quote.price - platformFee;

    await Invoice.create({
      invoiceNumber: invoiceNum,
      booking: booking._id,
      customer: req.user._id,
      provider: quote.provider,
      laborCost,
      partsCost: 0,
      platformFee,
      taxAmount: Math.round(quote.price * 0.05),
      discountAmount: discount,
      couponCode: couponDoc ? couponDoc.code : '',
      totalAmount: Math.max(0, Math.round(quote.price * 1.05) - discount),
      paymentStatus: 'UNPAID'
    });
    if (couponDoc) {
      couponDoc.usedCount += 1;
      await couponDoc.save();
    }

    // Notify Provider about accepted quote and slot booking
    await createNotification({
      recipient: quote.provider,
      sender: req.user._id,
      title: '🎉 Quote Accepted & Slot Booked',
      message: `${req.user.name} accepted your quote of $${quote.price} and booked a service slot for ${scheduledDate} (${timeSlot}).`,
      type: 'QUOTE_ACCEPTED',
      relatedId: booking._id,
      link: '/provider-dashboard?tab=jobs'
    });

    // Notify Customer confirming booking
    await createNotification({
      recipient: req.user._id,
      sender: quote.provider,
      title: 'Booking Confirmed',
      message: `Your service slot has been booked for ${scheduledDate} (${timeSlot}).`,
      type: 'BOOKING_SCHEDULED',
      relatedId: booking._id,
      link: '/customer-dashboard?tab=bookings'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings (filtered by role)
// @route   GET /api/bookings
const getBookings = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    } else if (req.user.role === 'provider') {
      filter.provider = req.user._id;
    }

    let bookings = await Booking.find(filter)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate({
        path: 'serviceRequest',
        populate: { path: 'category' }
      })
      .sort({ createdAt: -1 });

    // Hide secret verificationCode from provider
    if (req.user.role === 'provider') {
      bookings = bookings.map(b => {
        const obj = b.toObject();
        delete obj.verificationCode;
        return obj;
      });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone avatar address')
      .populate('provider', 'name email phone avatar')
      .populate('serviceRequest')
      .populate('quote');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Ensure booking has a verification pass
    if (!booking.verificationCode) {
      booking.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      await booking.save();
    }

    const obj = booking.toObject();

    // Hide secret verificationCode whenever user is a provider
    if (req.user.role === 'provider') {
      delete obj.verificationCode;
    }

    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status & evidence (In Progress, Work Complete, Confirmed)
// @route   PUT /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status, beforePhotos, afterPhotos, completionNotes, noteText, verificationCode } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // When provider accepts the booking and moves to IN_PROGRESS, generate the customer's 4-digit pass
    if (status === 'IN_PROGRESS' || status === 'WORK_COMPLETE' || status === 'COMPLETED') {
      if (!booking.verificationCode) {
        booking.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      }
    }

    // Validate verification code if provided
    if (verificationCode) {
      if (verificationCode.toString().trim() !== booking.verificationCode.toString().trim()) {
        return res.status(400).json({ message: `Invalid Service Verification Code (${verificationCode}). Please request the correct 4-digit PIN from the customer.` });
      }
      booking.codeVerified = true;
    }

    // Admin & ops_manager can bypass the verification PIN requirement
    const isAdminOverride = ['admin', 'ops_manager'].includes(req.user.role);

    // Require verification code for WORK_COMPLETE or COMPLETED if not already verified
    if ((status === 'WORK_COMPLETE' || status === 'COMPLETED') && !booking.codeVerified && !isAdminOverride) {
      if (!verificationCode) {
        return res.status(400).json({ message: 'Customer 4-digit Service Verification PIN is required to complete and submit work proof.' });
      }
    }
    // Admin override: auto-mark code as verified
    if (isAdminOverride && (status === 'WORK_COMPLETE' || status === 'COMPLETED')) {
      booking.codeVerified = true;
    }

    if (status) {
      booking.status = status;
      if (status === 'WORK_COMPLETE' || status === 'COMPLETED') {
        booking.workEvidence.completedAt = new Date();
      }
    }

    if (beforePhotos) booking.workEvidence.beforePhotos = beforePhotos;
    if (afterPhotos) booking.workEvidence.afterPhotos = afterPhotos;
    if (completionNotes) booking.workEvidence.completionNotes = completionNotes;

    if (noteText) {
      booking.notes.push({
        sender: req.user._id,
        senderRole: req.user.role,
        text: noteText
      });
    }

    // If completed & confirmed, increment provider completed job count
    if (status === 'COMPLETED') {
      booking.customerSignoff.confirmed = true;
      booking.customerSignoff.confirmedAt = new Date();

      const profile = await ProviderProfile.findOne({ user: booking.provider });
      if (profile) {
        profile.completedJobsCount += 1;
        await profile.save();
      }

      // Also update linked ServiceRequest status
      const sReq = await ServiceRequest.findById(booking.serviceRequest);
      if (sReq) {
        sReq.status = 'COMPLETED';
        await sReq.save();
      }
    }

    await booking.save();

    // Trigger notifications based on job progress
    if (status === 'IN_PROGRESS') {
      await createNotification({
        recipient: booking.customer,
        sender: req.user._id,
        title: '🚀 Service Specialist In Progress',
        message: 'Your service specialist has arrived / started work. Your 4-digit Pass is active. Share it only after the job is completed.',
        type: 'JOB_IN_PROGRESS',
        relatedId: booking._id,
        link: '/customer-dashboard?tab=bookings'
      });
    } else if (status === 'WORK_COMPLETE' || status === 'COMPLETED') {
      await createNotification({
        recipient: booking.customer,
        sender: req.user._id,
        title: '✅ Work Completed & Verified',
        message: 'Your technician completed the service with verified pass. Please review the invoice and rate your experience.',
        type: 'JOB_COMPLETED',
        relatedId: booking._id,
        link: '/customer-dashboard?tab=invoices'
      });

      await createNotification({
        recipient: booking.provider,
        title: 'Job Completed Successfully',
        message: 'Customer verification PIN confirmed and job recorded in your completed pipeline.',
        type: 'JOB_COMPLETED',
        relatedId: booking._id,
        link: '/provider-dashboard?tab=jobs'
      });
    }

    const returnObj = booking.toObject();
    if (req.user.role === 'provider') {
      delete returnObj.verificationCode;
    }

    res.json(returnObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getBookings, getBookingById, updateBookingStatus };
