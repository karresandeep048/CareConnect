const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  againstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: {
    type: String,
    enum: ['Poor Quality', 'Late Arrival', 'Damage Caused', 'Pricing Conflict', 'Work Incomplete', 'Other'],
    required: true
  },
  description: { type: String, required: true },
  evidenceUrls: [{ type: String }],
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
    default: 'OPEN'
  },
  resolution: {
    resolutionType: { type: String, enum: ['FULL_REFUND', 'PARTIAL_REFUND', 'RE_WORK', 'DISMISSED', 'NONE'] },
    refundAmount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
