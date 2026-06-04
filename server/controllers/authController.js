const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, name, password, role, department } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        name,
        password: hashedPassword,
        role: role || 'department_user',
        department
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  // Get current user
  me: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      res.json(user);
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  // Microsoft SSO callback
  ssoCallback: async (req, res) => {
    try {
      const { email, name, id: azureId } = req.user;

      // Find or create user
      let user = await User.findOne({ where: { email } });

      if (!user) {
        user = await User.create({
          email,
          name,
          azureId,
          role: 'department_user'
        });
      } else if (!user.azureId) {
        await user.update({ azureId });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('SSO callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
    }
  }
};

module.exports = authController;
