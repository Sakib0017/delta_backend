// history table (vision & mission singleton)
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    image: { type: String, default: '' }, // hs_img
    vision: { type: String, default: '' }, // hs_vision
    mission: { type: String, default: '' }, // hs_mission
    image2: { type: String, default: '' }, // hs_img2
    header: { type: String, default: '' }, // hs_header
    contain: { type: String, default: '' }, // hs_contain (intro text)
  },
  { timestamps: true }
);

module.exports = mongoose.model('History', historySchema);
