const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { upload, storeFile } = require('../middleware/upload');
const { authRequired, signToken } = require('../middleware/auth');

const router = express.Router();
const fields = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'usr_image', maxCount: 1 }, { name: 'img', maxCount: 1 }]);

function setCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register  (public — mirrors PHP register.php)
router.post('/register', fields, async (req, res) => {
  try {
    const fullname = (req.body.fullname || req.body.usr_fullname || '').trim();
    const username = (req.body.username || req.body.usr_name || '').trim();
    const email = (req.body.email || req.body.usr_email || '').trim().toLowerCase();
    const password = req.body.password || req.body.usr_pass || '';
    const confirm = req.body.confirm || req.body.usr_pass_con || '';

    if (fullname.length < 3) return res.status(400).json({ message: 'Full name must be at least 3 characters.' });
    if (username.length < 3) return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (password !== confirm) return res.status(400).json({ message: 'Password and Confirm Password do not match.' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'Email or Username already exists.' });

    const file = (req.files && (req.files.image?.[0] || req.files.usr_image?.[0] || req.files.img?.[0])) || null;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullname, username, email, password: hash,
      image: file ? await storeFile(file) : null,
    });
    res.status(201).json({ message: 'Registration successful. You can login now.', id: user._id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || req.body.usr_email || '').trim().toLowerCase();
    const password = req.body.password || req.body.usr_pass || '';
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password.' });
    const token = signToken({ _id: user._id, email: user.email, username: user.username });
    setCookie(res, token);
    res.json({
      token,
      user: { id: user._id, fullname: user.fullname, username: user.username, email: user.email, image: user.image },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/auth/me
router.get('/me', authRequired, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user._id, fullname: user.fullname, username: user.username, email: user.email, image: user.image });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// POST /api/auth/forgot  { email } — mirrors password_resets table flow
router.post('/forgot', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });
    const raw = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(raw, 10);
    await PasswordReset.deleteMany({ email });
    await PasswordReset.create({ email, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/reset-password?email=${encodeURIComponent(email)}&token=${raw}`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const tx = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await tx.sendMail({ from: process.env.MAIL_FROM, to: email, subject: 'Reset your DELTA password', text: `Reset link (1h): ${resetUrl}` });
      return res.json({ message: 'Reset link sent to your email.' });
    }
    // dev fallback: return token so admin can reset without SMTP
    return res.json({ message: 'Reset token generated (SMTP not configured).', resetUrl, token: raw });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/reset  { email, token, password, confirm }
router.post('/reset', async (req, res) => {
  try {
    const { email, token, password, confirm } = req.body;
    if (!email || !token || !password) return res.status(400).json({ message: 'Email, token and new password required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (confirm && password !== confirm) return res.status(400).json({ message: 'Passwords do not match.' });
    const rec = await PasswordReset.findOne({ email: email.toLowerCase() });
    if (!rec || rec.expiresAt < new Date()) return res.status(400).json({ message: 'Invalid or expired token.' });
    const ok = await bcrypt.compare(token, rec.tokenHash);
    if (!ok) return res.status(400).json({ message: 'Invalid or expired token.' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await PasswordReset.deleteMany({ email: email.toLowerCase() });
    res.json({ message: 'Password reset successful. You can login now.' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
