const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  punctualityRating: { type: Number, min: 1, max: 5, default: 5 },
  qualityRating: { type: Number, min: 1, max: 5, default: 5 },
  communicationRating: { type: Number, min: 1, max: 5, default: 5 },
  comment: { type: String, required: true, trim: true },
  responseFromProvider: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
