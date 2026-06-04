const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all users (admin and finance only)
router.get('/', 
  roleMiddleware('admin', 'finance'),
  async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Get single user
router.get('/:id',
  roleMiddleware('admin', 'finance'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
);

// Create user (admin only)
router.post('/',
  roleMiddleware('admin'),
  auditMiddleware('CREATE', 'user'),
  async (req, res) => {
    try {
      const { email, name, password, role, department } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        name,
        password: hashedPassword,
        role,
        department
      });

      const userResponse = user.toJSON();
      delete userResponse.password;

      res.status(201).json(userResponse);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

// Update user (admin only)
router.put('/:id',
  roleMiddleware('admin'),
  auditMiddleware('UPDATE', 'user'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updateData = { ...req.body };
      
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      await user.update(updateData);

      const userResponse = user.toJSON();
      delete userResponse.password;

      res.json(userResponse);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// Toggle user status (admin only)
router.patch('/:id/toggle-status',
  roleMiddleware('admin'),
  auditMiddleware('TOGGLE_STATUS', 'user'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ isActive: !user.isActive });

      const userResponse = user.toJSON();
      delete userResponse.password;

      res.json(userResponse);
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({ error: 'Failed to toggle user status' });
    }
  }
);

// Delete user (admin only)
router.delete('/:id',
  roleMiddleware('admin'),
  auditMiddleware('DELETE', 'user'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.id === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      await user.destroy();

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

module.exports = router;
