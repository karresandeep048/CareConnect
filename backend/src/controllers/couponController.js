const Coupon = require('../models/Coupon');
const { evaluateCoupon } = require('../services/couponService');

// @route POST /api/coupons/validate   body: { code, amount }
const validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) return res.status(400).json({ valid: false, reason: 'Enter a coupon code' });
    const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
    const result = evaluateCoupon(coupon, Number(amount) || 0);
    res.json({ ...result, code: coupon ? coupon.code : null, description: coupon ? coupon.description : '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/coupons  (active offers, shown on the Rewards strip)
const listCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }]
    }).select('code description discountPercent maxDiscount minOrderValue');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { validateCoupon, listCoupons };
