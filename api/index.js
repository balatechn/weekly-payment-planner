// Vercel serverless entry point
// dotenv is a no-op on Vercel (env vars are set in dashboard)
require('dotenv').config({ path: `${__dirname}/../server/.env` });

// Explicitly require pg so Vercel's bundler (nft) includes it — Sequelize loads it dynamically
require('pg');
require('pg-hstore');

const app = require('../server/index');

module.exports = app;
