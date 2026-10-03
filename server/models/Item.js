const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  categoryId: { type: String, default: '' },
  description: { type: String, required: true },
  condition: { type: String, enum: ['Like New', 'Good', 'Fair'], default: 'Good' },
  location: { type: String, required: true },
  status: { type: String, enum: ['active', 'paused', 'deleted'], default: 'active' },
  isRentable: { type: Boolean, default: false },
  pricePerDay: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, default: '' },
  images: [{ type: String }],
  tags: [{ type: String }],
  rules: { type: String, default: '' }
}, { timestamps: true });

ItemSchema.index({ category: 1, status: 1, location: 1 });

module.exports = mongoose.model('Item', ItemSchema);
