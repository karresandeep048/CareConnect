const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Wrench' },
  subcategories: [{
    name: String,
    skillsRequired: [String],
    basePriceEstimate: Number
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
