const express = require('express');
const router = express.Router();
const { AuditLog, User } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'finance'));

// Get audit logs
router.get('/', async (req, res) => {
  try {
    const { 
      entity, 
      action, 
      userId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    const where = {};

    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      logs: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit log for specific entity
router.get('/entity/:entity/:entityId', async (req, res) => {
  try {
    const { entity, entityId } = req.params;

    const logs = await AuditLog.findAll({
      where: {
        entity,
        entityId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(logs);
  } catch (error) {
    console.error('Get entity audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
