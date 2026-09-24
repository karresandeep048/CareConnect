const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const { generateToken } = require('../config/jwt');

// @desc    Register a new user (customer, provider, etc.)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, businessName, hourlyRate, skills, zipCode } = req.body;

    // Validation 1: Email must be @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+\-]+@gmail\.com$/i;
    if (!gmailRegex.test(email ? email.trim() : '')) {
      return res.status(400).json({ message: 'Email address must be a valid @gmail.com address (e.g., user@gmail.com)' });
    }

    // Validation 2: Unique Name check (case-insensitive)
    const existingName = await User.findOne({ name: { $regex: new RegExp('^' + name.trim() + '$', 'i') } });
    if (existingName) {
      return res.status(400).json({ message: 'A user with this full name already exists. Please choose a unique name.' });
    }

    // Validation 3: Unique Email check
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    // Validation 4: Password length >= 6
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validation 5: Phone number digit check (if provided)
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10) {
        return res.status(400).json({ message: 'Phone number must contain at least 10 digits' });
      }
    }

    const userRole = ['customer', 'provider', 'admin', 'ops_manager', 'support_agent'].includes(role)
      ? role
      : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone: phone || '',
      address: { zipCode: zipCode || '10001' }
    });

    // If registered as provider, initialize ProviderProfile
    if (userRole === 'provider') {
      await ProviderProfile.create({
        user: user._id,
        businessName: businessName || `${name}'s Pro Services`,
        hourlyRate: hourlyRate || 50,
        skills: skills || ['General Maintenance'],
        serviceAreas: zipCode ? [zipCode, '10001', '10002'] : ['10001'],
        verificationStatus: 'pending',
        availability: [
          { dayOfWeek: 'Monday', startTime: '08:00', endTime: '18:00' },
          { dayOfWeek: 'Tuesday', startTime: '08:00', endTime: '18:00' },
          { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '18:00' },
          { dayOfWeek: 'Thursday', startTime: '08:00', endTime: '18:00' },
          { dayOfWeek: 'Friday', startTime: '08:00', endTime: '18:00' },
          { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '15:00' }
        ]
      });
    }

    const token = generateToken(user);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ProviderProfile.findOne({ user: user._id }).populate('serviceCategories');
    }
    res.json({ user, providerProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request password reset OTP code
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // valid for 15 minutes
    await user.save();

    res.json({
      success: true,
      message: `Password reset verification code generated and sent to ${user.email}.`,
      otp // returned so user can view/autofill reset code in UI
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using OTP code
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword };
