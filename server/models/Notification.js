const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'request_created',
      'request_approved',
      'request_rejected',
      'borrowing_started',
      'return_requested',
      'return_confirmed',
      'overdue_alert',
      'system'
    ],
    default: 'system'
  },
  link: { type: String, default: '/dashboard' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

NotificationSchema.index({ recipientId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
