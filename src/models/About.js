// about table (singleton-ish)
const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema(
  {
    image: { type: String, default: '' }, // ab_img
    eDate: { type: Date }, // ab_e_date
    eContent1: { type: String, default: '' },
    eContent2: { type: String, default: '' },
    image2: { type: String, default: '' }, // ab_img2
    content: { type: String, default: '' }, // ab_content
    chairmanImage: { type: String, default: '' }, // ab_chm_img
    chairmanName: { type: String, default: '' },
    chairmanEducation: { type: String, default: '' },
    chairmanSpeech: { type: String, default: '' },
    proImage: { type: String, default: '' }, // ab_pro_img
    proDetail: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('About', aboutSchema);
