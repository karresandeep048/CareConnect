const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');
const ProviderProfile = require('../models/ProviderProfile');
const { classifyServiceRequest } = require('../services/aiClassification');
const { rankProvidersForRequest } = require('../services/providerMatching');
const { detectIntent } = require('../services/assistantEngine');

const DEFAULT_SUGGESTIONS = ['How does CareConnect work?', 'My kitchen sink is leaking', 'Any discount coupons?', 'Track my latest booking'];

const softAuth = async (req) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer')) return null;
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch (e) {
    return null;
  }
};


// Classify free text, then rank verified providers for it (shared by the chatbot and the Cost Estimator page)
const buildEstimate = async (description, user) => {
  const ai = await classifyServiceRequest(description);
  const pseudoRequest = {
    skillsRequired: ai.skillsRequired,
    categoryName: ai.categoryName,
    serviceAddress: { zipCode: user?.address?.zipCode || '' },
    estimatedCostRange: ai.estimatedCostRange,
    estimatedDurationHours: ai.estimatedDurationHours
  };
  const profiles = await ProviderProfile.find({ verificationStatus: 'verified' }).populate('user', 'name avatar');
  const providers = rankProvidersForRequest(pseudoRequest, profiles).slice(0, 3).map(({ providerProfile, matchScore, matchReasons }) => ({
    id: providerProfile.user._id,
    name: providerProfile.user.name,
    avatar: providerProfile.user.avatar,
    businessName: providerProfile.businessName,
    rating: providerProfile.ratingAvg,
    hourlyRate: providerProfile.hourlyRate,
    matchScore,
    matchReasons
  }));
  return { estimate: ai, providers };
};

// @desc    Cost estimate + top provider matches for a free-text problem (public)
// @route   POST /api/assistant/estimate   body: { description }
const estimate = async (req, res) => {
  try {
    const description = String(req.body.description || '').slice(0, 800);
    if (!description.trim()) return res.status(400).json({ message: 'Describe the problem first' });
    const user = await softAuth(req);
    res.json(await buildEstimate(description, user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    CareBot conversational assistant
// @route   POST /api/assistant/chat   body: { message }
const chat = async (req, res) => {
  try {
    const message = String(req.body.message || '').slice(0, 500);
    if (!message.trim()) return res.status(400).json({ message: 'Message is required' });

    const user = await softAuth(req);
    const intent = detectIntent(message);
    let payload;

    switch (intent) {
      case 'greeting':
        payload = { reply: `Hi${user ? ' ' + user.name.split(' ')[0] : ''}! I'm CareBot. Describe a home problem and I'll classify it, estimate the cost and suggest the best-matched verified pros.` };
        break;

      case 'emergency':
        payload = {
          reply: 'If anyone is in danger (gas smell, fire, electric shock) call your local emergency number first. For urgent repairs, use the red SOS button - we classify the issue and instantly alert the top 3 matched verified pros near you.',
          action: user && user.role === 'customer' ? { label: 'Open SOS', to: '/customer-dashboard?sos=1' } : { label: 'Log in to use SOS', to: '/login' }
        };
        break;

      case 'status': {
        if (!user) { payload = { reply: 'Please log in so I can look up your bookings.', action: { label: 'Log in', to: '/login' } }; break; }
        const filter = user.role === 'provider' ? { provider: user._id } : { customer: user._id };
        const latest = await Booking.find(filter).sort({ createdAt: -1 }).limit(3);
        payload = latest.length
          ? { reply: 'Here are your most recent bookings:', bookings: latest.map((b) => ({ id: b._id, status: b.status, date: b.scheduledDate, slot: b.timeSlot, price: b.totalPrice })) }
          : { reply: "You don't have any bookings yet. Describe a problem and I'll help you get started." };
        break;
      }

      case 'coupon': {
        const coupons = await Coupon.find({ isActive: true }).limit(4).select('code description discountPercent maxDiscount');
        payload = coupons.length
          ? { reply: 'Active offers - apply the code while accepting a quote:', coupons }
          : { reply: 'There are no active coupons right now. Check back soon!' };
        break;
      }

      case 'refund':
        payload = { reply: 'You can cancel before the provider starts the job. If work quality is an issue, raise a dispute from the booking page with photo evidence - our Support team reviews it and can issue a full or partial refund.' };
        break;

      case 'howto':
        payload = { reply: 'It takes 4 steps: 1) describe your problem (AI classifies it), 2) compare quotes from matched pros, 3) accept a quote to lock a conflict-free time slot, 4) track the job, approve the proof-of-work photos and pay securely.', action: { label: 'Try the cost estimator', to: '/estimate' } };
        break;

      case 'pricing':
      case 'problem': {
        const { estimate, providers } = await buildEstimate(message, user);
        payload = {
          reply: `Looks like a ${estimate.categoryName} job (${Math.round(estimate.confidenceScore * 100)}% confidence, ${estimate.urgency.toLowerCase()} urgency). Typical cost is $${estimate.estimatedCostRange.min}-$${estimate.estimatedCostRange.max} and about ${estimate.estimatedDurationHours}h of work.`,
          estimate,
          providers,
          action: user ? { label: 'Create a request', to: '/customer-dashboard?tab=requests' } : { label: 'Sign up to book', to: '/register' }
        };
        break;
      }

      default:
        payload = { reply: "I can help with cost estimates, finding pros, coupons, booking status and cancellations. Try describing your problem, e.g. \"my AC is not cooling\"." };
    }

    res.json({ intent, suggestions: DEFAULT_SUGGESTIONS, ...payload });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chat, estimate };
