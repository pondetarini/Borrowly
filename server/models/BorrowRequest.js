const mongoose = require('mongoose');

const BorrowRequestSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemTitle: { type: String, required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowerName: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  durationDays: { type: Number, required: true },
  type: { type: String, enum: ['borrow', 'rent'], default: 'borrow' },
  totalCost: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  }
}, { timestamps: true });

BorrowRequestSchema.index({ itemId: 1, startDate: 1, endDate: 1, status: 1 });

module.exports = mongoose.model('BorrowRequest', BorrowRequestSchema);
