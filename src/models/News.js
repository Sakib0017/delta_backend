const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
    header: { type: String, required: true },
    content: { type: String, required: true },
    detail: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('News', newsSchema);
