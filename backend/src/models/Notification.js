const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'SERVICE_REQUEST',
      'QUOTE_SUBMITTED',
      'QUOTE_ACCEPTED',
      'BOOKING_SCHEDULED',
      'JOB_IN_PROGRESS',
      'JOB_COMPLETED',
      'INVOICE_GENERATED',
      'INVOICE_PAID',
      'SYSTEM'
    ],
    default: 'SYSTEM'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  link: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
