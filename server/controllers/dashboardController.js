const { Payment, Entity, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const dashboardController = {
  // Get dashboard summary
  getSummary: async (req, res) => {
    try {
      const where = {};

      // Department users only see their own data
      if (req.user.role === 'department_user') {
        where.userId = req.user.id;
      }

      // Get total counts by status
      const totalRequests = await Payment.count({ where });
      
      const pendingApproval = await Payment.count({
        where: {
          ...where,
          status: { [Op.in]: ['submitted', 'under_review'] }
        }
      });

      const approved = await Payment.count({
        where: { ...where, status: 'approved' }
      });

      const rejected = await Payment.count({
        where: { ...where, status: 'rejected' }
      });

      const paid = await Payment.count({
        where: { ...where, status: 'paid' }
      });

      // Get total amount of approved payments
      const totalAmountResult = await Payment.findAll({
        where: { ...where, status: 'approved' },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']
        ],
        raw: true
      });

      const totalAmount = totalAmountResult[0]?.total || 0;

      // Get overdue payments
      const overduePayments = await Payment.count({
        where: {
          ...where,
          dueDate: { [Op.lt]: new Date() },
          status: { [Op.notIn]: ['paid', 'rejected'] }
        }
      });

      // Get upcoming payments (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const upcomingPayments = await Payment.count({
        where: {
          ...where,
          dueDate: {
            [Op.gte]: new Date(),
            [Op.lte]: nextWeek
          },
          status: { [Op.notIn]: ['paid', 'rejected'] }
        }
      });

      res.json({
        totalRequests,
        totalAmount: parseFloat(totalAmount).toFixed(2),
        pendingApproval,
        approved,
        rejected,
        paid,
        overduePayments,
        upcomingPayments
      });
    } catch (error) {
      console.error('Dashboard summary error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
  },

  // Get recent payments
  getRecentPayments: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const where = {};

      if (req.user.role === 'department_user') {
        where.userId = req.user.id;
      }

      const payments = await Payment.findAll({
        where,
        include: [
          { model: Entity, as: 'entity' },
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      res.json(payments);
    } catch (error) {
      console.error('Recent payments error:', error);
      res.status(500).json({ error: 'Failed to fetch recent payments' });
    }
  },

  // Get payment statistics by entity
  getEntityStats: async (req, res) => {
    try {
      const where = {};

      if (req.user.role === 'department_user') {
        where.userId = req.user.id;
      }

      const stats = await Payment.findAll({
        where,
        attributes: [
          'entityId',
          [sequelize.fn('COUNT', sequelize.col('Payment.id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']
        ],
        include: [
          {
            model: Entity,
            as: 'entity',
            attributes: ['name']
          }
        ],
        group: ['entityId', 'entity.id'],
        order: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'DESC']]
      });

      res.json(stats);
    } catch (error) {
      console.error('Entity stats error:', error);
      res.status(500).json({ error: 'Failed to fetch entity statistics' });
    }
  },

  // Get payment trends (monthly)
  getPaymentTrends: async (req, res) => {
    try {
      const { months = 6 } = req.query;
      const where = {};

      if (req.user.role === 'department_user') {
        where.userId = req.user.id;
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(months));

      where.createdAt = { [Op.gte]: startDate };

      const trends = await Payment.findAll({
        where,
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']
        ],
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']]
      });

      res.json(trends);
    } catch (error) {
      console.error('Payment trends error:', error);
      res.status(500).json({ error: 'Failed to fetch payment trends' });
    }
  }
};

module.exports = dashboardController;
