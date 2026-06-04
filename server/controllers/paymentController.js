const { Payment, Entity, User, Approval } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Resolve upload directory — /tmp on Vercel, local uploads otherwise
const uploadDir = process.env.VERCEL
  ? '/tmp/uploads'
  : path.join(__dirname, '../uploads');

// Save file buffer from memoryStorage to disk, return the filename
const saveFileToDisk = async (file) => {
  if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir, { recursive: true });
  }
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
  await fs.writeFile(path.join(uploadDir, filename), file.buffer);
  return filename;
};

const paymentController = {
  // Create payment
  create: async (req, res) => {
    try {
      let attachmentFilename = null;
      if (req.file) {
        attachmentFilename = await saveFileToDisk(req.file);
      }

      const paymentData = {
        ...req.body,
        userId: req.user.id,
        attachment: attachmentFilename,
        totalAmount: parseFloat(req.body.invoiceAmount) + parseFloat(req.body.gstAmount || 0)
      };

      const payment = await Payment.create(paymentData);

      const paymentWithDetails = await Payment.findByPk(payment.id, {
        include: [
          { model: Entity, as: 'entity' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ]
      });

      res.status(201).json(paymentWithDetails);
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  },

  // Get all payments with filters
  getAll: async (req, res) => {
    try {
      const {
        entityId,
        status,
        dueDate,
        vendorName,
        weekNumber,
        weekYear,
        page = 1,
        limit = 50
      } = req.query;

      const where = {};

      if (entityId) where.entityId = entityId;
      if (status) where.status = status;
      if (dueDate) where.dueDate = dueDate;
      if (vendorName) where.vendorName = { [Op.iLike]: `%${vendorName}%` };
      if (weekNumber) where.weekNumber = weekNumber;
      if (weekYear) where.weekYear = weekYear;

      // Non-admin users can only see their own payments
      if (req.user.role === 'department_user') {
        where.userId = req.user.id;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Payment.findAndCountAll({
        where,
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
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        payments: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  },

  // Get single payment
  getById: async (req, res) => {
    try {
      const payment = await Payment.findByPk(req.params.id, {
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

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (req.user.role === 'department_user' && payment.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(payment);
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({ error: 'Failed to fetch payment' });
    }
  },

  // Update payment
  update: async (req, res) => {
    try {
      const payment = await Payment.findByPk(req.params.id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (req.user.role === 'department_user' && payment.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (req.user.role === 'department_user' && payment.status !== 'draft') {
        return res.status(403).json({ error: 'Cannot edit submitted payments' });
      }

      const updateData = {
        ...req.body,
        totalAmount: parseFloat(req.body.invoiceAmount || payment.invoiceAmount) +
                     parseFloat(req.body.gstAmount || payment.gstAmount || 0)
      };

      if (req.file) {
        updateData.attachment = await saveFileToDisk(req.file);
        // Attempt to delete old file (best-effort)
        if (payment.attachment) {
          try {
            await fs.unlink(path.join(uploadDir, payment.attachment));
          } catch (err) { /* ignore — file may not exist on Vercel */ }
        }
      }

      await payment.update(updateData);

      const updatedPayment = await Payment.findByPk(payment.id, {
        include: [
          { model: Entity, as: 'entity' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ]
      });

      res.json(updatedPayment);
    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({ error: 'Failed to update payment' });
    }
  },

  // Delete payment
  delete: async (req, res) => {
    try {
      const payment = await Payment.findByPk(req.params.id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (req.user.role === 'department_user' && payment.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (payment.status !== 'draft') {
        return res.status(403).json({ error: 'Can only delete draft payments' });
      }

      if (payment.attachment) {
        try {
          await fs.unlink(path.join(uploadDir, payment.attachment));
        } catch (err) { /* ignore */ }
      }

      await payment.destroy();

      res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
      console.error('Delete payment error:', error);
      res.status(500).json({ error: 'Failed to delete payment' });
    }
  },

  // Submit payment for approval
  submit: async (req, res) => {
    try {
      const payment = await Payment.findByPk(req.params.id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (payment.status !== 'draft') {
        return res.status(400).json({ error: 'Payment already submitted' });
      }

      await payment.update({ status: 'submitted' });

      res.json({ message: 'Payment submitted successfully', payment });
    } catch (error) {
      console.error('Submit payment error:', error);
      res.status(500).json({ error: 'Failed to submit payment' });
    }
  }
};

module.exports = paymentController;
