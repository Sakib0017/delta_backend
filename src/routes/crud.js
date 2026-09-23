const express = require('express');
const { upload, storeFile, removeStoredFile: removeFile } = require('../middleware/upload');
const { authRequired } = require('../middleware/auth');

const fields = upload.fields([{ name: 'img', maxCount: 1 }, { name: 'image', maxCount: 1 }, { name: 'usr_image', maxCount: 1 }]);

/**
 * Generic CRUD router.
 * options: { imageField: 'img'|'image'|null, mapBody: (body)=>docFields }
 */
function crudRoutes(Model, options = {}) {
  const router = express.Router();
  const { imageField = null, mapBody = (b) => b } = options;

  router.get('/', async (req, res) => {
    try {
      const items = await Model.find().sort({ createdAt: -1 });
      res.json(items);
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

  router.post('/', authRequired, fields, async (req, res) => {
    try {
      const data = mapBody({ ...req.body });
      const file = (req.files && (req.files.img?.[0] || req.files.image?.[0] || req.files.usr_image?.[0])) || null;
      if (imageField && file) data[imageField] = await storeFile(file);
      const item = await Model.create(data);
      res.status(201).json(item);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.put('/:id', authRequired, fields, async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });
      const data = mapBody({ ...req.body });
      const file = (req.files && (req.files.img?.[0] || req.files.image?.[0] || req.files.usr_image?.[0])) || null;
      if (imageField && file) {
        removeFile(item[imageField]);
        data[imageField] = await storeFile(file);
      }
      Object.assign(item, data);
      await item.save();
      res.json(item);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.delete('/:id', authRequired, async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });
      if (imageField && item[imageField]) removeFile(item[imageField]);
      await item.deleteOne();
      res.json({ message: 'Deleted successfully' });
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

  return router;
}

module.exports = { crudRoutes, removeFile };
