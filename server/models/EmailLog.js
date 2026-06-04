module.exports = (sequelize, DataTypes) => {
  const EmailLog = sequelize.define('EmailLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    recipients: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    weekYear: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    weekStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    weekEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    paymentCount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('sent', 'failed'),
      allowNull: false
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    tableName: 'email_logs',
    indexes: [
      { fields: ['weekNumber', 'weekYear'] },
      { fields: ['status'] },
      { fields: ['sentAt'] }
    ]
  });

  return EmailLog;
};
