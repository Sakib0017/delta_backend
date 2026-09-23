// keys1 table (About key areas of impact)
const mongoose = require('mongoose');

const keyAreaSchema = new mongoose.Schema(
  {
    header: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('KeyArea', keyAreaSchema);
