module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Nullable for SSO users
    },
    role: {
      type: DataTypes.ENUM('admin', 'finance', 'department_user'),
      allowNull: false,
      defaultValue: 'department_user'
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    azureId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    }
  }, {
    timestamps: true,
    tableName: 'users',
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['azureId'] }
    ]
  });

  return User;
};
