require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection (with local database fallback built-in!)
connectDB();

// Apply Global Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Register Core APIs
app.use('/api', require('./routes/api'));

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
  });
} else {
  // Developer sanity route
  app.get('/', (req, res) => {
    res.json({
      name: 'Carl Falle API Backend',
      status: 'active',
      mode: process.env.NODE_ENV || 'development',
      documentation: '/api/pricing'
    });
  });
}

// Global Exception Handler
app.use((err, req, res, next) => {
  console.error('Unhandled exception captured:', err.stack);
  res.status(500).json({
    message: 'An unexpected backend server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Boot HTTP Server
const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`HTTP endpoint listening at: http://localhost:${PORT}`);
  console.log(`===================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Stop the old server or run: npm run kill-ports\n`);
    process.exit(1);
  }
  throw err;
});
