const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
  planType: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  titleSub: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  rateText: {
    type: String,
    trim: true
  },
  priceSuffix: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  buyPlan: {
    type: String,
    trim: true
  },
  period: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: [String],
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

PricingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Pricing', PricingSchema);
