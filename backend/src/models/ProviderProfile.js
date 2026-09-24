const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "17:00"
  isAvailable: { type: Boolean, default: true }
});

const providerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true },
  bio: { type: String, default: '' },
  serviceCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' }],
  skills: [{ type: String }], // e.g. ["HVAC Repair", "Drain Unclogging", "Wiring"]
  serviceAreas: [{ type: String }], // Zip codes or cities served, e.g. ["10001", "10002", "New York"]
  hourlyRate: { type: Number, required: true, default: 45 },
  experienceYears: { type: Number, default: 3 },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'pending'
  },
  documents: [{
    docType: { type: String }, // e.g. "License", "Insurance", "ID"
    docUrl: { type: String },
    verifiedAt: Date
  }],
  availability: [availabilitySlotSchema],
  blockedDates: [{ type: String }], // YYYY-MM-DD
  ratingAvg: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  completedJobsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
