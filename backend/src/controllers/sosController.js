const ServiceRequest = require('../models/ServiceRequest');
const ServiceCategory = require('../models/ServiceCategory');
const ProviderProfile = require('../models/ProviderProfile');
const { classifyServiceRequest } = require('../services/aiClassification');
const { rankProvidersForRequest } = require('../services/providerMatching');
const { createNotification } = require('../services/notificationService');

const EMERGENCY_SURCHARGE = 1.25; // 25% priority dispatch premium
const DISPATCH_COUNT = 3;

// @desc    Emergency SOS: classify, create an Emergency request and instantly alert the best-matched providers
// @route   POST /api/requests/sos
const createSOSRequest = async (req, res) => {
  try {
    const { description, serviceAddress } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Please describe the emergency' });
    }
    const zipCode = serviceAddress?.zipCode || req.user.address?.zipCode;
    if (!zipCode) {
      return res.status(400).json({ message: 'A service zip code is required for emergency dispatch' });
    }

    const ai = await classifyServiceRequest(description);
    const categoryDoc = await ServiceCategory.findOne({ name: new RegExp(ai.categoryName.split(' ')[0], 'i') });

    const request = await ServiceRequest.create({
      customer: req.user._id,
      category: categoryDoc ? categoryDoc._id : null,
      categoryName: categoryDoc ? categoryDoc.name : ai.categoryName,
      title: `SOS: ${ai.categoryName} emergency`,
      description,
      urgency: 'Emergency',
      skillsRequired: ai.skillsRequired,
      estimatedCostRange: {
        min: Math.round(ai.estimatedCostRange.min * EMERGENCY_SURCHARGE),
        max: Math.round(ai.estimatedCostRange.max * EMERGENCY_SURCHARGE)
      },
      estimatedDurationHours: ai.estimatedDurationHours,
      serviceAddress: {
        street: serviceAddress?.street || req.user.address?.street,
        city: serviceAddress?.city || req.user.address?.city,
        state: serviceAddress?.state || req.user.address?.state,
        zipCode
      },
      aiMetadata: {
        classifiedCategory: ai.categoryName,
        confidenceScore: ai.confidenceScore,
        extractedKeyTerms: ai.extractedKeyTerms
      }
    });

    const profiles = await ProviderProfile.find({ verificationStatus: 'verified' }).populate('user', 'name avatar phone');
    const top = rankProvidersForRequest(request, profiles).slice(0, DISPATCH_COUNT);

    await Promise.all(top.map(({ providerProfile, matchScore }) => createNotification({
      recipient: providerProfile.user._id,
      sender: req.user._id,
      title: 'Emergency job - respond now',
      message: `${req.user.name} reported a ${request.categoryName} emergency in ${zipCode} (${matchScore}% match). Submit a quote immediately.`,
      type: 'SERVICE_REQUEST',
      relatedId: request._id,
      link: '/provider-dashboard?tab=feed'
    })));

    await createNotification({
      recipient: req.user._id,
      title: 'SOS dispatched',
      message: `We alerted ${top.length} verified ${request.categoryName} pros near ${zipCode}. Expect quotes shortly.`,
      type: 'SERVICE_REQUEST',
      relatedId: request._id,
      link: '/customer-dashboard?tab=requests'
    });

    res.status(201).json({
      request,
      surchargePercent: Math.round((EMERGENCY_SURCHARGE - 1) * 100),
      dispatched: top.map(({ providerProfile, matchScore, matchReasons }) => ({
        providerId: providerProfile.user._id,
        name: providerProfile.user.name,
        businessName: providerProfile.businessName,
        rating: providerProfile.ratingAvg,
        hourlyRate: providerProfile.hourlyRate,
        matchScore,
        matchReasons
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSOSRequest };
