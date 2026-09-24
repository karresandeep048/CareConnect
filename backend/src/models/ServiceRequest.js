const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
  categoryName: { type: String, default: 'General Maintenance' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
  skillsRequired: [{ type: String }],
  estimatedCostRange: {
    min: { type: Number, default: 50 },
    max: { type: Number, default: 200 }
  },
  estimatedDurationHours: { type: Number, default: 2 },
  serviceAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: { type: String, required: true }
  },
  preferredDate: { type: String }, 
  preferredTimeSlot: { type: String }, 
  attachments: [{ type: String }],
  targetProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['OPEN', 'QUOTED', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'OPEN'
  },
  aiMetadata: {
    classifiedCategory: String,
    confidenceScore: Number,
    extractedKeyTerms: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
