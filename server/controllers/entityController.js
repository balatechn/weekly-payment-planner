const { Entity } = require('../models');

const entityController = {
  // Create entity
  create: async (req, res) => {
    try {
      const { name, code, description } = req.body;

      const entity = await Entity.create({
        name,
        code,
        description
      });

      res.status(201).json(entity);
    } catch (error) {
      console.error('Create entity error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Entity name or code already exists' });
      }
      res.status(500).json({ error: 'Failed to create entity' });
    }
  },

  // Get all entities
  getAll: async (req, res) => {
    try {
      const { isActive } = req.query;
      
      const where = {};
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const entities = await Entity.findAll({
        where,
        order: [['name', 'ASC']]
      });

      res.json(entities);
    } catch (error) {
      console.error('Get entities error:', error);
      res.status(500).json({ error: 'Failed to fetch entities' });
    }
  },

  // Get single entity
  getById: async (req, res) => {
    try {
      const entity = await Entity.findByPk(req.params.id);

      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      res.json(entity);
    } catch (error) {
      console.error('Get entity error:', error);
      res.status(500).json({ error: 'Failed to fetch entity' });
    }
  },

  // Update entity
  update: async (req, res) => {
    try {
      const entity = await Entity.findByPk(req.params.id);

      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      await entity.update(req.body);

      res.json(entity);
    } catch (error) {
      console.error('Update entity error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Entity name or code already exists' });
      }
      res.status(500).json({ error: 'Failed to update entity' });
    }
  },

  // Delete entity
  delete: async (req, res) => {
    try {
      const entity = await Entity.findByPk(req.params.id);

      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      await entity.destroy();

      res.json({ message: 'Entity deleted successfully' });
    } catch (error) {
      console.error('Delete entity error:', error);
      res.status(500).json({ error: 'Failed to delete entity' });
    }
  },

  // Toggle entity status
  toggleStatus: async (req, res) => {
    try {
      const entity = await Entity.findByPk(req.params.id);

      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      await entity.update({ isActive: !entity.isActive });

      res.json(entity);
    } catch (error) {
      console.error('Toggle entity status error:', error);
      res.status(500).json({ error: 'Failed to toggle entity status' });
    }
  }
};

module.exports = entityController;
