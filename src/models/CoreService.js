// c_services table
const mongoose = require('mongoose');

const coreServiceSchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
    content: { type: String, required: true }, // card title
    content1: { type: String, default: '' }, // card subtitle
    links: { type: String, default: '' }, // e.g. environment.php -> now /services/environment
  },
  { timestamps: true }
);

module.exports = mongoose.model('CoreService', coreServiceSchema);
