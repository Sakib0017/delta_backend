// gallary table (note original PHP spelling kept in legacy data; model is Gallery)
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
    header: { type: String, required: true, index: true }, // category tab e.g. "Building & Infrastructure"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema, 'galleries');
