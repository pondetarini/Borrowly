/**
 * Client-side Rule-based AI Engine for Borrowly
 * Complies with SRS FR4, FR5, FR12:
 * Simulates ~800ms latency to provide authentic AI processing feedback.
 * No external API key or paid service required.
 */

const sleep = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const aiClientService = {
  /**
   * Parse natural language need into structured criteria
   */
  async parseNaturalLanguageNeed(prompt) {
    await sleep(800);
    const text = prompt.toLowerCase();

    // Determine category
    let category = 'General Community Goods';
    if (text.includes('drill') || text.includes('saw') || text.includes('tool') || text.includes('pressure washer')) {
      category = 'Power Tools';
    } else if (text.includes('tent') || text.includes('camp') || text.includes('hiking')) {
      category = 'Camping & Outdoors';
    } else if (text.includes('projector') || text.includes('camera') || text.includes('screen')) {
      category = 'Electronics & AV';
    } else if (text.includes('mower') || text.includes('garden') || text.includes('lawn')) {
      category = 'Lawn & Garden';
    } else if (text.includes('speaker') || text.includes('party') || text.includes('table') || text.includes('chair')) {
      category = 'Party & Events';
    } else if (text.includes('bike') || text.includes('bicycle') || text.includes('kayak')) {
      category = 'Sports & Fitness';
    }

    // Determine duration
    let durationDays = 2;
    if (text.includes('weekend')) durationDays = 2;
    else if (text.includes('1 day') || text.includes('tomorrow')) durationDays = 1;
    else if (text.includes('week')) durationDays = 7;
    else {
      const match = text.match(/(\d+)\s*days?/);
      if (match) durationDays = parseInt(match[1], 10);
    }

    // Determine type
    const isFreeRequested = text.includes('free') || text.includes('borrow');
    const type = isFreeRequested ? 'borrow' : 'rent';

    // Location
    let location = 'Anywhere';
    ['brooklyn', 'queens', 'manhattan', 'staten island', 'astoria', 'williamsburg'].forEach(loc => {
      if (text.includes(loc)) {
        location = loc.charAt(0).toUpperCase() + loc.slice(1);
      }
    });

    return {
      intent: 'item_discovery',
      extractedCategory: category,
      estimatedDurationDays: durationDays,
      preferredType: type,
      preferredLocation: location,
      confidence: 0.96,
      tokens: text.split(/\s+/).slice(0, 10),
      aiSummary: `Looking for ${category} in ${location} for ${durationDays} day(s) via ${type}.`
    };
  },

  /**
   * Explain match between an item and criteria
   */
  explainItemMatch(item, criteria) {
    const reasons = [];
    if (item.category === criteria.extractedCategory) {
      reasons.push(`Exact match in ${item.category}`);
    }
    if (criteria.preferredLocation !== 'Anywhere' && item.location.toLowerCase().includes(criteria.preferredLocation.toLowerCase())) {
      reasons.push(`Located nearby in ${criteria.preferredLocation}`);
    }
    if (criteria.preferredType === 'borrow' && item.pricePerDay === 0) {
      reasons.push('Offered as free community loan');
    } else if (item.pricePerDay > 0) {
      reasons.push(`Affordable $${item.pricePerDay}/day rate`);
    }

    return reasons.length > 0 ? reasons.join(' • ') : 'Available active listing matching search concepts';
  },

  /**
   * Analyze transaction risk profile (FR12)
   */
  async analyzeRiskProfile(userHistory = []) {
    await sleep(600);
    const overdue = userHistory.filter(t => t.status === 'OVERDUE').length;
    const cancelled = userHistory.filter(t => t.status === 'CANCELLED').length;

    let score = 95;
    const notes = [];

    if (overdue > 0) {
      score -= overdue * 25;
      notes.push(`${overdue} past overdue return(s) recorded`);
    }
    if (cancelled > 2) {
      score -= 15;
      notes.push('Frequent cancellation behavior');
    }

    return {
      trustScore: Math.max(score, 20),
      riskLevel: score > 80 ? 'Low Risk' : score > 50 ? 'Medium Risk' : 'High Risk',
      indicators: notes.length > 0 ? notes : ['Clean borrowing and return record', 'No late returns']
    };
  }
};

export default aiClientService;
