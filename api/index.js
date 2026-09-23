// Vercel serverless entry point for the Express API.
// Vercel reuses warm function instances, so the MongoDB connection is
// cached in src/config/db.js instead of reconnecting per request.
try { require('dotenv').config(); } catch (e) {}

const app = require('../src/app');
const connectDB = require('../src/config/db');

let ready = null;

module.exports = async (req, res) => {
  // Allow health check without DB — useful to verify deployment without MONGO_URI
  if (req.url === '/api/health' || req.url.startsWith('/api/health?')) {
    try {
      if (process.env.MONGO_URI) {
        if (!ready) ready = connectDB(process.env.MONGO_URI);
        await ready;
        return app(req, res);
      }
      // No DB yet, still return health with warning
      res.status(200).json({ ok: true, app: 'delta-mern', time: new Date().toISOString(), db: 'not-connected', warning: 'MONGO_URI not set' });
      return;
    } catch (e) {
      console.error('[api] health db error:', e.message);
      res.status(200).json({ ok: true, app: 'delta-mern', time: new Date().toISOString(), db: 'error', error: e.message });
      return;
    }
  }

  try {
    if (!process.env.MONGO_URI) {
      console.error('[api] MONGO_URI is missing — set it in Vercel Environment Variables');
      res.status(500).json({ message: 'Server misconfigured: MONGO_URI is missing. Add it in Vercel → Settings → Environment Variables and redeploy.' });
      return;
    }
    if (!ready) ready = connectDB(process.env.MONGO_URI);
    await ready;
  } catch (e) {
    console.error('[api] DB connection failed:', e);
    // reset so next invocation can retry (don't cache rejected promise forever)
    ready = null;
    if (global.__deltaMongoose) global.__deltaMongoose.promise = null;
    res.status(500).json({ message: 'Database connection failed', error: e.message });
    return;
  }

  return app(req, res);
};
