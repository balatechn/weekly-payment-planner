module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    oldValue: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    newValue: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'audit_logs',
    indexes: [
      { fields: ['userId'] },
      { fields: ['entity'] },
      { fields: ['entityId'] },
      { fields: ['action'] },
      { fields: ['createdAt'] }
    ]
  });

  return AuditLog;
};
