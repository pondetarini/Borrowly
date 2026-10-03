require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require("dotenv").config();
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[Database] Neither MONGO_URI nor MONGODB_URI is configured; MongoDB is disconnected.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    const safeMessage = error.message
      .replace(uri, '[redacted MongoDB URI]')
      .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, '[redacted MongoDB URI]');
    console.error(`[Database] MongoDB connection failed: ${safeMessage}`);
    return false;
  }
};

module.exports = connectDB;
