/**
 * AI Provider Ranking Engine
 * Ranks suitable providers using request details, required skills, service area (zip code), availability, and historical ratings.
 */

const rankProvidersForRequest = (serviceRequest, providerProfiles) => {
  const reqSkills = serviceRequest.skillsRequired || [];
  const reqZip = serviceRequest.serviceAddress?.zipCode || '';
  const reqCategory = serviceRequest.categoryName || '';

  const ranked = providerProfiles.map(profile => {
    let score = 0;
    let matchReasons = [];

    // 1. Skill Match Score (35% weight)
    const providerSkills = profile.skills || [];
    const matchedSkills = reqSkills.filter(skill => 
      providerSkills.some(ps => ps.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(ps.toLowerCase()))
    );
    const skillScore = reqSkills.length > 0 ? (matchedSkills.length / reqSkills.length) * 35 : 25;
    score += skillScore;
    if (matchedSkills.length > 0) {
      matchReasons.push(`${matchedSkills.length} matching skill(s): ${matchedSkills.join(', ')}`);
    }

    // 2. Service Area / Zip Code Match (25% weight)
    const areas = profile.serviceAreas || [];
    const zipMatch = areas.includes(reqZip) || areas.some(area => area.toLowerCase().includes(serviceRequest.serviceAddress?.city?.toLowerCase() || '***'));
    if (zipMatch) {
      score += 25;
      matchReasons.push(`Serves area zip code (${reqZip})`);
    } else {
      score += 10; // Partial score for city proximity
    }

    // 3. Verification & Rating Score (25% weight)
    if (profile.verificationStatus === 'verified') {
      score += 10;
      matchReasons.push('Verified Provider Badge');
    }
    const ratingNorm = (profile.ratingAvg / 5.0) * 15;
    score += ratingNorm;
    if (profile.ratingAvg >= 4.5) {
      matchReasons.push(`High rating (${profile.ratingAvg.toFixed(1)} ★)`);
    }

    // 4. Hourly Rate / Cost Alignment (15% weight)
    const maxEstPrice = serviceRequest.estimatedCostRange?.max || 200;
    const estTotalCost = profile.hourlyRate * (serviceRequest.estimatedDurationHours || 2);
    if (estTotalCost <= maxEstPrice) {
      score += 15;
      matchReasons.push(`Competitive rate ($${profile.hourlyRate}/hr)`);
    } else {
      score += 8;
    }

    // Cap total score at 99
    const matchScore = Math.min(99, Math.round(score));

    return {
      providerProfile: profile,
      matchScore,
      matchReasons
    };
  });

  // Sort descending by matchScore
  return ranked.sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = { rankProvidersForRequest };
