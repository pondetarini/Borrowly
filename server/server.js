const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const requestRoutes = require('./routes/requests');
const transactionRoutes = require('./routes/transactions');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base health route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Borrowly Backend API',
    status: 'healthy',
    mode: process.env.MONGO_URI || process.env.MONGODB_URI ? 'MongoDB' : 'Embedded snapshot store',
    database: {
      connected: mongoose.connection.readyState === 1
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Borrowly Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch((error) => {
  console.error('[Startup Error]', error.message);
  process.exitCode = 1;
});

module.exports = app;
