const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  callType: {
    type: String,
    enum: ['discovery', 'strategy', 'consultation'],
    default: 'discovery'
  },
  notes: {
    type: String,
    trim: true
  },
  meetLink: {
    type: String,
    trim: true
  },
  calendarEventId: {
    type: String,
    trim: true
  },
  meetSource: {
    type: String,
    enum: ['google-calendar', 'static', 'none', 'mock-unique', 'static-unique'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
