const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterName: { type: String, required: true },
  targetType: { type: String, enum: ['item', 'user'], required: true },
  targetId: { type: String, required: true },
  targetTitle: { type: String, default: '' },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
    default: 'PENDING'
  },
  adminAction: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
