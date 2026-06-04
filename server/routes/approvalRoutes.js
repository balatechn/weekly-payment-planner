const express = require('express');
const router = express.Router();
const { Payment, Approval, User, Entity } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get pending approvals for current user (finance/admin only)
router.get('/pending',
  roleMiddleware('finance', 'admin'),
  async (req, res) => {
    try {
      const payments = await Payment.findAll({
        where: {
          status: ['submitted', 'under_review']
        },
        include: [
          { model: Entity, as: 'entity' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          {
            model: Approval,
            as: 'approvals',
            include: [
              { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
            ]
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      res.json(payments);
    } catch (error) {
      console.error('Get pending approvals error:', error);
      res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
  }
);

// Approve payment (finance/admin only)
router.post('/:id/approve',
  roleMiddleware('finance', 'admin'),
  auditMiddleware('APPROVE', 'payment'),
  async (req, res) => {
    try {
      const payment = await Payment.findByPk(req.params.id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.status === 'approved') {
        return res.status(400).json({ error: 'Payment already approved' });
      }

      if (payment.status !== 'submitted' && payment.status !== 'under_review') {
        return res.status(400).json({ error: 'Payment not in approvable state' });
      }

      const { comments } = req.body;

      // Create approval record
      await Approval.create({
        paymentId: payment.id,
        approverId: req.user.id,
        stage: 'finance',
        status: 'approved',
        comments,
        approvedAt: new Date()
      });

      // Update payment status
      await payment.update({ status: 'approved' });

      const updatedPayment = await Payment.findByPk(payment.id, {
        include: [
          { model: Entity, as: 'entity' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          {
            model: Approval,
            as: 'approvals',
            include: [
              { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
            ]
          }
        ]
      });

      res.json(updatedPayment);
    } catch (error) {
      console.error('Approve payment error:', error);
      res.status(500).json({ error: 'Failed to approve payment' });
    }
  }
);

// Reject payment (finance/admin only)
router.post('/:id/reject',
  roleMiddleware('finance', 'admin'),
  auditMiddleware('REJECT', 'payment'),
  async (req, res) => {
    try {
      const payment = await Payment.findByPk(req.params.id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.status === 'rejected') {
        return res.status(400).json({ error: 'Payment already rejected' });
      }

      const { comments, rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      // Create approval record
      await Approval.create({
        paymentId: payment.id,
        approverId: req.user.id,
        stage: 'finance',
        status: 'rejected',
        comments
      });

      // Update payment status
      await payment.update({
        status: 'rejected',
        rejectionReason
      });

      const updatedPayment = await Payment.findByPk(payment.id, {
        include: [
          { model: Entity, as: 'entity' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          {
            model: Approval,
            as: 'approvals',
            include: [
              { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
            ]
          }
        ]
      });

      res.json(updatedPayment);
    } catch (error) {
      console.error('Reject payment error:', error);
      res.status(500).json({ error: 'Failed to reject payment' });
    }
  }
);

// Mark payment as paid (finance/admin only)
router.post('/:id/mark-paid',
  roleMiddleware('finance', 'admin'),
  auditMiddleware('MARK_PAID', 'payment'),
  async (req, res) => {
    try {
      const payment = await Payment.findByPk(req.params.id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.status !== 'approved') {
        return res.status(400).json({ error: 'Only approved payments can be marked as paid' });
      }

      await payment.update({ status: 'paid' });

      const updatedPayment = await Payment.findByPk(payment.id, {
        include: [
          { model: Entity, as: 'entity' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ]
      });

      res.json(updatedPayment);
    } catch (error) {
      console.error('Mark paid error:', error);
      res.status(500).json({ error: 'Failed to mark payment as paid' });
    }
  }
);

module.exports = router;
