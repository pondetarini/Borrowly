const store = require('../data/store');

// @desc    Get all active items with filters & search
// @route   GET /api/items
// @access  Public
exports.getAllItems = async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      location = '',
      condition = '',
      type = '', // 'borrow' (free) or 'rent'
      maxPrice,
      ownerId,
      status = 'active'
    } = req.query;

    const items = store.find('items', item => {
      // Status filter
      if (status !== 'all' && item.status !== status) return false;

      // Owner filter
      if (ownerId && item.ownerId !== ownerId) return false;

      // Category filter
      if (category && category !== 'All' && item.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      // Condition filter
      if (condition && condition !== 'All' && item.condition.toLowerCase() !== condition.toLowerCase()) {
        return false;
      }

      // Type filter: 'borrow' means pricePerDay === 0; 'rent' means pricePerDay > 0
      if (type === 'borrow' && item.pricePerDay > 0) return false;
      if (type === 'rent' && item.pricePerDay === 0) return false;

      // Price filter
      if (maxPrice && Number(maxPrice) > 0 && item.pricePerDay > Number(maxPrice)) {
        return false;
      }

      // Location filter
      if (location && !item.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      // Text search in title, description, and tags
      if (search) {
        const query = search.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(query);
        const inDesc = item.description.toLowerCase().includes(query);
        const inTags = (item.tags || []).some(t => t.toLowerCase().includes(query));
        if (!inTitle && !inDesc && !inTags) return false;
      }

      return true;
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
exports.getItemById = async (req, res, next) => {
  try {
    const item = store.findById('items', req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    const owner = store.findById('users', item.ownerId);
    const ownerSafe = owner ? {
      id: owner.id,
      name: owner.name,
      reputation: owner.reputation,
      location: owner.location,
      createdAt: owner.createdAt
    } : null;

    // Check item reviews
    const reviews = store.find('reviews', r => r.itemId === item.id);

    return res.status(200).json({
      success: true,
      data: {
        ...item,
        owner: ownerSafe,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item listing
// @route   POST /api/items
// @access  Private (Owner/Admin)
exports.createItem = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      condition = 'Good',
      location,
      isRentable = false,
      pricePerDay = 0,
      deposit = 0,
      images = [],
      tags = [],
      rules = ''
    } = req.body;

    if (!title || !category || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, description, and location.'
      });
    }

    const defaultImages = [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80'
    ];

    const newItem = store.create('items', {
      title,
      category,
      description,
      condition,
      location,
      status: 'active',
      isRentable: Boolean(isRentable),
      pricePerDay: Number(pricePerDay) || 0,
      deposit: Number(deposit) || 0,
      ownerId: req.user.id,
      ownerName: req.user.name,
      images: images.length > 0 ? images : defaultImages,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
      rules
    });

    return res.status(201).json({
      success: true,
      message: 'Item listed successfully.',
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item listing
// @route   PUT /api/items/:id
// @access  Private (Owner/Admin)
exports.updateItem = async (req, res, next) => {
  try {
    const item = store.findById('items', req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    if (item.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing.'
      });
    }

    const updated = store.update('items', req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Item updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Pause item listing
// @route   DELETE /api/items/:id
// @access  Private (Owner/Admin)
exports.deleteItem = async (req, res, next) => {
  try {
    const item = store.findById('items', req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    if (item.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing.'
      });
    }

    store.update('items', req.params.id, { status: 'deleted' });
    return res.status(200).json({
      success: true,
      message: 'Item listing removed.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all item categories
// @route   GET /api/items/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = store.find('categories');
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
