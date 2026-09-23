const express = require('express');
const { upload, storeFile } = require('../middleware/upload');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/upload  (admin only, single image) -> { url: "uploads/..." }
router.post('/', authRequired, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = await storeFile(req.file);
  res.status(201).json({ url });
});

module.exports = router;
