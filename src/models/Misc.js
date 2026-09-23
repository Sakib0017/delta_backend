// micell table (miscellaneous content blocks)
const mongoose = require('mongoose');

const miscSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    img: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Misc', miscSchema);
