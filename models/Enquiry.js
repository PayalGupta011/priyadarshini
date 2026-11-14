const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  service: {
    type: String,
    trim: true,
    default: 'General Consultation'
  },
  preferredDate: {
    type: String,
    default: ''
  },
  preferredTime: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'New'
  },
  notes: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'Website Contact Form'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
