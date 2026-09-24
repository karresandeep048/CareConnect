/**
 * AI Service Request Classifier Service
 * Intelligent natural language processor for home service requests.
 */

const CATEGORY_TAXONOMY = [
  {
    category: 'Appliance Repair',
    keywords: ['fridge', 'refrigerator', 'washer', 'dryer', 'dishwasher', 'oven', 'microwave', 'appliance', 'freezer', 'stove', 'leaking water', 'cooling'],
    skills: ['Appliance Repair', 'Refrigeration', 'Electrical Diagnostics'],
    minPrice: 75,
    maxPrice: 250,
    avgHours: 2
  },
  {
    category: 'Plumbing',
    keywords: ['pipe', 'leak', 'drain', 'faucet', 'clog', 'toilet', 'sink', 'shower', 'water heater', 'sewer', 'spigot', 'plumb', 'flush'],
    skills: ['Plumbing', 'Drain Cleaning', 'Pipe Fitting', 'Water Heater Repair'],
    minPrice: 60,
    maxPrice: 220,
    avgHours: 2
  },
  {
    category: 'Electrical Work',
    keywords: ['outlet', 'wire', 'wiring', 'circuit', 'breaker', 'spark', 'light', 'fixture', 'switch', 'fuse', 'electric', 'short circuit', 'panel'],
    skills: ['Electrical Wiring', 'Circuit Breaker Repair', 'Lighting Installation'],
    minPrice: 80,
    maxPrice: 300,
    avgHours: 2.5
  },
  {
    category: 'HVAC & Climate Control',
    keywords: ['ac', 'air conditioner', 'heating', 'furnace', 'thermostat', 'duct', 'cooling', 'vent', 'hvac', 'heater', 'compressor'],
    skills: ['HVAC Maintenance', 'AC Repair', 'Thermostat Calibration'],
    minPrice: 90,
    maxPrice: 350,
    avgHours: 3
  },
  {
    category: 'Cleaning & Maintenance',
    keywords: ['clean', 'deep clean', 'maid', 'carpet', 'window', 'pest', 'disinfect', 'dust', 'mop', 'sanitizer', 'housekeeping'],
    skills: ['Deep Cleaning', 'Sanitization', 'Carpet Cleaning'],
    minPrice: 50,
    maxPrice: 180,
    avgHours: 3.5
  },
  {
    category: 'Handyman & General Repair',
    keywords: ['door', 'lock', 'wall', 'paint', 'drywall', 'mount', 'tv', 'furniture', 'shelf', 'cabinet', 'hinge', 'carpentry'],
    skills: ['Carpentry', 'Drywall Patching', 'Furniture Assembly', 'General Repair'],
    minPrice: 40,
    maxPrice: 150,
    avgHours: 1.5
  }
];

const URGENCY_TRIGGERS = {
  Emergency: ['flooding', 'sparking', 'fire hazard', 'gas leak', 'overflowing', 'no heat in winter', 'urgent', 'immediately', 'smoke'],
  High: ['leaking', 'not working', 'completely broken', 'clogged', 'no power', 'smell', 'noise'],
  Medium: ['slow', 'noisy', 'replacement', 'install', 'maintenance'],
  Low: ['routine', 'checkup', 'inspection', 'whenever', 'next week']
};

const classifyServiceRequest = async (description) => {
  if (!description || description.trim().length === 0) {
    return {
      categoryName: 'Handyman & General Repair',
      urgency: 'Medium',
      skillsRequired: ['General Repair'],
      estimatedCostRange: { min: 50, max: 150 },
      estimatedDurationHours: 2,
      confidenceScore: 0.5,
      extractedKeyTerms: []
    };
  }

  const textLower = description.toLowerCase();
  
  // Find matching category by keyword frequency
  let bestMatch = CATEGORY_TAXONOMY[5]; // Default handyman
  let maxHits = 0;
  let detectedTerms = [];

  CATEGORY_TAXONOMY.forEach(cat => {
    let hits = 0;
    cat.keywords.forEach(kw => {
      if (textLower.includes(kw)) {
        hits += 1;
        detectedTerms.push(kw);
      }
    });
    if (hits > maxHits) {
      maxHits = hits;
      bestMatch = cat;
    }
  });

  // Urgency classification
  let detectedUrgency = 'Medium';
  for (const [level, triggers] of Object.entries(URGENCY_TRIGGERS)) {
    if (triggers.some(trig => textLower.includes(trig))) {
      detectedUrgency = level;
      break;
    }
  }

  // Calculate confidence
  const confidenceScore = Math.min(0.98, Math.max(0.65, 0.6 + (maxHits * 0.1)));

  return {
    categoryName: bestMatch.category,
    urgency: detectedUrgency,
    skillsRequired: bestMatch.skills,
    estimatedCostRange: { min: bestMatch.minPrice, max: bestMatch.maxPrice },
    estimatedDurationHours: bestMatch.avgHours,
    confidenceScore: parseFloat(confidenceScore.toFixed(2)),
    extractedKeyTerms: Array.from(new Set(detectedTerms))
  };
};

module.exports = { classifyServiceRequest };
