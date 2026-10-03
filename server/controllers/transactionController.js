const store = require('../data/store');

// @desc    Get user's transactions (as borrower or owner)
// @route   GET /api/transactions
// @access  Private
exports.getMyTransactions = async (req, res, next) => {
  try {
    const { role } = req.query; // 'borrower' or 'owner' or undefined (both)

    const transactions = store.find('transactions', t => {
      if (req.user.role === 'admin') return true;
      if (role === 'borrower') return t.borrowerId === req.user.id;
      if (role === 'owner') return t.ownerId === req.user.id;
      return t.borrowerId === req.user.id || t.ownerId === req.user.id;
    });

    // Check for any overdue states on the fly
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedTxns = transactions.map(t => {
      if (t.status === 'ACTIVE' && t.endDate < todayStr) {
        return store.update('transactions', t.id, { status: 'OVERDUE' }) || t;
      }
      return t;
    });

    return res.status(200).json({
      success: true,
      count: updatedTxns.length,
      data: updatedTxns
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res, next) => {
  try {
    const txn = store.findById('transactions', req.params.id);
    if (!txn) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    if (txn.borrowerId !== req.user.id && txn.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const item = store.findById('items', txn.itemId);
    const reviews = store.find('reviews', r => r.transactionId === txn.id);

    return res.status(200).json({
      success: true,
      data: {
        ...txn,
        item,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Borrower initiates return
// @route   PUT /api/transactions/:id/return-request
// @access  Private (Borrower only)
exports.initiateReturn = async (req, res, next) => {
  try {
    const txn = store.findById('transactions', req.params.id);
    if (!txn) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    if (txn.borrowerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the borrower can request return.'
      });
    }

    if (!['ACTIVE', 'OVERDUE', 'APPROVED'].includes(txn.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot initiate return for transaction with status: ${txn.status}`
      });
    }

    const updated = store.update('transactions', txn.id, {
      status: 'RETURN_REQUESTED',
      returnInitiatedAt: new Date().toISOString()
    });

    // Notify owner
    store.create('notifications', {
      recipientId: txn.ownerId,
      senderId: req.user.id,
      title: 'Item Return Initiated 📦',
      message: `${req.user.name} has initiated return for "${txn.itemTitle}". Please inspect and confirm receipt.`,
      type: 'return_requested',
      link: '/owner/returns'
    });

    return res.status(200).json({
      success: true,
      message: 'Return initiated. The owner has been notified to verify and confirm receipt.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner confirms receipt of returned item
// @route   PUT /api/transactions/:id/confirm-return
// @access  Private (Owner only)
exports.confirmReturn = async (req, res, next) => {
  try {
    const txn = store.findById('transactions', req.params.id);
    if (!txn) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    if (txn.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can confirm return.'
      });
    }

    const now = new Date().toISOString();
    const updated = store.update('transactions', txn.id, {
      status: 'COMPLETED',
      actualReturnDate: now
    });

    // Notify borrower
    store.create('notifications', {
      recipientId: txn.borrowerId,
      senderId: req.user.id,
      title: 'Return Confirmed! ✨',
      message: `${req.user.name} confirmed the return of "${txn.itemTitle}". Security deposit released. Please leave a review!`,
      type: 'return_confirmed',
      link: `/transactions/${txn.id}`
    });

    return res.status(200).json({
      success: true,
      message: 'Return confirmed. Transaction marked COMPLETED. Review window is now open.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
