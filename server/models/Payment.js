module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'entities',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    vendorName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    natureOfExpense: {
      type: DataTypes.STRING,
      allowNull: false
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    invoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    invoiceAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    gstAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    paymentTerms: {
      type: DataTypes.ENUM('Advance', 'Part Payment', 'Final Invoice', 'Retention', 'Urgent'),
      allowNull: false
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    attachment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid'),
      defaultValue: 'draft'
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    weekYear: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'payments',
    indexes: [
      { fields: ['entityId'] },
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['dueDate'] },
      { fields: ['weekNumber', 'weekYear'] },
      { fields: ['invoiceNumber'] }
    ]
  });

  return Payment;
};
