const { AuditLog } = require('../models');

const auditMiddleware = (action, entity) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = async function(data) {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await AuditLog.create({
            userId: req.user?.id || null,
            action,
            entity,
            entityId: req.params.id || data?.id || null,
            oldValue: req.oldValue || null,
            newValue: req.body || data || null,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          });
        }
      } catch (error) {
        console.error('Audit log error:', error);
      }

      originalJson.call(this, data);
    };

    next();
  };
};

module.exports = auditMiddleware;
