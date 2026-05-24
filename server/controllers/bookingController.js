const { validationResult } = require('express-validator');
const { dbRepo } = require('../config/db');
const { getMeetLinkForBooking } = require('../utils/meetLink');
const { isEmailConfigured, sendBookingEmails } = require('../services/emailService');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public
exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, date, time, timezone, callType, notes } = req.body;
    const meetLink = getMeetLinkForBooking();

    const booking = await dbRepo.saveBooking({
      name,
      email,
      date,
      time,
      timezone: timezone || 'UTC',
      callType: callType || 'discovery',
      notes: notes || '',
      meetLink: meetLink || '',
      status: 'confirmed',
    });

    let emailSent = false;
    if (isEmailConfigured()) {
      try {
        await sendBookingEmails(booking);
        emailSent = true;
      } catch (mailErr) {
        console.error('Booking email error:', mailErr.message);
      }
    } else {
      console.warn(
        'Booking saved but emails not sent — configure SMTP and GOOGLE_MEET_LINK in server/.env'
      );
    }

    const meetMsg = meetLink
      ? ' Google Meet link sent to you and accounts@thevaorbit.com.'
      : ' Add GOOGLE_MEET_LINK in server/.env to include Meet links in emails.';

    res.status(201).json({
      success: true,
      message: emailSent
        ? `Booking confirmed!${meetMsg}`
        : `Booking confirmed!${meetLink ? meetMsg : ' Email is not configured yet.'}`,
      emailSent,
      meetLink: meetLink || null,
      booking,
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ message: 'Failed to create booking. Please try again.' });
  }
};

// @route   GET /api/bookings/slots?date=YYYY-MM-DD
// @desc    Get available time slots for a given date
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required.' });
    }
    const bookedSlots = await dbRepo.getBookedSlots(date);
    
    // Available slots: Mon-Fri, 9AM-5PM (every 45 min), skip weekends
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.json({ date, slots: [], message: 'No availability on weekends.' });
    }

    const allSlots = [];
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += 45) {
        if (h === 16 && m > 0) break; // Last slot at 4:00 PM
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        allSlots.push(timeStr);
      }
    }

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    res.json({ date, slots: availableSlots });
  } catch (err) {
    console.error('Get slots error:', err);
    res.status(500).json({ message: 'Failed to fetch available slots.' });
  }
};

// @route   GET /api/bookings
// @desc    Get all bookings (admin)
// @access  Protected
exports.getBookings = async (req, res) => {
  try {
    const bookings = await dbRepo.getBookings();
    res.json(bookings);
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ message: 'Failed to fetch bookings.' });
  }
};

// @route   PATCH /api/bookings/:id
// @desc    Update booking status (admin)
// @access  Protected
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await dbRepo.updateBookingStatus(req.params.id, status);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json(booking);
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ message: 'Failed to update booking.' });
  }
};
