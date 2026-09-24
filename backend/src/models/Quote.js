const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile' },
  price: { type: Number, required: true },
  estimatedHours: { type: Number, required: true, default: 2 },
  notes: { type: String, default: '' },
  proposedDate: { type: String, required: true }, // YYYY-MM-DD
  proposedTimeSlot: { type: String, required: true }, // e.g. "09:00 - 11:00"
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
    default: 'PENDING'
  }
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);
