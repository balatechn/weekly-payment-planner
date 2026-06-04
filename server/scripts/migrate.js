const { sequelize } = require('../models');

const migrate = async () => {
  try {
    console.log('🔄 Running database migrations...');

    // Authenticate connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database synchronized');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;
