// users table (admin/auth) -> Mongo collection 'users'
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true, minlength: 3 },
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    image: { type: String, default: null }, // e.g. "uploads/123_file.png"
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
