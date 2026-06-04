require('dotenv').config();
const { Sequelize } = require('sequelize');

const neonUrl = 'postgresql://neondb_owner:npg_UTv8dPz0wEWt@ep-dawn-grass-aplpbtok-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require';

const db = new Sequelize(process.env.DATABASE_URL || neonUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL
      ? { require: true, rejectUnauthorized: false }
      : false
  },
  logging: false
});

db.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS "attachmentData" TEXT')
  .then(() => {
    console.log('✅ attachmentData column added to payments table');
    process.exit(0);
  })
  .catch(e => {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  });
