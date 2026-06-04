// Vercel Serverless Function Entry Point
const { sequelize } = require('../models');
let app;
let isDbConnected = false;

async function getApp() {
  if (!app) {
    app = require('../index');
    
    // Ensure database connection for serverless
    if (!isDbConnected) {
      try {
        await sequelize.authenticate();
        console.log('✅ Database connected (serverless)');
        isDbConnected = true;
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
      }
    }
  }
  return app;
}

module.exports = async (req, res) => {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};
