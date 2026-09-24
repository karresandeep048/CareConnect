const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  laborCost: { type: Number, required: true },
  partsCost: { type: Number, default: 0 },
  platformFee: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'UNPAID'
  },
  paymentMethod: { type: String, default: 'Credit Card / Digital Wallet' },
  paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
