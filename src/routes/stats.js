const express = require('express');
const Slider = require('../models/Slider');
const CoreService = require('../models/CoreService');
const Client = require('../models/Client');
const News = require('../models/News');
const ContactMessage = require('../models/ContactMessage');
const Team = require('../models/Team');
const Gallery = require('../models/Gallery');
const KeyArea = require('../models/KeyArea');
const { ProjectItem } = require('../models/ProjectItem');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats (admin dashboard counters — mirrors dashboard needs)
router.get('/', authRequired, async (req, res) => {
  try {
    const [sliders, services, partners, news, messages, team, gallery, keys, projects, users] = await Promise.all([
      Slider.countDocuments(), CoreService.countDocuments(), Client.countDocuments(),
      News.countDocuments(), ContactMessage.countDocuments(), Team.countDocuments(),
      Gallery.countDocuments(), KeyArea.countDocuments(), ProjectItem.countDocuments(),
      User.countDocuments(),
    ]);
    const latestMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(5);
    res.json({ sliders, services, partners, news, messages, team, gallery, keys, projects, users, latestMessages });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
