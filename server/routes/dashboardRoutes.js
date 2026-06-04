const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// All routes require authentication
router.use(authMiddleware);

// Get dashboard summary
router.get('/summary', dashboardController.getSummary);

// Get recent payments
router.get('/recent-payments', dashboardController.getRecentPayments);

// Get entity statistics
router.get('/entity-stats', dashboardController.getEntityStats);

// Get payment trends
router.get('/payment-trends', dashboardController.getPaymentTrends);

module.exports = router;
