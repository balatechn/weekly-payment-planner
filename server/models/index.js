const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import all models
const User = require('./User')(sequelize, DataTypes);
const Entity = require('./Entity')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);
const Approval = require('./Approval')(sequelize, DataTypes);
const EmailLog = require('./EmailLog')(sequelize, DataTypes);
const AuditLog = require('./AuditLog')(sequelize, DataTypes);
const EmailRecipient = require('./EmailRecipient')(sequelize, DataTypes);

// Define associations
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Entity.hasMany(Payment, { foreignKey: 'entityId', as: 'payments' });
Payment.belongsTo(Entity, { foreignKey: 'entityId', as: 'entity' });

Payment.hasMany(Approval, { foreignKey: 'paymentId', as: 'approvals' });
Approval.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

User.hasMany(Approval, { foreignKey: 'approverId', as: 'approvals' });
Approval.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Entity,
  Payment,
  Approval,
  EmailLog,
  AuditLog,
  EmailRecipient
};
