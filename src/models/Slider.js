const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
    header: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slider', sliderSchema);
