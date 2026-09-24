const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin', 'ops_manager', 'support_agent'],
    default: 'customer'
  },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  isVerified: { type: Boolean, default: false }, // For provider credentials or email check
  status: { type: String, enum: ['active', 'suspended', 'pending_approval'], default: 'active' },
  resetPasswordOTP: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
