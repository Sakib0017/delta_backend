const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const statsRoutes = require('./routes/stats');
const R = require('./routes/resources');

const app = express();

// Comma-separated origins allowed (local + deployed frontend URLs),
// e.g. CLIENT_URL=https://delta-frontend.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static uploads — only in disk mode (local dev). On Vercel, images live
// on Vercel Blob as https URLs, so there is nothing local to serve.
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (fs.existsSync(uploadsPath)) {
  app.use('/uploads', express.static(uploadsPath));
}

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'delta-mern', time: new Date().toISOString() }));
app.get('/api/meta/categories', (req, res) => res.json({ projectCategories: R.CATEGORIES }));

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

app.use('/api/sliders', R.sliders);
app.use('/api/services', R.services);
app.use('/api/clients', R.clients);
app.use('/api/news', R.news);
app.use('/api/contacts', R.contacts);
app.use('/api/team', R.team);
app.use('/api/gallery', R.gallery);
app.use('/api/history', R.history);
app.use('/api/keys', R.keys);
app.use('/api/about', R.about);
app.use('/api/members', R.members);
app.use('/api/misc', R.misc);
app.use('/api/projects', R.projects);

// legacy PHP filename aliases -> hint new routes (helps migration)
app.get('/api/legacy-map', (req, res) => res.json({
  'index.php': 'GET /api/sliders + /api/services + /api/clients + /api/news',
  'about.php': 'GET /api/about + /api/keys',
  'contact.php': 'POST /api/contacts',
  'team.php': 'GET /api/team',
  'gallary.php': 'GET /api/gallery + /api/gallery/meta/categories',
  'history.php': 'GET /api/history/meta/latest',
  'building.php (climate)': 'GET /api/projects/climate',
  'road.php (environ)': 'GET /api/projects/environ',
  'environment.php (transportation)': 'GET /api/projects/transportation',
  'water.php (agricultural)': 'GET /api/projects/agricultural',
  'digital.php (advisory/agricultural)': 'GET /api/projects/advisory',
  'engineering.php': 'GET /api/projects/engineering',
  'admin/*': 'All /api/* with admin JWT (see README)',
}));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;
