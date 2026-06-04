module.exports = (sequelize, DataTypes) => {
  const EmailRecipient = sequelize.define('EmailRecipient', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    tableName: 'email_recipients',
    indexes: [
      { fields: ['email'] },
      { fields: ['isActive'] }
    ]
  });

  return EmailRecipient;
};
