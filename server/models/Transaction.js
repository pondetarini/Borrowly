const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemTitle: { type: String, required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowerName: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  actualReturnDate: { type: String, default: null },
  type: { type: String, enum: ['borrow', 'rent'], default: 'borrow' },
  amountPaid: { type: Number, default: 0 },
  depositHeld: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['APPROVED', 'ACTIVE', 'RETURN_REQUESTED', 'COMPLETED', 'OVERDUE', 'CANCELLED'],
    default: 'APPROVED'
  }
}, { timestamps: true });

TransactionSchema.index({ itemId: 1, startDate: 1, endDate: 1, status: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
