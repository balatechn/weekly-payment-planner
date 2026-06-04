const { Payment, Entity, User, Approval } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;

const paymentController = {
  // Create payment
  create: async (req, res) => {
    try {
      const paymentData = {
        ...req.body,
        userId: req.user.id,
        attachment: req.file ? req.file.filename : null,
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

      // Apply filters
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

      // Check access
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

      // Check access
      if (req.user.role === 'department_user' && payment.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Only draft payments can be edited by department users
      if (req.user.role === 'department_user' && payment.status !== 'draft') {
        return res.status(403).json({ error: 'Cannot edit submitted payments' });
      }

      const updateData = {
        ...req.body,
        totalAmount: parseFloat(req.body.invoiceAmount || payment.invoiceAmount) + 
                     parseFloat(req.body.gstAmount || payment.gstAmount || 0)
      };

      if (req.file) {
        updateData.attachment = req.file.filename;
        
        // Delete old file
        if (payment.attachment) {
          try {
            await fs.unlink(`./uploads/${payment.attachment}`);
          } catch (err) {
            console.error('Failed to delete old file:', err);
          }
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

      // Check access
      if (req.user.role === 'department_user' && payment.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Only draft payments can be deleted
      if (payment.status !== 'draft') {
        return res.status(403).json({ error: 'Can only delete draft payments' });
      }

      // Delete attachment
      if (payment.attachment) {
        try {
          await fs.unlink(`./uploads/${payment.attachment}`);
        } catch (err) {
          console.error('Failed to delete file:', err);
        }
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
