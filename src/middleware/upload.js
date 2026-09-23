const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vercel serverless functions have a read-only filesystem (except /tmp),
// so uploaded images cannot persist on disk in production.
// Strategy (Vercel standard):
//  - If BLOB_READ_WRITE_TOKEN is set -> keep files in memory and upload
//    them to Vercel Blob, storing the public https URL in MongoDB.
//  - Otherwise (local dev) -> classic disk storage in backend/uploads/.
function isBlobMode() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
// kept for backwards compat — dynamically evaluated
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const isVercel = Boolean(process.env.VERCEL);
const uploadDir = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', '..', 'uploads');
try {
  if (!isBlobMode() && !fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  // On Vercel read-only FS this can throw EROFS — ignore, /tmp fallback already handled
  console.warn('[upload] mkdir failed:', e.message);
}

function getStorage() {
  if (isBlobMode()) return multer.memoryStorage();
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${safeName(file.originalname)}`);
    },
  });
}

function safeName(original = 'file') {
  return path.basename(original).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '') || 'file';
}

function fileFilter(req, file, cb) {
  if (/^image\/(jpeg|png|webp|jpg|gif)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
}

const upload = multer({ storage: getStorage(), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * Persist an uploaded file and return the value to store in MongoDB:
 *  - Blob mode: public https URL (works everywhere, incl. Vercel)
 *  - Disk mode:  "uploads/<filename>" (served by express.static)
 */
async function storeFile(file) {
  if (!file) return '';
  if (isBlobMode()) {
    const { put } = require('@vercel/blob');
    const name = `${Date.now()}_${safeName(file.originalname)}`;
    const blob = await put(name, file.buffer, { access: 'public', contentType: file.mimetype });
    return blob.url;
  }
  return `uploads/${file.filename}`;
}

/** Delete a local disk file. Remote (http) blob URLs are left alone. */
function removeStoredFile(rel) {
  if (!rel || /^https?:\/\//.test(rel)) return;
  const p = path.join(uploadDir, path.basename(rel));
  if (fs.existsSync(p)) {
    try { fs.unlinkSync(p); } catch (e) {}
  }
}

module.exports = { upload, storeFile, removeStoredFile, useBlob };
