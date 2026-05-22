const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  views: {
    type: Number,
    default: 0
  },
  contactSubmissions: {
    type: Number,
    default: 0
  },
  bookingClicks: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

AnalyticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
