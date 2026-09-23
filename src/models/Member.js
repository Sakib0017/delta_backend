// `user` singular table (members/subscribers collected separately from auth users)
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    spec: { type: String, default: '' }, // usr_spec
    cember: { type: String, default: '' }, // usr_cember
    room: { type: String, default: '' }, // usr_room
    contact: { type: String, default: '' }, // usr_contact
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);
