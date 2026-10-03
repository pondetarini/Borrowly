const store = require('../data/store');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = store.find('notifications', n => n.recipientId === req.user.id);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notif = store.findById('notifications', req.params.id);
    if (!notif) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    if (notif.recipientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const updated = store.update('notifications', notif.id, { isRead: true });
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userNotifs = store.find('notifications', n => n.recipientId === req.user.id && !n.isRead);
    userNotifs.forEach(n => {
      store.update('notifications', n.id, { isRead: true });
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};
