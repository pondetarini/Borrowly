const store = require('../data/store');

// @desc    Submit review for a completed transaction
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { transactionId, rating, comment } = req.body;

    if (!transactionId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide transaction ID, rating (1-5), and a review comment.'
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.'
      });
    }

    const txn = store.findById('transactions', transactionId);
    if (!txn) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    if (txn.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Reviews are only permitted for COMPLETED transactions.'
      });
    }

    // Check if user is either borrower or owner
    const isBorrower = txn.borrowerId === req.user.id;
    const isOwner = txn.ownerId === req.user.id;

    if (!isBorrower && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only participants in this transaction can leave a review.'
      });
    }

    // Check if already reviewed (unique per reviewer per transaction)
    const existing = store.findOne('reviews', r =>
      r.transactionId === transactionId && r.reviewerId === req.user.id
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this transaction.'
      });
    }

    const revieweeId = isBorrower ? txn.ownerId : txn.borrowerId;

    const newReview = store.create('reviews', {
      transactionId,
      itemId: txn.itemId,
      itemTitle: txn.itemTitle,
      reviewerId: req.user.id,
      reviewerName: req.user.name,
      revieweeId,
      rating: numRating,
      comment
    });

    // Recalculate reviewee reputation
    const userReviews = store.find('reviews', r => r.revieweeId === revieweeId);
    const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / userReviews.length).toFixed(1));

    store.update('users', revieweeId, {
      reputation: {
        rating: avgRating,
        count: userReviews.length
      }
    });

    // Notify reviewee
    store.create('notifications', {
      recipientId: revieweeId,
      senderId: req.user.id,
      title: 'New Review Received! ⭐',
      message: `${req.user.name} gave you a ${numRating}-star review for "${txn.itemTitle}".`,
      type: 'system',
      link: '/profile'
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: newReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for an item
// @route   GET /api/reviews/item/:itemId
// @access  Public
exports.getItemReviews = async (req, res, next) => {
  try {
    const reviews = store.find('reviews', r => r.itemId === req.params.itemId);
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};
