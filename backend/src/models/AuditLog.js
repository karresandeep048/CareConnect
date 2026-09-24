const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. "PROVIDER_VERIFIED", "DISPUTE_RESOLVED", "REFUND_ISSUED"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetResource: { type: String }, // e.g. "User", "Dispute", "Booking"
  targetResourceId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
