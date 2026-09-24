/**
 * Pure coupon evaluation logic (no DB access) so it can be unit-tested.
 * Returns { valid, reason?, discount, finalAmount }.
 */
const evaluateCoupon = (coupon, orderAmount, now = new Date()) => {
  const fail = (reason) => ({ valid: false, reason, discount: 0, finalAmount: orderAmount });

  if (!coupon) return fail('Coupon code not found');
  if (!coupon.isActive) return fail('This coupon is no longer active');
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return fail('This coupon has expired');
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return fail('This coupon has reached its usage limit');
  if (orderAmount < (coupon.minOrderValue || 0)) return fail(`Minimum order value for this coupon is $${coupon.minOrderValue}`);

  const raw = (orderAmount * coupon.discountPercent) / 100;
  const discount = Math.round(Math.min(raw, coupon.maxDiscount || raw));
  return { valid: true, discount, finalAmount: Math.max(0, orderAmount - discount) };
};

module.exports = { evaluateCoupon };
