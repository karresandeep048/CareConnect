// Run with: npm test   (uses Node's built-in test runner - no extra dependencies)
const test = require('node:test');
const assert = require('node:assert');
const { classifyServiceRequest } = require('../services/aiClassification');
const { rankProvidersForRequest } = require('../services/providerMatching');
const { evaluateCoupon } = require('../services/couponService');
const { detectIntent } = require('../services/assistantEngine');

test('AI classifier maps a leaking sink to Plumbing', async () => {
  const r = await classifyServiceRequest('My kitchen sink pipe is leaking and the drain is clogged');
  assert.strictEqual(r.categoryName, 'Plumbing');
  assert.ok(r.confidenceScore >= 0.65 && r.confidenceScore <= 0.98);
  assert.ok(r.extractedKeyTerms.includes('leak'));
});

test('AI classifier detects emergency urgency', async () => {
  const r = await classifyServiceRequest('Emergency! Sparks from the outlet and burning smell');
  assert.strictEqual(r.categoryName, 'Electrical Work');
  assert.ok(['High', 'Emergency'].includes(r.urgency));
});

test('AI classifier falls back on empty text', async () => {
  const r = await classifyServiceRequest('   ');
  assert.strictEqual(r.confidenceScore, 0.5);
});

test('Provider ranking prefers verified, skilled, in-area, better-rated providers', () => {
  const request = { skillsRequired: ['Plumbing'], serviceAddress: { zipCode: '10001' }, categoryName: 'Plumbing', estimatedCostRange: { max: 220 }, estimatedDurationHours: 2 };
  const strong = { skills: ['Plumbing'], serviceAreas: ['10001'], verificationStatus: 'verified', ratingAvg: 4.9, hourlyRate: 50 };
  const weak = { skills: ['Painting'], serviceAreas: ['99999'], verificationStatus: 'pending', ratingAvg: 3.2, hourlyRate: 200 };
  const ranked = rankProvidersForRequest(request, [weak, strong]);
  assert.strictEqual(ranked[0].providerProfile, strong);
  assert.ok(ranked[0].matchScore > ranked[1].matchScore);
  assert.ok(ranked[0].matchScore <= 99);
});

test('Coupon: percentage discount is capped by maxDiscount', () => {
  const c = { isActive: true, discountPercent: 20, maxDiscount: 50, minOrderValue: 100, usageLimit: 0, usedCount: 0 };
  assert.deepStrictEqual(evaluateCoupon(c, 200), { valid: true, discount: 40, finalAmount: 160 });
  assert.strictEqual(evaluateCoupon(c, 1000).discount, 50);
});

test('Coupon: rejects expired, exhausted, inactive and below-minimum orders', () => {
  const base = { isActive: true, discountPercent: 10, maxDiscount: 30, minOrderValue: 100, usageLimit: 5, usedCount: 0 };
  assert.strictEqual(evaluateCoupon(null, 100).valid, false);
  assert.strictEqual(evaluateCoupon({ ...base, isActive: false }, 200).valid, false);
  assert.strictEqual(evaluateCoupon({ ...base, expiresAt: new Date('2020-01-01') }, 200).valid, false);
  assert.strictEqual(evaluateCoupon({ ...base, usedCount: 5 }, 200).valid, false);
  assert.strictEqual(evaluateCoupon(base, 50).valid, false);
});

test('CareBot intent detection', () => {
  assert.strictEqual(detectIntent('Hello there'), 'greeting');
  assert.strictEqual(detectIntent('There is a gas smell in my kitchen'), 'emergency');
  assert.strictEqual(detectIntent('Track my latest booking'), 'status');
  assert.strictEqual(detectIntent('Any discount coupons?'), 'coupon');
  assert.strictEqual(detectIntent('My kitchen sink is leaking'), 'problem');
  assert.strictEqual(detectIntent('How much to fix a fridge?'), 'pricing');
  assert.strictEqual(detectIntent('How does CareConnect work?'), 'howto');
  assert.strictEqual(detectIntent('blah blah'), 'fallback');
});
