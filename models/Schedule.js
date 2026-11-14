const mongoose = require('mongoose');

const DayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  openTime: {
    type: String,
    default: '08:30 AM'
  },
  closeTime: {
    type: String,
    default: '08:30 PM'
  },
  statusText: {
    type: String,
    default: 'Open' // 'Open', 'Closed', 'By Appointment Only'
  },
  customNote: {
    type: String,
    default: ''
  }
}, { _id: false });

const ScheduleSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'clinic_schedule',
    unique: true
  },
  generalHoursText: {
    type: String,
    default: 'Monday – Sunday: 8:30 AM – 8:30 PM'
  },
  notice: {
    type: String,
    default: '(For exact timing kindly connect the customer care)'
  },
  emergencyNote: {
    type: String,
    default: 'Emergency obstetric services available 24/7 at NMC Speciality Hospital'
  },
  days: {
    type: [DayScheduleSchema],
    default: [
      { day: 'Monday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
      { day: 'Tuesday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
      { day: 'Wednesday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
      { day: 'Thursday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
      { day: 'Friday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
      { day: 'Saturday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' },
      { day: 'Sunday', isOpen: true, openTime: '08:30 AM', closeTime: '08:30 PM', statusText: 'Open', customNote: '' }
    ]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
