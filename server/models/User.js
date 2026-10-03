const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['borrower', 'owner', 'admin'], default: 'borrower' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  reputation: {
    rating: { type: Number, default: 5.0 },
    count: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
