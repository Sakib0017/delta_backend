// clients table (corporate partners)
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
