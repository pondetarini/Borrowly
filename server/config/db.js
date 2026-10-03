require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require("dotenv").config();
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('[Database] No MONGO_URI provided in environment. Utilizing resilient in-memory & snapshot store (Zero-fail mode).');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database] MongoDB Connection Failed: ${error.message}`);
    console.log('[Database] Falling back seamlessly to embedded snapshot store.');
    return false;
  }
};

module.exports = connectDB;
