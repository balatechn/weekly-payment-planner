// Vercel serverless entry point
// dotenv is a no-op on Vercel (env vars are set in dashboard)
require('dotenv').config({ path: `${__dirname}/../server/.env` });

const app = require('../server/index');

module.exports = app;
