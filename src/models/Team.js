const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true }, // role e.g. Chairman & Managing Director
    content: { type: String, required: true }, // bio / education
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
