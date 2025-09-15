const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  status: { type: String, enum: ['Lead','In Progress','Converted'], default: 'Lead' }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
