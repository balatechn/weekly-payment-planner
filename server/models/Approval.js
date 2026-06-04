module.exports = (sequelize, DataTypes) => {
  const Approval = sequelize.define('Approval', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id'
      }
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    stage: {
      type: DataTypes.ENUM('manager', 'finance'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'approvals',
    indexes: [
      { fields: ['paymentId'] },
      { fields: ['approverId'] },
      { fields: ['status'] },
      { fields: ['stage'] }
    ]
  });

  return Approval;
};
