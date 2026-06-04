const express = require('express');
const router = express.Router();
const { EmailLog, EmailRecipient, Payment, Entity } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

// All routes require authentication
router.use(authMiddleware);

// Get email history
router.get('/history',
  roleMiddleware('finance', 'admin'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await EmailLog.findAndCountAll({
        order: [['sentAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        emails: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Email history error:', error);
      res.status(500).json({ error: 'Failed to fetch email history' });
    }
  }
);

// Get single email log
router.get('/history/:id',
  roleMiddleware('finance', 'admin'),
  async (req, res) => {
    try {
      const emailLog = await EmailLog.findByPk(req.params.id);

      if (!emailLog) {
        return res.status(404).json({ error: 'Email log not found' });
      }

      res.json(emailLog);
    } catch (error) {
      console.error('Email log error:', error);
      res.status(500).json({ error: 'Failed to fetch email log' });
    }
  }
);

// Send weekly schedule manually
router.post('/send-weekly',
  roleMiddleware('finance', 'admin'),
  async (req, res) => {
    try {
      const result = await emailService.sendWeeklySchedule();
      res.json(result);
    } catch (error) {
      console.error('Send weekly email error:', error);
      res.status(500).json({ error: 'Failed to send email', message: error.message });
    }
  }
);

// Send custom email
router.post('/send-custom',
  roleMiddleware('finance', 'admin'),
  async (req, res) => {
    try {
      const { recipients, subject, paymentIds, weekStartDate, weekEndDate } = req.body;

      if (!recipients || !subject || !paymentIds || paymentIds.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const payments = await Payment.findAll({
        where: { id: { [Op.in]: paymentIds } },
        include: [{ model: Entity, as: 'entity' }]
      });

      if (payments.length === 0) {
        return res.status(404).json({ error: 'No payments found' });
      }

      const result = await emailService.sendCustomEmail(
        recipients,
        subject,
        payments,
        weekStartDate,
        weekEndDate
      );

      res.json(result);
    } catch (error) {
      console.error('Send custom email error:', error);
      res.status(500).json({ error: 'Failed to send email', message: error.message });
    }
  }
);

// Get email recipients
router.get('/recipients',
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const recipients = await EmailRecipient.findAll({
        order: [['email', 'ASC']]
      });
      res.json(recipients);
    } catch (error) {
      console.error('Get recipients error:', error);
      res.status(500).json({ error: 'Failed to fetch recipients' });
    }
  }
);

// Add email recipient
router.post('/recipients',
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const recipient = await EmailRecipient.create({ email, name });
      res.status(201).json(recipient);
    } catch (error) {
      console.error('Add recipient error:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: 'Invalid email address' });
      }
      res.status(500).json({ error: 'Failed to add recipient' });
    }
  }
);

// Toggle recipient status
router.patch('/recipients/:id/toggle-status',
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const recipient = await EmailRecipient.findByPk(req.params.id);

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      await recipient.update({ isActive: !recipient.isActive });
      res.json(recipient);
    } catch (error) {
      console.error('Toggle recipient error:', error);
      res.status(500).json({ error: 'Failed to toggle recipient status' });
    }
  }
);

// Delete recipient
router.delete('/recipients/:id',
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const recipient = await EmailRecipient.findByPk(req.params.id);

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      await recipient.destroy();
      res.json({ message: 'Recipient deleted successfully' });
    } catch (error) {
      console.error('Delete recipient error:', error);
      res.status(500).json({ error: 'Failed to delete recipient' });
    }
  }
);

module.exports = router;
