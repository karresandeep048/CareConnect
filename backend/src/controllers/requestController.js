const ServiceRequest = require('../models/ServiceRequest');
const ServiceCategory = require('../models/ServiceCategory');
const { classifyServiceRequest } = require('../services/aiClassification');
const { createNotification } = require('../services/notificationService');

// @desc    Trigger AI Classification on free-text description
// @route   POST /api/requests/ai-classify
const aiClassifyText = async (req, res) => {
  try {
    const { description } = req.body;
    const aiResult = await classifyServiceRequest(description);
    res.json(aiResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service request
// @route   POST /api/requests
const createServiceRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      serviceAddress,
      preferredDate,
      preferredTimeSlot,
      categoryId,
      categoryName,
      targetProvider,
      urgency,
      skillsRequired
    } = req.body;

    // Run AI classification automatically
    let aiResult = {
      categoryName: categoryName || 'General Maintenance',
      urgency: urgency || 'Medium',
      skillsRequired: skillsRequired || ['General Maintenance'],
      estimatedCostRange: { min: 50, max: 200 },
      estimatedDurationHours: 2,
      confidenceScore: 0.9,
      extractedKeyTerms: []
    };
    try {
      if (description) {
        aiResult = await classifyServiceRequest(description);
      }
    } catch (e) {
      console.warn('AI classification fallback:', e.message);
    }

    const finalCategoryName = categoryName || aiResult.categoryName;

    // Try finding matching category document
    let categoryDoc = null;
    if (categoryId) {
      categoryDoc = await ServiceCategory.findById(categoryId);
    }
    if (!categoryDoc && finalCategoryName) {
      categoryDoc = await ServiceCategory.findOne({ name: new RegExp(finalCategoryName, 'i') });
    }

    const newRequest = await ServiceRequest.create({
      customer: req.user._id,
      category: categoryDoc ? categoryDoc._id : null,
      categoryName: categoryDoc ? categoryDoc.name : finalCategoryName,
      title,
      description,
      targetProvider: targetProvider || null,
      urgency: urgency || aiResult.urgency,
      skillsRequired: skillsRequired || (categoryDoc ? [categoryDoc.name] : aiResult.skillsRequired),
      estimatedCostRange: aiResult.estimatedCostRange,
      estimatedDurationHours: aiResult.estimatedDurationHours,
      serviceAddress,
      preferredDate,
      preferredTimeSlot,
      aiMetadata: {
        classifiedCategory: finalCategoryName,
        confidenceScore: aiResult.confidenceScore || 0.95,
        extractedKeyTerms: aiResult.extractedKeyTerms || []
      }
    });

    await newRequest.populate([
      { path: 'customer', select: 'name email phone avatar' },
      { path: 'category' },
      { path: 'targetProvider', select: 'name email phone avatar' }
    ]);

    // Send notification to Customer
    await createNotification({
      recipient: req.user._id,
      title: 'Service Request Created',
      message: `Your service request for "${newRequest.title}" (${newRequest.categoryName}) was successfully submitted.`,
      type: 'SERVICE_REQUEST',
      relatedId: newRequest._id,
      link: '/customer-dashboard?tab=requests'
    });

    // If target provider was chosen, send direct notification to Provider
    if (newRequest.targetProvider) {
      await createNotification({
        recipient: newRequest.targetProvider._id || newRequest.targetProvider,
        sender: req.user._id,
        title: '🎯 Direct Customer Service Request',
        message: `${req.user.name} specifically selected you for a "${newRequest.categoryName}" job in ${newRequest.serviceAddress?.zipCode || 'your area'}.`,
        type: 'SERVICE_REQUEST',
        relatedId: newRequest._id,
        link: '/provider-dashboard?tab=feed'
      });
    }

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get service requests (Customer own, Provider area feed, or Ops manager platform-wide)
// @route   GET /api/requests
const getServiceRequests = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    } else if (req.user.role === 'provider') {
      // Show open or quoted requests that are either open to all OR targeted to this provider
      filter.status = { $in: ['OPEN', 'QUOTED'] };
      filter.$or = [
        { targetProvider: null },
        { targetProvider: { $exists: false } },
        { targetProvider: req.user._id }
      ];
    }

    const requests = await ServiceRequest.find(filter)
      .populate('customer', 'name email phone avatar')
      .populate('category')
      .populate('targetProvider', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single service request details
// @route   GET /api/requests/:id
const getServiceRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate('category')
      .populate('targetProvider', 'name email phone avatar');

    if (!request) return res.status(404).json({ message: 'Service request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update service request status
// @route   PUT /api/requests/:id/status
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Service request not found' });

    request.status = status;
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  aiClassifyText,
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateRequestStatus
};
