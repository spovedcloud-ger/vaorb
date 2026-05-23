const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial state
const defaultDB = {
  inquiries: [],
  bookings: [],
  analytics: {
    views: 0,
    contactSubmissions: 0,
    bookingClicks: 0
  },
  pricing: [
    { planType: 'yearly', title: 'Yearly Support', price: 6480, rateText: '$18/hr', period: 'year', details: ['SAVE $3240 | Best Deal', 'Consumable monthly', 'Max 30hrs/mo', '7.5hrs/week', '1.5hrs/day'] },
    { planType: 'monthly', title: 'Monthly Retainer', price: 810, rateText: '$27/hr', period: 'month', details: ['Billed monthly recurring', '6 months retainer', 'Consumable monthly', 'Max 30hrs/mo', '7.5hrs/week', '1.5hrs/day'] },
    { planType: 'as-needed', title: 'As-Needed Support', price: 1080, rateText: '$36/hr', period: 'as-needed', details: ['Consumable in 1 month', 'Max 30hrs/mo', '7.5hrs/week', '1.5hrs/day'] },
    
    { planType: 'standard', title: 'Standard Package', price: 3500, period: 'one-time', details: ['Home & inner page templates', 'Up to 7 inner pages', 'Mobile responsive & SEO friendly', 'Newsletter/opt-in form', 'Up to 2 rounds of revisions'] },
    { planType: 'plus', title: 'Plus Package', titleSub: 'Niche Specific', price: 4500, period: 'one-time', details: ['Standard spec + custom niche feature', 'Up to 9 inner pages', 'Perfect for real estate, coaching, podcasting', 'Integration with booking/reservation systems'] },
    { planType: 'advanced', title: 'Advanced Package', titleSub: 'E-commerce/Shop', price: 6500, period: 'one-time', details: ['Plus spec + full online storefront', 'Up to 12 inner pages', 'Payment gateways (Paypal, Stripe, WooCommerce)', 'Membership or online courses portal'] },
    { planType: 'one-pager', title: 'One-Pager Package', price: 2500, period: 'one-time', details: ['Standard website components', 'Single landing page layout', 'Up to 7 sections included', 'Fully custom brand style'] },
    { planType: 'enterprise', title: 'Enterprise Solution', price: 9500, period: 'one-time', details: ['Advanced spec + custom high-scale needs', 'Unlimited pages & custom databases', 'Tailored API integrations', 'Dedicated staging setup'] },
    
    { planType: 'mockup', title: 'Mockup To WP', price: 1500, period: 'one-time', details: ['Convert layered PSD/Figma design to WordPress', '$1500 / main page', '$900 / inner page', 'Perfect dynamic responsive styling', '2-4+ days turnaround per page'] },
    { planType: 'setup', title: 'WP Setup', price: 900, period: 'one-time', details: ['Theme installation & configuration', 'Adapts content to matching template layout', 'Uses client-provided logo, server, and texts', '1-day express delivery'] },
    { planType: 'diy', title: 'WP DIY', price: 100, period: 'one-time', details: ['Do-it-yourself guide & support', 'Includes hosting recommendations', 'Step-by-step documentation', 'Perfect for budget creators'] },

    { planType: 'branding', title: 'Branding Suite', price: 900, period: 'one-time', details: ['Custom logo & style design guide', 'Corporate brand sheets', 'Mockups & presentation vectors', 'Includes business collateral assets'] },
    { planType: 'marketing', title: 'SMM Campaign Plan', price: 1500, period: 'month', details: ['Paid advertising setup (FB, Google, LinkedIn)', 'A/B testing ad copies', 'Monthly optimization & landing page tweaks', 'Retainer on 6-month cycle'] },
    { planType: 'automation', title: 'AI Automation Setup', price: 2500, period: 'one-time', details: ['Custom AI chat assistant & automation flow', 'Connects with CRM databases & calendars', '1 complete tool creation & API setup', 'Streamlines lead conversion 24/7'] }
  ]
};

let useLocalDB = false;
let dbCache = null;

// Initialize JSON database
function initLocalDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf8');
    dbCache = JSON.parse(JSON.stringify(defaultDB));
  } else {
    try {
      dbCache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      // Ensure all keys are populated
      let updated = false;
      for (const key in defaultDB) {
        if (dbCache[key] === undefined) {
          dbCache[key] = defaultDB[key];
          updated = true;
        }
      }
      if (updated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
      }
    } catch (err) {
      console.error('Error reading local DB, resetting...', err);
      dbCache = JSON.parse(JSON.stringify(defaultDB));
      fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
    }
  }
}

function saveLocalDB() {
  if (useLocalDB && dbCache) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
  }
}

async function connectDB() {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/annbuendia';
    const safeLogUri = connStr.replace(/:([^:@/]+)@/, ':****@');
    console.log(`Connecting to MongoDB at: ${safeLogUri}...`);

    const connectOptions = {
      serverSelectionTimeoutMS: 15000
    };
    // Corporate VPNs (e.g. Cato Networks) often MITM TLS with a self-signed cert.
    if (process.env.MONGO_TLS_INSECURE === 'true') {
      connectOptions.tlsAllowInvalidCertificates = true;
    }

    await mongoose.connect(connStr, connectOptions);
    
    console.log('MongoDB connected successfully!');
    useLocalDB = false;
    
    // Pre-populate Mongoose schema if needed
    const Pricing = require('../models/Pricing');
    const count = await Pricing.countDocuments();
    if (count === 0) {
      console.log('Prepopulating MongoDB pricing database...');
      await Pricing.insertMany(defaultDB.pricing);
    }
  } catch (err) {
    const cause = err.cause?.message || err.cause?.code || '';
    if (cause.includes('SELF_SIGNED_CERT') || cause.includes('self-signed certificate')) {
      console.warn('MongoDB TLS failed (corporate VPN/proxy may be intercepting SSL). Set MONGO_TLS_INSECURE=true in server/.env or bypass VPN for *.mongodb.net.');
    } else if (cause.includes('ECONNRESET')) {
      console.warn('MongoDB connection reset (often a VPN/firewall blocking port 27017). Try disconnecting VPN or allow *.mongodb.net in your network policy.');
    }
    console.warn(`MongoDB connection failed: ${err.message}${cause ? ` (${cause})` : ''}. Falling back to local JSON database mode.`);
    useLocalDB = true;
    initLocalDB();
    console.log(`Local JSON Database loaded at: ${DB_FILE}`);
  }
}

// Database Repositories
const dbRepo = {
  isLocal: () => useLocalDB,

  // INQUIRIES
  saveInquiry: async (inquiryData) => {
    if (useLocalDB) {
      const newInquiry = {
        _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        ...inquiryData,
        status: 'new',
        createdAt: new Date().toISOString()
      };
      dbCache.inquiries.push(newInquiry);
      dbCache.analytics.contactSubmissions += 1;
      saveLocalDB();
      return newInquiry;
    } else {
      const Inquiry = require('../models/Inquiry');
      const Analytics = require('../models/Analytics');
      
      const newInq = new Inquiry(inquiryData);
      await newInq.save();
      
      // Update analytics
      await Analytics.findOneAndUpdate(
        {},
        { $inc: { contactSubmissions: 1 } },
        { upsert: true, new: true }
      );
      
      return newInq;
    }
  },

  getInquiries: async () => {
    if (useLocalDB) {
      return [...dbCache.inquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      const Inquiry = require('../models/Inquiry');
      return await Inquiry.find().sort({ createdAt: -1 });
    }
  },

  updateInquiryStatus: async (id, status) => {
    if (useLocalDB) {
      const inquiry = dbCache.inquiries.find(item => item._id === id);
      if (inquiry) {
        inquiry.status = status;
        saveLocalDB();
        return inquiry;
      }
      return null;
    } else {
      const Inquiry = require('../models/Inquiry');
      return await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
    }
  },

  deleteInquiry: async (id) => {
    if (useLocalDB) {
      const idx = dbCache.inquiries.findIndex(item => item._id === id);
      if (idx !== -1) {
        const deleted = dbCache.inquiries.splice(idx, 1)[0];
        saveLocalDB();
        return deleted;
      }
      return null;
    } else {
      const Inquiry = require('../models/Inquiry');
      return await Inquiry.findByIdAndDelete(id);
    }
  },

  // PRICING (CMS)
  getPricing: async () => {
    if (useLocalDB) {
      return dbCache.pricing;
    } else {
      const Pricing = require('../models/Pricing');
      return await Pricing.find();
    }
  },

  updatePricing: async (planType, updates) => {
    if (useLocalDB) {
      const plan = dbCache.pricing.find(p => p.planType === planType);
      if (plan) {
        Object.assign(plan, updates);
        saveLocalDB();
        return plan;
      }
      return null;
    } else {
      const Pricing = require('../models/Pricing');
      return await Pricing.findOneAndUpdate({ planType }, updates, { new: true });
    }
  },

  // ANALYTICS
  incrementViews: async () => {
    if (useLocalDB) {
      dbCache.analytics.views += 1;
      saveLocalDB();
      return dbCache.analytics;
    } else {
      const Analytics = require('../models/Analytics');
      return await Analytics.findOneAndUpdate(
        {},
        { $inc: { views: 1 } },
        { upsert: true, new: true }
      );
    }
  },

  incrementBookingClicks: async () => {
    if (useLocalDB) {
      dbCache.analytics.bookingClicks += 1;
      saveLocalDB();
      return dbCache.analytics;
    } else {
      const Analytics = require('../models/Analytics');
      return await Analytics.findOneAndUpdate(
        {},
        { $inc: { bookingClicks: 1 } },
        { upsert: true, new: true }
      );
    }
  },

  getAnalytics: async () => {
    if (useLocalDB) {
      return dbCache.analytics;
    } else {
      const Analytics = require('../models/Analytics');
      let data = await Analytics.findOne();
      if (!data) {
        data = new Analytics({ views: 0, contactSubmissions: 0, bookingClicks: 0 });
        await data.save();
      }
      return data;
    }
  },

  // BOOKINGS
  saveBooking: async (bookingData) => {
    if (useLocalDB) {
      const newBooking = {
        _id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      dbCache.bookings.push(newBooking);
      saveLocalDB();
      return newBooking;
    } else {
      const Booking = require('../models/Booking');
      const newBooking = new Booking(bookingData);
      await newBooking.save();
      return newBooking;
    }
  },

  getBookedSlots: async (date) => {
    if (useLocalDB) {
      return dbCache.bookings
        .filter(b => b.date === date && b.status !== 'cancelled')
        .map(b => b.time);
    } else {
      const Booking = require('../models/Booking');
      const bookings = await Booking.find({ date, status: { $ne: 'cancelled' } });
      return bookings.map(b => b.time);
    }
  },

  getBookings: async () => {
    if (useLocalDB) {
      return [...dbCache.bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      const Booking = require('../models/Booking');
      return await Booking.find().sort({ createdAt: -1 });
    }
  },

  updateBookingStatus: async (id, status) => {
    if (useLocalDB) {
      const booking = dbCache.bookings.find(item => item._id === id);
      if (booking) {
        booking.status = status;
        saveLocalDB();
        return booking;
      }
      return null;
    } else {
      const Booking = require('../models/Booking');
      return await Booking.findByIdAndUpdate(id, { status }, { new: true });
    }
  }
};

module.exports = {
  connectDB,
  dbRepo
};
