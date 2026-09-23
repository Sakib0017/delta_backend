/**
 * Replaces 6 legacy MySQL tables with one collection + category field:
 *  - advisory      (Digital Monitoring & Smart Systems) -> 'advisory'
 *  - agricultural  (Water & Wastewater / also used by digital.php) -> 'agricultural'
 *  - climate       (Building & Infrastructure, building.php) -> 'climate'
 *  - engineering   (Engineering Design, engineering.php) -> 'engineering'
 *  - environ       (Road page data, road.php) -> 'environ'
 *  - transportation(Environmental Assessment, environment.php) -> 'transportation'
 */
const mongoose = require('mongoose');

const CATEGORIES = ['advisory', 'agricultural', 'climate', 'engineering', 'environ', 'transportation'];

const projectItemSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    img: { type: String, required: true },
    header: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = { ProjectItem: mongoose.model('ProjectItem', projectItemSchema), CATEGORIES };
