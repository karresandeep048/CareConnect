const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  maxDiscount: { type: Number, default: 100 },      // cap in currency units
  minOrderValue: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 0 },          // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
