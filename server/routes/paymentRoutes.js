const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create payment
router.post('/', 
  upload.single('attachment'),
  auditMiddleware('CREATE', 'payment'),
  paymentController.create
);

// Get all payments (with filters)
router.get('/', paymentController.getAll);

// Get single payment
router.get('/:id', paymentController.getById);

// Update payment
router.put('/:id', 
  upload.single('attachment'),
  auditMiddleware('UPDATE', 'payment'),
  paymentController.update
);

// Delete payment
router.delete('/:id',
  auditMiddleware('DELETE', 'payment'),
  paymentController.delete
);

// Submit payment for approval
router.post('/:id/submit',
  auditMiddleware('SUBMIT', 'payment'),
  paymentController.submit
);

module.exports = router;
