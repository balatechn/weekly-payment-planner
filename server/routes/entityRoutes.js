const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all entities (all users can view)
router.get('/', entityController.getAll);

// Get single entity
router.get('/:id', entityController.getById);

// Admin only routes
router.post('/',
  roleMiddleware('admin'),
  auditMiddleware('CREATE', 'entity'),
  entityController.create
);

router.put('/:id',
  roleMiddleware('admin'),
  auditMiddleware('UPDATE', 'entity'),
  entityController.update
);

router.delete('/:id',
  roleMiddleware('admin'),
  auditMiddleware('DELETE', 'entity'),
  entityController.delete
);

router.patch('/:id/toggle-status',
  roleMiddleware('admin'),
  auditMiddleware('TOGGLE_STATUS', 'entity'),
  entityController.toggleStatus
);

module.exports = router;
