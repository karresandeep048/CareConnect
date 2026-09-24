const mongoose = require('mongoose');
const ProviderProfile = require('../models/ProviderProfile');
const ServiceCategory = require('../models/ServiceCategory');
const ServiceRequest = require('../models/ServiceRequest');
const AuditLog = require('../models/AuditLog');
const { rankProvidersForRequest } = require('../services/providerMatching');

// @desc    Get all providers with filters
// @route   GET /api/providers
const getProviders = async (req, res) => {
  try {
    const { skill, zipCode, verificationStatus, minRating, category } = req.query;
    let query = {};

    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };
    if (zipCode) query.serviceAreas = { $in: [zipCode] };
    if (minRating) query.ratingAvg = { $gte: parseFloat(minRating) };

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.serviceCategories = category;
      } else {
        const catDoc = await ServiceCategory.findOne({ name: new RegExp(category, 'i') });
        if (catDoc) {
          query.$or = [
            { serviceCategories: catDoc._id },
            { skills: { $in: [new RegExp(category, 'i')] } }
          ];
        } else {
          query.skills = { $in: [new RegExp(category, 'i')] };
        }
      }
    }

    const providers = await ProviderProfile.find(query)
      .populate('user', 'name email phone avatar status')
      .populate('serviceCategories', 'name slug icon');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI Rank providers for a specific service request
// @route   GET /api/providers/match/:requestId
const matchProvidersForRequest = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.requestId);
    if (!serviceRequest) return res.status(404).json({ message: 'Service request not found' });

    const allProfiles = await ProviderProfile.find().populate('user', 'name email phone avatar status');
    const ranked = rankProvidersForRequest(serviceRequest, allProfiles);
    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single provider profile by ID or User ID
// @route   GET /api/providers/:id
const getProviderById = async (req, res) => {
  try {
    let profile = await ProviderProfile.findById(req.params.id).populate('user', 'name email phone avatar status').populate('serviceCategories');
    if (!profile) {
      profile = await ProviderProfile.findOne({ user: req.params.id }).populate('user', 'name email phone avatar status').populate('serviceCategories');
    }
    if (!profile) return res.status(404).json({ message: 'Provider profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update provider profile (Provider owner)
// @route   PUT /api/providers/profile
const updateProviderProfile = async (req, res) => {
  try {
    let profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await ProviderProfile.create({
        user: req.user._id,
        businessName: `${req.user.name}'s Service Pro`,
        hourlyRate: 50
      });
    }

    const { businessName, bio, skills, serviceAreas, hourlyRate, experienceYears, availability, documents } = req.body;
    if (businessName) profile.businessName = businessName;
    if (bio !== undefined) profile.bio = bio;
    if (skills) profile.skills = skills;
    if (serviceAreas) profile.serviceAreas = serviceAreas;
    if (hourlyRate !== undefined) profile.hourlyRate = hourlyRate;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;
    if (availability) profile.availability = availability;
    if (documents) profile.documents = documents;

    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify or Update Provider Status (Admin / Ops Manager)
// @route   PUT /api/providers/:id/verify
const verifyProvider = async (req, res) => {
  try {
    const { status } = req.body; // 'verified', 'rejected', 'pending'
    const profile = await ProviderProfile.findById(req.params.id).populate('user');
    if (!profile) return res.status(404).json({ message: 'Provider profile not found' });

    profile.verificationStatus = status;
    await profile.save();

    // Log audit action
    await AuditLog.create({
      action: 'PROVIDER_VERIFICATION_UPDATED',
      performedBy: req.user._id,
      targetResource: 'ProviderProfile',
      targetResourceId: profile._id.toString(),
      details: { status, providerEmail: profile.user?.email }
    });

    res.json({ message: `Provider status updated to ${status}`, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProviders,
  matchProvidersForRequest,
  getProviderById,
  updateProviderProfile,
  verifyProvider
};
