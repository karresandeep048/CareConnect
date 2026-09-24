require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const ServiceCategory = require('../models/ServiceCategory');
const ServiceRequest = require('../models/ServiceRequest');
const Quote = require('../models/Quote');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const AuditLog = require('../models/AuditLog');
const Coupon = require('../models/Coupon');

const seedData = async () => {
  try {
    console.log('[Seed] Starting database seeding process...');

    // Clear existing collections
    await User.deleteMany({});
    await ProviderProfile.deleteMany({});
    await ServiceCategory.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Quote.deleteMany({});
    await Booking.deleteMany({});
    await Invoice.deleteMany({});
    await Review.deleteMany({});
    await Dispute.deleteMany({});
    await AuditLog.deleteMany({});
    await Coupon.deleteMany({});

    console.log('[Seed] Cleared existing database records.');

    // Promotional coupons
    const inThreeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    await Coupon.insertMany([
      { code: 'WELCOME10', description: '10% off your first booking', discountPercent: 10, maxDiscount: 30, minOrderValue: 0, expiresAt: inThreeMonths },
      { code: 'CARE20', description: '20% off jobs above $100 (max $50)', discountPercent: 20, maxDiscount: 50, minOrderValue: 100, expiresAt: inThreeMonths },
      { code: 'FIXIT15', description: '15% off any repair (max $40)', discountPercent: 15, maxDiscount: 40, minOrderValue: 50, expiresAt: inThreeMonths }
    ]);

    // =============================================
    // 1. CREATE USERS FOR ALL 5 ROLES
    // =============================================
    const password = 'Password123!';

    const customerUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'customer@careconnect.com',
      password,
      role: 'customer',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      address: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'NY', zipCode: '10001' }
    });

    const providerUser1 = await User.create({
      name: 'Marcus Vance',
      email: 'provider@careconnect.com',
      password,
      role: 'provider',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      address: { street: '12 Main St', city: 'Springfield', state: 'NY', zipCode: '10001' }
    });

    const providerUser2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.provider@careconnect.com',
      password,
      role: 'provider',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      address: { street: '45 Oak Ave', city: 'Springfield', state: 'NY', zipCode: '10002' }
    });

    const providerUser3 = await User.create({
      name: 'James Okafor',
      email: 'james.provider@careconnect.com',
      password,
      role: 'provider',
      phone: '+1 (555) 321-7890',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      address: { street: '88 Cedar Blvd', city: 'Springfield', state: 'NY', zipCode: '10003' }
    });

    // Extra customer for disputes / richer data
    const customerUser2 = await User.create({
      name: 'Michael Torres',
      email: 'michael.customer@careconnect.com',
      password,
      role: 'customer',
      phone: '+1 (555) 111-2222',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      address: { street: '55 Pine St', city: 'Springfield', state: 'NY', zipCode: '10002' }
    });

    const adminUser = await User.create({
      name: 'Alex Rivera',
      email: 'admin@careconnect.com',
      password,
      role: 'admin',
      phone: '+1 (555) 000-1111',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    });

    const opsUser = await User.create({
      name: 'David Chen',
      email: 'ops@careconnect.com',
      password,
      role: 'ops_manager',
      phone: '+1 (555) 222-3333',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
    });

    const supportUser = await User.create({
      name: 'Rachel Taylor',
      email: 'support@careconnect.com',
      password,
      role: 'support_agent',
      phone: '+1 (555) 444-5555',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });

    console.log('[Seed] Created all demo users.');

    // =============================================
    // 2. CREATE SERVICE CATEGORIES
    // =============================================
    const catAppliance = await ServiceCategory.create({
      name: 'Appliance Repair',
      slug: 'appliance-repair',
      description: 'Refrigerator, washing machine, oven, dishwasher & appliance diagnostics.',
      icon: 'Tv',
      subcategories: [
        { name: 'Refrigerator Repair', skillsRequired: ['Appliance Repair', 'Refrigeration'], basePriceEstimate: 120 },
        { name: 'Washing Machine Repair', skillsRequired: ['Appliance Repair', 'Plumbing'], basePriceEstimate: 95 }
      ]
    });

    const catPlumbing = await ServiceCategory.create({
      name: 'Plumbing',
      slug: 'plumbing',
      description: 'Leak repairs, drain unclogging, water heater installation & pipe fitting.',
      icon: 'Droplet',
      subcategories: [
        { name: 'Drain Unclogging', skillsRequired: ['Plumbing', 'Drain Cleaning'], basePriceEstimate: 80 },
        { name: 'Pipe Repair & Fitting', skillsRequired: ['Pipe Fitting', 'Plumbing'], basePriceEstimate: 150 }
      ]
    });

    const catElectrical = await ServiceCategory.create({
      name: 'Electrical Work',
      slug: 'electrical-work',
      description: 'Circuit breaker fixes, wiring, light fixture installation & outlet repair.',
      icon: 'Zap',
      subcategories: [
        { name: 'Lighting & Fixtures', skillsRequired: ['Electrical Wiring', 'Lighting Installation'], basePriceEstimate: 90 },
        { name: 'Breaker Panel Maintenance', skillsRequired: ['Circuit Breaker Repair'], basePriceEstimate: 180 }
      ]
    });

    const catHVAC = await ServiceCategory.create({
      name: 'HVAC & Climate Control',
      slug: 'hvac-climate-control',
      description: 'Air conditioning, heating, thermostat calibration & duct servicing.',
      icon: 'Wind',
      subcategories: [
        { name: 'AC Servicing & Repair', skillsRequired: ['HVAC Maintenance', 'AC Repair'], basePriceEstimate: 130 }
      ]
    });

    const catCleaning = await ServiceCategory.create({
      name: 'Cleaning & Maintenance',
      slug: 'cleaning-maintenance',
      description: 'Deep house cleaning, carpet sanitization & window washing.',
      icon: 'Sparkles',
      subcategories: [
        { name: 'Deep Home Cleaning', skillsRequired: ['Deep Cleaning', 'Sanitization'], basePriceEstimate: 110 }
      ]
    });

    const catHandyman = await ServiceCategory.create({
      name: 'Handyman & General Repair',
      slug: 'handyman-general-repair',
      description: 'Drywall patching, furniture assembly, TV mounting & door fixes.',
      icon: 'Hammer',
      subcategories: [
        { name: 'Furniture Assembly', skillsRequired: ['Furniture Assembly', 'General Repair'], basePriceEstimate: 60 },
        { name: 'TV & Wall Mounting', skillsRequired: ['Wall Mounting', 'General Repair'], basePriceEstimate: 75 }
      ]
    });

    console.log('[Seed] Created 6 service categories.');

    // =============================================
    // 3. CREATE PROVIDER PROFILES
    // =============================================
    const providerProfile1 = await ProviderProfile.create({
      user: providerUser1._id,
      businessName: 'Vance Appliance & HVAC Master Solutions',
      bio: 'Licensed technician with over 8 years experience in high-end home appliances, HVAC units, and plumbing emergency repair. Certified Samsung & LG service partner.',
      serviceCategories: [catAppliance._id, catPlumbing._id, catHVAC._id],
      skills: ['Appliance Repair', 'Refrigeration', 'Electrical Diagnostics', 'Plumbing', 'Drain Cleaning', 'AC Repair', 'HVAC Maintenance'],
      serviceAreas: ['10001', '10002', '10003', 'Springfield'],
      hourlyRate: 65,
      experienceYears: 8,
      verificationStatus: 'verified',
      ratingAvg: 4.9,
      reviewCount: 28,
      completedJobsCount: 42,
      availability: [
        { dayOfWeek: 'Monday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 'Friday', startTime: '08:00', endTime: '18:00', isAvailable: true }
      ]
    });

    const providerProfile2 = await ProviderProfile.create({
      user: providerUser2._id,
      businessName: 'Rostova Electric & Smart Home Installs',
      bio: 'Certified master electrician specializing in panel upgrades, smart thermostats, EV chargers, and general handyman repairs. 6 years of excellence.',
      serviceCategories: [catElectrical._id, catHandyman._id],
      skills: ['Electrical Wiring', 'Circuit Breaker Repair', 'Lighting Installation', 'Furniture Assembly', 'General Repair', 'TV Mounting', 'Smart Home'],
      serviceAreas: ['10001', '10002', 'Springfield'],
      hourlyRate: 75,
      experienceYears: 6,
      verificationStatus: 'verified',
      ratingAvg: 4.8,
      reviewCount: 19,
      completedJobsCount: 31,
      availability: [
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
      ]
    });

    const providerProfile3 = await ProviderProfile.create({
      user: providerUser3._id,
      businessName: 'Okafor Deep Clean & Home Care Pros',
      bio: 'Professional deep cleaning service with eco-friendly products. Also handles general handyman tasks and minor repairs. 4 years in business.',
      serviceCategories: [catCleaning._id, catHandyman._id],
      skills: ['Deep Cleaning', 'Sanitization', 'Carpet Cleaning', 'Window Washing', 'General Repair', 'Furniture Assembly'],
      serviceAreas: ['10001', '10002', '10003'],
      hourlyRate: 45,
      experienceYears: 4,
      verificationStatus: 'pending',
      ratingAvg: 4.6,
      reviewCount: 12,
      completedJobsCount: 18,
      availability: [
        { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '15:00', isAvailable: true }
      ]
    });

    console.log('[Seed] Created 3 provider profiles.');

    // =============================================
    // 4. CREATE SERVICE REQUESTS (8 total)
    // =============================================

    // Sarah's requests
    const request1 = await ServiceRequest.create({
      customer: customerUser._id,
      category: catAppliance._id,
      categoryName: 'Appliance Repair',
      title: 'Refrigerator leaking water & not cooling properly',
      description: 'My Samsung French Door refrigerator started leaking water underneath yesterday and the temperature inside is blowing warm air. Food is spoiling.',
      urgency: 'High',
      skillsRequired: ['Appliance Repair', 'Refrigeration'],
      estimatedCostRange: { min: 75, max: 250 },
      estimatedDurationHours: 2,
      serviceAddress: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'NY', zipCode: '10001' },
      preferredDate: '2026-09-24',
      preferredTimeSlot: '09:00 - 11:00',
      status: 'BOOKED',
      aiMetadata: {
        classifiedCategory: 'Appliance Repair',
        confidenceScore: 0.95,
        extractedKeyTerms: ['refrigerator', 'leaking water', 'cooling', 'Samsung']
      }
    });

    const request2 = await ServiceRequest.create({
      customer: customerUser._id,
      category: catElectrical._id,
      categoryName: 'Electrical Work',
      title: 'Kitchen outlet sparking when plugging in microwave',
      description: 'The wall receptacle near the counter emitted a spark and tripped the breaker panel. Need urgent inspection.',
      urgency: 'High',
      skillsRequired: ['Electrical Wiring', 'Circuit Breaker Repair'],
      estimatedCostRange: { min: 80, max: 220 },
      estimatedDurationHours: 1.5,
      serviceAddress: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'NY', zipCode: '10001' },
      preferredDate: '2026-09-25',
      preferredTimeSlot: '13:00 - 15:00',
      status: 'OPEN',
      aiMetadata: {
        classifiedCategory: 'Electrical Work',
        confidenceScore: 0.94,
        extractedKeyTerms: ['spark', 'outlet', 'breaker', 'microwave']
      }
    });

    const request3 = await ServiceRequest.create({
      customer: customerUser._id,
      category: catPlumbing._id,
      categoryName: 'Plumbing',
      title: 'Bathroom drain completely clogged — shower flooding',
      description: 'Shower drain is backing up with standing water. Tried Drano already and it did not work. Need professional drain snaking.',
      urgency: 'Medium',
      skillsRequired: ['Plumbing', 'Drain Cleaning'],
      estimatedCostRange: { min: 60, max: 160 },
      estimatedDurationHours: 1,
      serviceAddress: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'NY', zipCode: '10001' },
      preferredDate: '2026-09-26',
      preferredTimeSlot: '10:00 - 12:00',
      status: 'OPEN',
      aiMetadata: {
        classifiedCategory: 'Plumbing',
        confidenceScore: 0.91,
        extractedKeyTerms: ['drain', 'clogged', 'shower', 'flooding']
      }
    });

    const request4 = await ServiceRequest.create({
      customer: customerUser._id,
      category: catHVAC._id,
      categoryName: 'HVAC & Climate Control',
      title: 'AC unit blowing warm air — system not cooling',
      description: 'Central air conditioner stopped cooling two days ago. Fan still runs but no cold air. House is 89°F inside.',
      urgency: 'High',
      skillsRequired: ['HVAC Maintenance', 'AC Repair'],
      estimatedCostRange: { min: 100, max: 280 },
      estimatedDurationHours: 2.5,
      serviceAddress: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'NY', zipCode: '10001' },
      preferredDate: '2026-09-23',
      preferredTimeSlot: '08:00 - 10:00',
      status: 'BOOKED',
      aiMetadata: {
        classifiedCategory: 'HVAC & Climate Control',
        confidenceScore: 0.97,
        extractedKeyTerms: ['AC', 'warm air', 'not cooling', 'central air']
      }
    });

    // Michael's requests
    const request5 = await ServiceRequest.create({
      customer: customerUser2._id,
      category: catElectrical._id,
      categoryName: 'Electrical Work',
      title: 'Install 4 new recessed lights in living room',
      description: 'Want to install 4 LED recessed lights in the living room ceiling. Currently just have one overhead fixture. Need wiring run from panel.',
      urgency: 'Low',
      skillsRequired: ['Electrical Wiring', 'Lighting Installation'],
      estimatedCostRange: { min: 200, max: 450 },
      estimatedDurationHours: 4,
      serviceAddress: { street: '55 Pine St', city: 'Springfield', state: 'NY', zipCode: '10002' },
      preferredDate: '2026-09-27',
      preferredTimeSlot: '09:00 - 13:00',
      status: 'OPEN',
      aiMetadata: {
        classifiedCategory: 'Electrical Work',
        confidenceScore: 0.88,
        extractedKeyTerms: ['recessed lights', 'LED', 'wiring', 'panel']
      }
    });

    const request6 = await ServiceRequest.create({
      customer: customerUser2._id,
      category: catCleaning._id,
      categoryName: 'Cleaning & Maintenance',
      title: 'Deep clean 4-bedroom house before tenant move-in',
      description: 'Need a full professional deep clean of a 4BR/2BA house. Previous tenants left. Requires kitchen degreasing, bathroom sanitization, and carpet cleaning.',
      urgency: 'Medium',
      skillsRequired: ['Deep Cleaning', 'Sanitization'],
      estimatedCostRange: { min: 150, max: 300 },
      estimatedDurationHours: 5,
      serviceAddress: { street: '55 Pine St', city: 'Springfield', state: 'NY', zipCode: '10002' },
      preferredDate: '2026-09-26',
      preferredTimeSlot: '08:00 - 13:00',
      status: 'BOOKED',
      aiMetadata: {
        classifiedCategory: 'Cleaning & Maintenance',
        confidenceScore: 0.93,
        extractedKeyTerms: ['deep clean', '4 bedroom', 'tenant', 'sanitization']
      }
    });

    const request7 = await ServiceRequest.create({
      customer: customerUser._id,
      category: catHandyman._id,
      categoryName: 'Handyman & General Repair',
      title: 'Assemble 6-piece IKEA bedroom furniture set',
      description: 'Need help assembling IKEA MALM bed frame, 2 nightstands, dresser, wardrobe, and desk. All boxes are already in the bedroom.',
      urgency: 'Low',
      skillsRequired: ['Furniture Assembly', 'General Repair'],
      estimatedCostRange: { min: 80, max: 150 },
      estimatedDurationHours: 3,
      serviceAddress: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'NY', zipCode: '10001' },
      preferredDate: '2026-09-28',
      preferredTimeSlot: '10:00 - 13:00',
      status: 'OPEN',
      aiMetadata: {
        classifiedCategory: 'Handyman & General Repair',
        confidenceScore: 0.9,
        extractedKeyTerms: ['IKEA', 'furniture assembly', 'bedroom', 'dresser']
      }
    });

    const request8 = await ServiceRequest.create({
      customer: customerUser._id,
      category: catPlumbing._id,
      categoryName: 'Plumbing',
      title: 'Replace kitchen faucet & fix under-sink leak',
      description: 'Kitchen faucet drips constantly and the pipe under the sink has a slow leak staining the cabinet floor. Have replacement faucet already.',
      urgency: 'Medium',
      skillsRequired: ['Pipe Fitting', 'Plumbing'],
      estimatedCostRange: { min: 90, max: 180 },
      estimatedDurationHours: 1.5,
      serviceAddress: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'NY', zipCode: '10001' },
      preferredDate: '2026-09-25',
      preferredTimeSlot: '14:00 - 16:00',
      status: 'COMPLETED',
      aiMetadata: {
        classifiedCategory: 'Plumbing',
        confidenceScore: 0.92,
        extractedKeyTerms: ['faucet', 'leak', 'kitchen', 'pipe']
      }
    });

    console.log('[Seed] Created 8 service requests.');

    // =============================================
    // 5. CREATE QUOTES
    // =============================================

    // Quote for Request 1 (Refrigerator - ACCEPTED)
    const quote1 = await Quote.create({
      serviceRequest: request1._id,
      provider: providerUser1._id,
      providerProfile: providerProfile1._id,
      price: 130,
      estimatedHours: 2,
      notes: 'I carry genuine OEM Samsung replacement valves and refrigerant leak detection tools. Will diagnose and fix same day.',
      proposedDate: '2026-09-24',
      proposedTimeSlot: '09:00 - 11:00',
      status: 'ACCEPTED'
    });

    // Competing quote for Request 1 (from provider2 - PENDING)
    const quote1b = await Quote.create({
      serviceRequest: request1._id,
      provider: providerUser2._id,
      providerProfile: providerProfile2._id,
      price: 155,
      estimatedHours: 2.5,
      notes: 'Can handle Samsung appliance repairs. Will arrive with diagnostic equipment.',
      proposedDate: '2026-09-24',
      proposedTimeSlot: '10:00 - 12:00',
      status: 'PENDING'
    });

    // Quote for Request 4 (AC - ACCEPTED)
    const quote4 = await Quote.create({
      serviceRequest: request4._id,
      provider: providerUser1._id,
      providerProfile: providerProfile1._id,
      price: 185,
      estimatedHours: 2.5,
      notes: 'Most likely low refrigerant or faulty compressor. Will run full diagnostic + recharge if needed.',
      proposedDate: '2026-09-23',
      proposedTimeSlot: '08:00 - 10:00',
      status: 'ACCEPTED'
    });

    // Quote for Request 6 (Deep clean - ACCEPTED)
    const quote6 = await Quote.create({
      serviceRequest: request6._id,
      provider: providerUser3._id,
      providerProfile: providerProfile3._id,
      price: 220,
      estimatedHours: 5,
      notes: 'Full team of 3 will handle all rooms simultaneously. Eco-friendly products included.',
      proposedDate: '2026-09-26',
      proposedTimeSlot: '08:00 - 13:00',
      status: 'ACCEPTED'
    });

    // Quote for Request 8 (Plumbing - ACCEPTED, for completed job)
    const quote8 = await Quote.create({
      serviceRequest: request8._id,
      provider: providerUser1._id,
      providerProfile: providerProfile1._id,
      price: 110,
      estimatedHours: 1.5,
      notes: 'Faucet replacement and pipe fitting is my specialty. Will bring compression fittings.',
      proposedDate: '2026-09-25',
      proposedTimeSlot: '14:00 - 16:00',
      status: 'ACCEPTED'
    });

    // Open quote for Request 2 (Electrical - still competing)
    const quote2a = await Quote.create({
      serviceRequest: request2._id,
      provider: providerUser2._id,
      providerProfile: providerProfile2._id,
      price: 145,
      estimatedHours: 2,
      notes: 'Outlet and breaker issue sounds like a GFCI failure. Quick fix. I stock all standard parts.',
      proposedDate: '2026-09-25',
      proposedTimeSlot: '13:00 - 15:00',
      status: 'PENDING'
    });

    console.log('[Seed] Created quotes.');

    // =============================================
    // 6. CREATE BOOKINGS
    // =============================================

    // Booking 1: Refrigerator Repair - IN_PROGRESS (Sarah + Marcus)
    const booking1 = await Booking.create({
      serviceRequest: request1._id,
      quote: quote1._id,
      customer: customerUser._id,
      provider: providerUser1._id,
      scheduledDate: '2026-09-24',
      timeSlot: '09:00 - 11:00',
      totalPrice: 130,
      status: 'IN_PROGRESS',
      verificationCode: 'VRF-4821',
      workEvidence: {
        beforePhotos: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'],
        afterPhotos: [],
        completionNotes: 'Diagnosed faulty water inlet valve. Replaced valve assembly and cleared drain tube. Temperature now stabilizing.'
      },
      notes: [
        { sender: customerUser._id, senderRole: 'customer', text: 'Side gate is unlocked. Please buzz front bell on arrival.' },
        { sender: providerUser1._id, senderRole: 'provider', text: 'On my way! ETA 9:15 AM. Have all Samsung parts loaded.' }
      ]
    });

    // Booking 2: AC Repair - SCHEDULED (Sarah + Marcus)
    const booking2 = await Booking.create({
      serviceRequest: request4._id,
      quote: quote4._id,
      customer: customerUser._id,
      provider: providerUser1._id,
      scheduledDate: '2026-09-23',
      timeSlot: '08:00 - 10:00',
      totalPrice: 185,
      status: 'SCHEDULED',
      verificationCode: 'VRF-7733',
      workEvidence: {
        beforePhotos: [],
        afterPhotos: [],
        completionNotes: ''
      },
      notes: [
        { sender: customerUser._id, senderRole: 'customer', text: 'AC unit is in the backyard. Gate code is 1234.' }
      ]
    });

    // Booking 3: Deep Cleaning - COMPLETED (Michael + James)
    const booking3 = await Booking.create({
      serviceRequest: request6._id,
      quote: quote6._id,
      customer: customerUser2._id,
      provider: providerUser3._id,
      scheduledDate: '2026-09-22',
      timeSlot: '08:00 - 13:00',
      totalPrice: 220,
      status: 'COMPLETED',
      verificationCode: 'VRF-9901',
      workEvidence: {
        beforePhotos: [
          'https://images.unsplash.com/photo-1527515637462-cff94aca790e?w=400',
          'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'
        ],
        afterPhotos: [
          'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?w=400',
          'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400'
        ],
        completionNotes: 'Full deep clean completed. All bathrooms sanitized, kitchen degreased, carpets steam cleaned. Customer confirmed satisfaction.'
      },
      notes: [
        { sender: providerUser3._id, senderRole: 'provider', text: 'Job completed! All rooms cleaned to professional standard.' },
        { sender: customerUser2._id, senderRole: 'customer', text: 'Excellent work! The house looks brand new. Will definitely book again.' }
      ]
    });

    // Booking 4: Kitchen Faucet / Plumbing - COMPLETED (Sarah + Marcus)
    const booking4 = await Booking.create({
      serviceRequest: request8._id,
      quote: quote8._id,
      customer: customerUser._id,
      provider: providerUser1._id,
      scheduledDate: '2026-09-20',
      timeSlot: '14:00 - 16:00',
      totalPrice: 110,
      status: 'COMPLETED',
      verificationCode: 'VRF-2255',
      workEvidence: {
        beforePhotos: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400'],
        afterPhotos: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'],
        completionNotes: 'Replaced faucet cartridge and installed new compression fitting under sink. No more drip or leak. Tested for 10 minutes.'
      },
      notes: [
        { sender: providerUser1._id, senderRole: 'provider', text: 'Faucet and pipe fixed. All dry and tested.' }
      ]
    });

    console.log('[Seed] Created 4 bookings.');

    // =============================================
    // 7. CREATE INVOICES
    // =============================================

    // Invoice for Booking 1 (In Progress - UNPAID)
    await Invoice.create({
      invoiceNumber: 'INV-882194',
      booking: booking1._id,
      customer: customerUser._id,
      provider: providerUser1._id,
      laborCost: 117,
      partsCost: 0,
      platformFee: 13,
      taxAmount: 6.50,
      totalAmount: 136.50,
      paymentStatus: 'UNPAID'
    });

    // Invoice for Booking 2 (Scheduled - UNPAID)
    await Invoice.create({
      invoiceNumber: 'INV-882195',
      booking: booking2._id,
      customer: customerUser._id,
      provider: providerUser1._id,
      laborCost: 166.50,
      partsCost: 0,
      platformFee: 18.50,
      taxAmount: 9.25,
      totalAmount: 194.25,
      paymentStatus: 'UNPAID'
    });

    // Invoice for Booking 3 (Completed - PAID)
    await Invoice.create({
      invoiceNumber: 'INV-775301',
      booking: booking3._id,
      customer: customerUser2._id,
      provider: providerUser3._id,
      laborCost: 198,
      partsCost: 0,
      platformFee: 22,
      taxAmount: 11,
      totalAmount: 231,
      paymentStatus: 'PAID',
      paidAt: new Date('2026-09-22T15:30:00Z')
    });

    // Invoice for Booking 4 (Completed - PAID)
    await Invoice.create({
      invoiceNumber: 'INV-661042',
      booking: booking4._id,
      customer: customerUser._id,
      provider: providerUser1._id,
      laborCost: 99,
      partsCost: 0,
      platformFee: 11,
      taxAmount: 5.50,
      totalAmount: 115.50,
      paymentStatus: 'PAID',
      paidAt: new Date('2026-09-20T17:00:00Z')
    });

    console.log('[Seed] Created 4 invoices.');

    // =============================================
    // 8. CREATE REVIEWS
    // =============================================

    await Review.create({
      booking: booking3._id,
      customer: customerUser2._id,
      provider: providerUser3._id,
      providerProfile: providerProfile3._id,
      rating: 5,
      punctualityRating: 5,
      qualityRating: 5,
      communicationRating: 5,
      comment: 'James and his team did an incredible job. The house is spotless! Very professional, punctual, and thorough. Highly recommend.',
      responseFromProvider: 'Thank you so much for the kind words! It was our pleasure to serve you.'
    });

    await Review.create({
      booking: booking4._id,
      customer: customerUser._id,
      provider: providerUser1._id,
      providerProfile: providerProfile1._id,
      rating: 5,
      punctualityRating: 5,
      qualityRating: 5,
      communicationRating: 4,
      comment: 'Marcus fixed everything quickly and professionally. No mess left behind. Will hire again for any plumbing needs!',
      responseFromProvider: 'Appreciate the review! Always happy to help with any home repairs.'
    });

    console.log('[Seed] Created reviews.');

    // =============================================
    // 9. CREATE DISPUTES (for Support Agent dashboard)
    // =============================================

    const dispute1 = await Dispute.create({
      ticketId: 'TICKET-001',
      booking: booking1._id,
      raisedBy: customerUser._id,
      againstUser: providerUser1._id,
      reason: 'Poor Quality',
      description: 'The refrigerator is still making a rattling noise after the repair. Provider said it was fixed but the issue persists. Requesting partial refund of $40.',
      status: 'OPEN'
    });

    const dispute2 = await Dispute.create({
      ticketId: 'TICKET-002',
      booking: booking2._id,
      raisedBy: customerUser._id,
      againstUser: providerUser1._id,
      reason: 'Late Arrival',
      description: 'Provider was 2 hours late to the scheduled appointment and did not notify in advance. Requesting $20 discount for the inconvenience.',
      status: 'UNDER_REVIEW'
    });

    const dispute3 = await Dispute.create({
      ticketId: 'TICKET-003',
      booking: booking3._id,
      raisedBy: customerUser2._id,
      againstUser: providerUser3._id,
      reason: 'Pricing Conflict',
      description: 'Final invoice was $11 higher than the quoted price. Provider added extra charges not mentioned in the quote.',
      status: 'RESOLVED',
      resolution: {
        resolutionType: 'PARTIAL_REFUND',
        refundAmount: 11,
        notes: 'Verified the price discrepancy. Issued $11 refund to customer. Provider reminded to honor original quotes.',
        resolvedAt: new Date('2026-09-22T18:00:00Z'),
        resolvedBy: supportUser._id
      }
    });

    console.log('[Seed] Created 3 dispute tickets.');

    // =============================================
    // 10. CREATE AUDIT LOGS (for Admin dashboard)
    // =============================================

    await AuditLog.create({
      action: 'SYSTEM_INITIALIZED',
      performedBy: adminUser._id,
      targetResource: 'System',
      details: { seedDate: new Date(), version: '2.0' }
    });

    await AuditLog.create({
      action: 'PROVIDER_VERIFIED',
      performedBy: adminUser._id,
      targetResource: 'ProviderProfile',
      details: { providerId: providerProfile1._id, businessName: 'Vance Appliance & HVAC Master Solutions' }
    });

    await AuditLog.create({
      action: 'PROVIDER_VERIFIED',
      performedBy: adminUser._id,
      targetResource: 'ProviderProfile',
      details: { providerId: providerProfile2._id, businessName: 'Rostova Electric & Smart Home Installs' }
    });

    await AuditLog.create({
      action: 'BOOKING_CREATED',
      performedBy: customerUser._id,
      targetResource: 'Booking',
      details: { bookingId: booking1._id, totalPrice: 130 }
    });

    await AuditLog.create({
      action: 'DISPUTE_RESOLVED',
      performedBy: supportUser._id,
      targetResource: 'Dispute',
      details: { ticketId: 'TICKET-003', refundAmount: 11, resolution: 'PARTIAL_REFUND' }
    });

    await AuditLog.create({
      action: 'INVOICE_PAID',
      performedBy: customerUser2._id,
      targetResource: 'Invoice',
      details: { invoiceNumber: 'INV-775301', amount: 231 }
    });

    await AuditLog.create({
      action: 'COUPON_CREATED',
      performedBy: adminUser._id,
      targetResource: 'Coupon',
      details: { codes: ['WELCOME10', 'CARE20', 'FIXIT15'] }
    });

    console.log('[Seed] Created audit logs.');

    // Update quote counts on requests
    await ServiceRequest.updateOne({ _id: request1._id }, { quotesCount: 2 });
    await ServiceRequest.updateOne({ _id: request2._id }, { quotesCount: 1 });
    await ServiceRequest.updateOne({ _id: request4._id }, { quotesCount: 1 });
    await ServiceRequest.updateOne({ _id: request6._id }, { quotesCount: 1 });
    await ServiceRequest.updateOne({ _id: request8._id }, { quotesCount: 1 });

    console.log('=======================================================');
    console.log('✅ CareConnect Database Seed Completed Successfully!');
    console.log('=======================================================');
    console.log('Demo Credentials for all 5 User Roles (Password: Password123!):');
    console.log('1. Customer:         customer@careconnect.com');
    console.log('2. Service Provider: provider@careconnect.com');
    console.log('3. Platform Admin:   admin@careconnect.com');
    console.log('4. Ops Manager:      ops@careconnect.com');
    console.log('5. Support Agent:    support@careconnect.com');
    console.log('=======================================================');
    console.log('Seed Summary:');
    console.log('  Users: 8 (5 demo roles + 2 extra providers + 1 extra customer)');
    console.log('  Service Categories: 6');
    console.log('  Provider Profiles: 3 (2 verified, 1 pending)');
    console.log('  Service Requests: 8');
    console.log('  Quotes: 6');
    console.log('  Bookings: 4 (1 in-progress, 1 scheduled, 2 completed)');
    console.log('  Invoices: 4 (2 unpaid, 2 paid)');
    console.log('  Reviews: 2');
    console.log('  Disputes: 3 (2 open, 1 resolved)');
    console.log('  Audit Logs: 7');
    console.log('  Coupons: 3');
    console.log('=======================================================');
  } catch (err) {
    console.error('[Seed Error]:', err);
    throw err;
  }
};

const seedDatabaseIfEmpty = async () => {
  // Only seed service categories if they don't exist yet.
  // Never auto-create demo users — platform uses real accounts only.
  const catCount = await ServiceCategory.countDocuments();
  if (catCount === 0) {
    console.log('[Seed] Seeding service categories...');
    await ServiceCategory.insertMany([
      { name: 'Appliance Repair', slug: 'appliance-repair', description: 'Refrigerator, washing machine, oven & appliance diagnostics.', icon: 'Tv', subcategories: [{ name: 'Refrigerator Repair', skillsRequired: ['Appliance Repair','Refrigeration'], basePriceEstimate: 120 }, { name: 'Washing Machine Repair', skillsRequired: ['Appliance Repair','Plumbing'], basePriceEstimate: 95 }] },
      { name: 'Plumbing', slug: 'plumbing', description: 'Leak repairs, drain unclogging, water heater & pipe fitting.', icon: 'Droplet', subcategories: [{ name: 'Drain Unclogging', skillsRequired: ['Plumbing','Drain Cleaning'], basePriceEstimate: 80 }, { name: 'Pipe Repair & Fitting', skillsRequired: ['Pipe Fitting','Plumbing'], basePriceEstimate: 150 }] },
      { name: 'Electrical Work', slug: 'electrical-work', description: 'Circuit breaker fixes, wiring, light fixtures & outlet repair.', icon: 'Zap', subcategories: [{ name: 'Lighting & Fixtures', skillsRequired: ['Electrical Wiring','Lighting Installation'], basePriceEstimate: 90 }, { name: 'Breaker Panel Maintenance', skillsRequired: ['Circuit Breaker Repair'], basePriceEstimate: 180 }] },
      { name: 'HVAC & Climate Control', slug: 'hvac-climate-control', description: 'Air conditioning, heating, thermostat calibration & duct servicing.', icon: 'Wind', subcategories: [{ name: 'AC Servicing & Repair', skillsRequired: ['HVAC Maintenance','AC Repair'], basePriceEstimate: 130 }] },
      { name: 'Cleaning & Maintenance', slug: 'cleaning-maintenance', description: 'Deep house cleaning, carpet sanitization & window washing.', icon: 'Sparkles', subcategories: [{ name: 'Deep Home Cleaning', skillsRequired: ['Deep Cleaning','Sanitization'], basePriceEstimate: 110 }] },
      { name: 'Handyman & General Repair', slug: 'handyman-general-repair', description: 'Drywall patching, furniture assembly, TV mounting & door fixes.', icon: 'Hammer', subcategories: [{ name: 'Furniture Assembly', skillsRequired: ['Furniture Assembly','General Repair'], basePriceEstimate: 60 }, { name: 'TV & Wall Mounting', skillsRequired: ['Wall Mounting','General Repair'], basePriceEstimate: 75 }] },
    ]);
    console.log('[Seed] 6 service categories created.');
  } else {
    console.log(`[Seed] ${catCount} service categories already exist. Skipping.`);
  }
};

if (require.main === module) {
  connectDB().then(async () => {
    await seedData();
    process.exit(0);
  });
}

module.exports = { seedData, seedDatabaseIfEmpty };
