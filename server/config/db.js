const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const defaultPricing = require('../data/defaultPricing');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

/** MongoDB Atlas — VA0rbit cluster (https://cloud.mongodb.com) */
const ATLAS = {
  user: process.env.MONGO_USER || 'dbvaorb',
  password: process.env.MONGO_PASSWORD,
  cluster: process.env.MONGO_CLUSTER || 'va0rbit.4axc3iu.mongodb.net',
  database: process.env.MONGO_DB || 'vaorb',
  appName: process.env.MONGO_APP_NAME || 'VA0rbit',
};

const defaultDB = {  inquiries: [],
  bookings: [],
  analytics: {
    views: 0,
    contactSubmissions: 0,
    bookingClicks: 0
  },
  pricing: defaultPricing
};

let useLocalDB = false;
let dbCache = null;
let listenersAttached = false;

function maskUri(uri) {
  return uri.replace(/:([^:@/]+)@/, ':****@');
}

function buildMongoUri() {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  if (!ATLAS.password) {
    return null;
  }

  const user = encodeURIComponent(ATLAS.user);
  const password = encodeURIComponent(ATLAS.password);

  return `mongodb+srv://${user}:${password}@${ATLAS.cluster}/${ATLAS.database}?retryWrites=true&w=majority&appName=${ATLAS.appName}`;
}

function getAtlasConnectOptions() {
  const options = {
    dbName: ATLAS.database,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority',
  };

  if (process.env.MONGO_TLS_INSECURE === 'true') {
    options.tlsAllowInvalidCertificates = true;
  }

  return options;
}

function attachConnectionListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    console.log(`MongoDB Atlas connected — cluster: ${ATLAS.cluster}, db: ${mongoose.connection.name}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB Atlas disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB Atlas connection error:', err.message);
  });
}

function logAtlasConnectionFailure(err) {
  const cause = err.cause?.message || err.cause?.code || '';
  const message = err.message || '';

  if (message.includes('bad auth') || message.includes('Authentication failed')) {
    console.warn('MongoDB auth failed. Check MONGO_URI or MONGO_PASSWORD for user "dbvaorb" in Atlas → Database Access.');
  } else if (message.includes('IP') || message.includes('whitelist')) {
    console.warn('MongoDB blocked this IP. In Atlas → Network Access, add your current IP or 0.0.0.0/0 for development.');
  } else if (cause.includes('SELF_SIGNED_CERT') || cause.includes('self-signed certificate')) {
    console.warn('MongoDB TLS failed (VPN/proxy may intercept SSL). Set MONGO_TLS_INSECURE=true in server/.env.');
  } else if (cause.includes('ECONNRESET')) {
    console.warn('MongoDB connection reset. Allow *.mongodb.net through your firewall or disconnect VPN.');
  }

  console.warn(`MongoDB connection failed: ${message}${cause ? ` (${cause})` : ''}. Falling back to local JSON database mode.`);
}

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
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
    } catch (err) {
      if (err.code === 'EROFS') {
        console.warn('Local DB: read-only filesystem (Vercel). Data kept in memory only, will not persist.');
      } else {
        console.error('Local DB write error:', err.message);
      }
    }
  }
}

async function syncMongoCollections() {
  const Pricing = require('../models/Pricing');
  const Analytics = require('../models/Analytics');

  const pricingCount = await Pricing.countDocuments();
  if (pricingCount === 0) {
    console.log('Seeding MongoDB pricing collection...');
    await Pricing.insertMany(defaultPricing);
  } else if (process.env.SYNC_PRICING_ON_START === 'true') {
    console.log('Syncing pricing plans to MongoDB...');
    for (const plan of defaultPricing) {
      await Pricing.findOneAndUpdate(
        { planType: plan.planType },
        { $set: plan },
        { upsert: true, new: true }
      );
    }
  }

  const analytics = await Analytics.findOne();
  if (!analytics) {
    await Analytics.create({
      views: 0,
      contactSubmissions: 0,
      bookingClicks: 0
    });
    console.log('Initialized analytics document in MongoDB.');
  }
}

async function connectDB() {
  attachConnectionListeners();

  const connStr = buildMongoUri();
  if (!connStr) {
    console.warn('MongoDB URI not configured. Set MONGO_URI or MONGO_PASSWORD in server/.env. Using local JSON database mode.');
    useLocalDB = true;
    initLocalDB();
    console.log(`Local JSON Database loaded at: ${DB_FILE}`);
    return;
  }

  try {
    console.log(`Connecting to MongoDB Atlas (${ATLAS.user}@${ATLAS.cluster}/${ATLAS.database})...`);
    console.log(`URI: ${maskUri(connStr)}`);

    await mongoose.connect(connStr, getAtlasConnectOptions());

    useLocalDB = false;
    await syncMongoCollections();
  } catch (err) {
    logAtlasConnectionFailure(err);
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
        status: bookingData.status || 'confirmed',
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
  dbRepo,
  getConnectionStatus: () => ({
    mode: useLocalDB ? 'local-json' : 'mongodb-atlas',
    connected: !useLocalDB && mongoose.connection.readyState === 1,
    cluster: ATLAS.cluster,
    database: useLocalDB ? DB_FILE : mongoose.connection.name,
    user: ATLAS.user,
  }),
};