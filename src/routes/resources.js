const express = require('express');
const { crudRoutes } = require('./crud');
const { authRequired } = require('../middleware/auth');
const { upload, storeFile, removeStoredFile } = require('../middleware/upload');

const Slider = require('../models/Slider');
const CoreService = require('../models/CoreService');
const Client = require('../models/Client');
const News = require('../models/News');
const ContactMessage = require('../models/ContactMessage');
const Team = require('../models/Team');
const Gallery = require('../models/Gallery');
const History = require('../models/History');
const KeyArea = require('../models/KeyArea');
const About = require('../models/About');
const Member = require('../models/Member');
const Misc = require('../models/Misc');
const { ProjectItem, CATEGORIES } = require('../models/ProjectItem');

const fields = upload.fields([{ name: 'img', maxCount: 1 }, { name: 'image', maxCount: 1 }]);

// ---- standard CRUDs (admin create/update/delete, public read) ----
const sliders = crudRoutes(Slider, { imageField: 'img' });
const services = crudRoutes(CoreService, { imageField: 'img' });
const clients = crudRoutes(Client, { imageField: 'img' });
const news = crudRoutes(News, { imageField: 'img' });
const team = crudRoutes(Team, { imageField: 'img' });
const gallery = crudRoutes(Gallery, { imageField: 'img' });
const keys = crudRoutes(KeyArea, {});
const members = crudRoutes(Member, {});
const misc = crudRoutes(Misc, { imageField: 'img' });

// ---- contacts: public POST open, rest admin-only ----
const contacts = express.Router();
contacts.get('/', authRequired, async (req, res) => {
  const items = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(items);
});
contacts.post('/', async (req, res) => {
  try {
    const b = req.body;
    const item = await ContactMessage.create({
      firstName: b.firstName || b.first_name || b.f_name || '',
      lastName: b.lastName || b.last_name || b.l_name || '',
      email: b.email || '',
      mobile: b.mobile || b.phone || '',
      subject: b.subject || '',
      message: b.message || '',
    });
    res.status(201).json({ message: 'Message sent successfully! We will contact you shortly.', id: item._id });
  } catch (e) { res.status(400).json({ message: e.message }); }
});
contacts.delete('/:id', authRequired, async (req, res) => {
  await ContactMessage.findByIdAndDelete(req.params.id);
  res.json({ message: 'Inquiry deleted successfully!' });
});

// ---- gallery categories (tab headers, mirrors SELECT DISTINCT header) ----
gallery.get('/meta/categories', async (req, res) => {
  const cats = await Gallery.distinct('header');
  res.json(cats);
});

// ---- history: singleton helpers (latest first, mirrors ORDER BY hs_id DESC LIMIT 1) ----
const history = crudRoutes(History, { imageField: null });
history.get('/meta/latest', async (req, res) => {
  const one = await History.findOne().sort({ createdAt: -1 });
  res.json(one);
});

// ---- about singleton ----
const about = crudRoutes(About, { imageField: null });

// ---- projects: one router keyed by category ----
const projects = express.Router();
projects.get('/:category', async (req, res) => {
  const { category } = req.params;
  if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'Unknown category', categories: CATEGORIES });
  res.json(await ProjectItem.find({ category }).sort({ createdAt: -1 }));
});
projects.post('/:category', authRequired, fields, async (req, res) => {
  const { category } = req.params;
  if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'Unknown category' });
  const file = (req.files && (req.files.img?.[0] || req.files.image?.[0])) || null;
  const item = await ProjectItem.create({
    category,
    img: file ? await storeFile(file) : (req.body.img || ''),
    header: req.body.header || '',
    content: req.body.content || '',
  });
  res.status(201).json(item);
});
projects.put('/:id', authRequired, fields, async (req, res) => {
  const item = await ProjectItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  const file = (req.files && (req.files.img?.[0] || req.files.image?.[0])) || null;
  if (file) {
    if (item.img) removeStoredFile(item.img);
    item.img = await storeFile(file);
  }
  if (req.body.header !== undefined) item.header = req.body.header;
  if (req.body.content !== undefined) item.content = req.body.content;
  if (req.body.category && CATEGORIES.includes(req.body.category)) item.category = req.body.category;
  await item.save();
  res.json(item);
});
projects.delete('/:id', authRequired, async (req, res) => {
  await ProjectItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

module.exports = { sliders, services, clients, news, team, gallery, keys, members, misc, contacts, history, about, projects, CATEGORIES };
