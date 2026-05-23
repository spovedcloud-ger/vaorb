/**
 * One-shot script: connect to MongoDB Atlas and seed/sync collections.
 * Usage: node scripts/sync-db.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const defaultPricing = require('../data/defaultPricing');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing. Set it in server/.env');
    process.exit(1);
  }

  const safeLogUri = uri.replace(/:([^:@/]+)@/, ':****@');
  console.log(`Connecting to ${safeLogUri}`);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
  console.log(`Connected to database: ${mongoose.connection.name}`);

  const Pricing = require('../models/Pricing');
  const Analytics = require('../models/Analytics');
  const Inquiry = require('../models/Inquiry');
  const Booking = require('../models/Booking');

  for (const plan of defaultPricing) {
    await Pricing.findOneAndUpdate(
      { planType: plan.planType },
      { $set: plan },
      { upsert: true, new: true }
    );
  }
  console.log(`Synced ${defaultPricing.length} pricing plans.`);

  await Analytics.findOneAndUpdate(
    {},
    { $setOnInsert: { views: 0, contactSubmissions: 0, bookingClicks: 0 } },
    { upsert: true, new: true }
  );
  console.log('Analytics document ready.');

  const counts = {
    pricing: await Pricing.countDocuments(),
    inquiries: await Inquiry.countDocuments(),
    bookings: await Booking.countDocuments(),
    analytics: await Analytics.countDocuments()
  };
  console.log('Collection counts:', counts);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Sync failed:', err.message);
  process.exit(1);
});
