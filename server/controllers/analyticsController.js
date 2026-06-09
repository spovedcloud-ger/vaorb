const { dbRepo } = require('../config/db');
const { heartbeat } = require('../services/liveVisitors');

exports.trackView = async (req, res) => {
  try {
    const stats = await dbRepo.incrementViews();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ message: 'Telemetry error logging view' });
  }
};

exports.trackBookingClick = async (req, res) => {
  try {
    const stats = await dbRepo.incrementBookingClicks();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Track booking error:', error);
    res.status(500).json({ message: 'Telemetry error logging booking action' });
  }
};

exports.heartbeat = (req, res) => {
  const sessionId = req.body?.sessionId || req.ip;
  const count = heartbeat(sessionId);
  res.json({ live: count });
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const summary = await dbRepo.getAnalytics();
    const inquiries = await dbRepo.getInquiries();
    
    // Add custom helper aggregations
    const newCount = inquiries.filter(i => i.status === 'new').length;
    const progressCount = inquiries.filter(i => i.status === 'in-progress').length;
    const archivedCount = inquiries.filter(i => i.status === 'archived').length;
    
    res.json({
      views: summary.views || 0,
      contactSubmissions: summary.contactSubmissions || 0,
      bookingClicks: summary.bookingClicks || 0,
      inquiries: {
        total: inquiries.length,
        new: newCount,
        inProgress: progressCount,
        archived: archivedCount
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Error compiling analytics report' });
  }
};
