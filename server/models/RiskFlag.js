const mongoose = require('mongoose');

const RiskFlagSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  reason: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  patterns: [{ type: String }],
  relatedTransactions: [{ type: String }],
  status: {
    type: String,
    enum: ['PENDING', 'REVIEWED', 'ACTION_TAKEN', 'DISMISSED'],
    default: 'PENDING'
  },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('RiskFlag', RiskFlagSchema);
