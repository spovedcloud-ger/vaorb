const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

// Import controllers
const authController = require('../controllers/authController');
const contactController = require('../controllers/contactController');
const pricingController = require('../controllers/pricingController');
const analyticsController = require('../controllers/analyticsController');
const chatController = require('../controllers/chatController');

// Import middleware
const auth = require('../middleware/auth');

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Authenticate Admin
router.post('/auth/login', authController.login);

// Verify JWT token validity
router.get('/auth/verify', auth, authController.verifyToken);

// Fetch Service pricing configuration
router.get('/pricing', pricingController.getPricing);

// Submit Contact Inquiries form
router.post('/contact', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email address').isEmail(),
  check('message', 'Message must be at least 10 characters long').isLength({ min: 10 })
], contactController.submitInquiry);

// Traffic Telemetry
router.post('/analytics/view', analyticsController.trackView);
router.post('/analytics/click-booking', analyticsController.trackBookingClick);

// AI chat (OpenAI-compatible: OpenAI, Groq, OpenRouter, etc.)
router.get('/chat/status', chatController.getChatStatus);
router.post('/chat', chatController.chat);


// ==========================================
// SECURE / ADMIN ENDPOINTS (Protected by JWT)
// ==========================================

// Retrieve Inquiries Inbox
router.get('/contact', auth, contactController.getInquiries);

// Update Inquiry Status (New, In-Progress, Archived)
router.patch('/contact/:id', auth, contactController.updateStatus);

// Delete inquiry message
router.delete('/contact/:id', auth, contactController.deleteInquiry);

// Update dynamic prices and plan descriptions (CMS tool)
router.put('/pricing/:planType', auth, pricingController.updatePricing);

// Fetch complete system stats summary
router.get('/analytics/summary', auth, analyticsController.getAnalyticsSummary);

module.exports = router;
