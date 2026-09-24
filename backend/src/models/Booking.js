const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  quote: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledDate: { type: String, required: true }, // YYYY-MM-DD
  timeSlot: { type: String, required: true }, // "09:00 - 11:00"
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'WORK_COMPLETE', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
    default: 'SCHEDULED'
  },
  verificationCode: { type: String, default: '' },
  codeVerified: { type: Boolean, default: false },
  workEvidence: {
    beforePhotos: [{ type: String }],
    afterPhotos: [{ type: String }],
    completionNotes: { type: String, default: '' },
    completedAt: { type: Date }
  },
  customerSignoff: {
    confirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date }
  },
  notes: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderRole: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
