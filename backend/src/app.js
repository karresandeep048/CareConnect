const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const providerRoutes = require('./routes/providerRoutes');
const requestRoutes = require('./routes/requestRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const couponRoutes = require('./routes/couponRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const publicRoutes = require('./routes/publicRoutes');
const { rateLimit } = require('./middleware/rateLimit');
const { requestLogger } = require('./middleware/requestLogger');

const app = express();

app.use(cors());
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CareConnect REST API server is healthy', timestamp: new Date() });
});

// Rate limits: strict on auth (brute-force protection), moderate on the chatbot
app.use('/api/auth', rateLimit({ windowMs: 60 * 1000, max: 40, message: 'Too many auth attempts, slow down.' }));
app.use('/api/assistant', rateLimit({ windowMs: 60 * 1000, max: 30 }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/public', publicRoutes);

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

