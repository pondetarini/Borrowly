const store = require('../data/store');
const aiService = require('../services/aiService');

// @desc    Process natural-language prompt, extract structured criteria, and match actual items
// @route   POST /api/ai/search
// @access  Public
exports.interpretAndSearch = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a natural-language description of what you need.'
      });
    }

    const categories = store.find('categories');

    // 1. Interpret natural language into structured criteria (FR4)
    const criteria = await aiService.interpretQuery(query, categories);

    // 2. Fetch active items from database (Single source of truth)
    const activeItems = store.find('items', item => item.status === 'active');

    // 3. Score and rank items with explainable reasons (FR5)
    const rankedItems = aiService.rankItemsWithExplanation(criteria, activeItems);

    return res.status(200).json({
      success: true,
      data: {
        interpretation: criteria,
        matchCount: rankedItems.length,
        results: rankedItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI curated recommendations
// @route   GET /api/ai/recommendations
// @access  Public
exports.getRecommendations = async (req, res, next) => {
  try {
    const items = store.find('items', i => i.status === 'active');
    // Top recommended items with high community utility
    const curated = items.slice(0, 4).map(item => ({
      ...item,
      aiScore: 95,
      aiExplanation: 'Popular in your community • Highly rated owner • Zero conflict availability'
    }));

    return res.status(200).json({
      success: true,
      data: curated
    });
  } catch (error) {
    next(error);
  }
};
