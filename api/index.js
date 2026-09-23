// Vercel serverless entry point for the Express API.
// Vercel reuses warm function instances, so the MongoDB connection is
// cached in src/config/db.js instead of reconnecting per request.
const app = require('../src/app');
const connectDB = require('../src/config/db');

let ready = null;

module.exports = async (req, res) => {
  if (!ready) ready = connectDB(process.env.MONGO_URI);
  await ready;
  return app(req, res);
};
