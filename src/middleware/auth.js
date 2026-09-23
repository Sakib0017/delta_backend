const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  try {
    let token = null;
    if (req.cookies && req.cookies.token) token = req.cookies.token;
    const header = req.headers.authorization || '';
    if (!token && header.startsWith('Bearer ')) token = header.slice(7);
    if (!token) return res.status(401).json({ message: 'Unauthorized. Please login.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Session expired. Please login again.' });
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { authRequired, signToken };
