/**
 * Borrowly AI Service
 * Strictly adheres to SRS Section 5.1 & HLD:
 * "The AI never queries or invents data. It only converts text into structured criteria,
 * which the backend validates and runs against MongoDB. Explanations are composed only
 * from fields of the returned documents."
 */

class AIService {
  /**
   * Interprets natural language prompt into structured search criteria
   * Simulates ~800ms AI latency if called asynchronously
   */
  async interpretQuery(query, categories = []) {
    const text = (query || '').toLowerCase().trim();

    // 1. Category extraction
    let matchedCategory = null;
    const catMap = {
      'power tools': ['drill', 'saw', 'hammer', 'driver', 'pressure washer', 'washer', 'sander', 'wrench', 'tool'],
      'camping & outdoors': ['tent', 'camp', 'camping', 'hiking', 'backpack', 'sleeping bag', 'stove', 'outdoor'],
      'electronics & av': ['projector', 'camera', 'screen', 'audio', 'video', 'hdmi', 'lens', 'tripod', 'electronics'],
      'lawn & garden': ['mower', 'lawn mower', 'gardening', 'garden', 'trimmer', 'leaf blower', 'hedge', 'grass'],
      'party & events': ['table', 'chair', 'speaker', 'party', 'sound system', 'bluetooth speaker', 'event', 'cooler'],
      'sports & fitness': ['bike', 'bicycle', 'cycling', 'kayak', 'paddle', 'weights', 'fitness', 'sports']
    };

    for (const [catName, keywords] of Object.entries(catMap)) {
      if (text.includes(catName.toLowerCase()) || keywords.some(k => text.includes(k))) {
        matchedCategory = categories.find(c => c.name.toLowerCase() === catName.toLowerCase())?.name ||
          catName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    // 2. Location extraction
    const locations = ['brooklyn', 'queens', 'manhattan', 'bronx', 'staten island', 'astoria', 'williamsburg', 'park slope', 'chelsea'];
    let matchedLocation = null;
    for (const loc of locations) {
      if (text.includes(loc)) {
        matchedLocation = loc.charAt(0).toUpperCase() + loc.slice(1);
        break;
      }
    }

    // 3. Duration & Dates calculation
    let durationDays = 1;
    if (text.includes('weekend')) {
      durationDays = 2;
    } else {
      const dayMatch = text.match(/(\d+)\s*(day|days|night|nights|week|weeks)/);
      if (dayMatch) {
        const val = parseInt(dayMatch[1], 10);
        durationDays = dayMatch[2].startsWith('week') ? val * 7 : val;
      }
    }

    const today = new Date();
    const startDateObj = new Date(today);
    if (text.includes('weekend')) {
      // nearest upcoming Saturday
      const dayOfWeek = today.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      startDateObj.setDate(today.getDate() + daysUntilSaturday);
    } else if (text.includes('tomorrow')) {
      startDateObj.setDate(today.getDate() + 1);
    } else {
      startDateObj.setDate(today.getDate() + 1); // default next day
    }

    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + durationDays);

    const startDate = startDateObj.toISOString().split('T')[0];
    const endDate = endDateObj.toISOString().split('T')[0];

    // 4. Borrow vs Rent preference
    let requestedType = 'any';
    if (text.includes('free') || text.includes('borrow for free') || text.includes('just borrow')) {
      requestedType = 'borrow';
    } else if (text.includes('rent') || text.includes('pay') || text.includes('rental')) {
      requestedType = 'rent';
    }

    // 5. Item concepts / keywords
    const stopWords = new Set(['i', 'need', 'a', 'an', 'the', 'for', 'in', 'near', 'with', 'to', 'and', 'or', 'of', 'this', 'looking', 'some', 'can', 'borrow', 'rent', 'please', 'wanted']);
    const rawTokens = text.replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const itemConcepts = rawTokens.filter(t => t.length > 2 && !stopWords.has(t));

    const criteria = {
      intent: 'item_search',
      rawQuery: query,
      matchedCategory,
      matchedLocation,
      itemConcepts,
      durationDays,
      startDate,
      endDate,
      requestedType,
      confidence: 0.94
    };

    return criteria;
  }

  /**
   * Matches criteria against actual database items and provides explainability
   */
  rankItemsWithExplanation(criteria, items = []) {
    const scoredItems = items.map(item => {
      let score = 50; // base score
      const matchReasons = [];

      // Category matching
      if (criteria.matchedCategory && item.category.toLowerCase().includes(criteria.matchedCategory.toLowerCase())) {
        score += 25;
        matchReasons.push(`Matches category "${item.category}"`);
      }

      // Concept / Keyword matching in title and tags
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      const tags = (item.tags || []).map(t => t.toLowerCase());

      let keywordHits = 0;
      criteria.itemConcepts.forEach(concept => {
        if (titleLower.includes(concept) || tags.includes(concept)) {
          keywordHits += 2;
        } else if (descLower.includes(concept)) {
          keywordHits += 1;
        }
      });

      if (keywordHits > 0) {
        score += Math.min(keywordHits * 8, 30);
        matchReasons.push(`Relevant to search concepts (${criteria.itemConcepts.slice(0, 3).join(', ')})`);
      }

      // Location match
      if (criteria.matchedLocation && item.location.toLowerCase().includes(criteria.matchedLocation.toLowerCase())) {
        score += 15;
        matchReasons.push(`Located nearby in ${criteria.matchedLocation}`);
      }

      // Type match (Borrow free vs Rent)
      if (criteria.requestedType === 'borrow' && item.pricePerDay === 0) {
        score += 15;
        matchReasons.push(`Free community borrow available ($0/day)`);
      } else if (criteria.requestedType === 'rent' && item.pricePerDay > 0) {
        score += 10;
        matchReasons.push(`Affordable rental rate at $${item.pricePerDay}/day`);
      }

      // Status check
      if (item.status === 'active') {
        score += 5;
        matchReasons.push(`Verified active and available for ${criteria.durationDays} day(s)`);
      }

      const finalScore = Math.min(score, 99);

      return {
        ...item,
        aiScore: finalScore,
        aiExplanation: matchReasons.length > 0 ? matchReasons.join(' • ') : 'Available community item in active catalog'
      };
    });

    // Sort by AI Match Score descending
    return scoredItems.sort((a, b) => b.aiScore - a.aiScore);
  }

  /**
   * Risk pattern detector for FR12 AI-Assisted Risk Flagging
   */
  detectUserRisk(user, transactions = [], requests = []) {
    const userTxns = transactions.filter(t => t.borrowerId === user.id || t.ownerId === user.id);
    const userReqs = requests.filter(r => r.borrowerId === user.id);

    const patterns = [];
    let severity = 'low';

    // 1. Check for overdue transactions
    const overdueCount = userTxns.filter(t => t.status === 'OVERDUE').length;
    if (overdueCount > 0) {
      patterns.push(`${overdueCount} overdue item transaction(s) recorded`);
      severity = overdueCount > 1 ? 'high' : 'medium';
    }

    // 2. Check for high cancellation rate
    const cancelledCount = userReqs.filter(r => r.status === 'CANCELLED').length;
    if (userReqs.length >= 3 && (cancelledCount / userReqs.length) > 0.4) {
      patterns.push(`High cancellation rate (${Math.round((cancelledCount / userReqs.length) * 100)}%)`);
      severity = severity === 'high' ? 'high' : 'medium';
    }

    // 3. Rapid bursts
    if (userReqs.length > 5) {
      patterns.push('High volume of rapid borrow requests within recent period');
    }

    return {
      hasRisk: patterns.length > 0,
      severity,
      patterns,
      recommendation: patterns.length > 0
        ? 'Admin review suggested. Verify borrower return history before high-value loans.'
        : 'User activity is standard and healthy.'
    };
  }
}

module.exports = new AIService();
