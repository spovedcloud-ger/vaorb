const { validationResult } = require('express-validator');
const { dbRepo } = require('../config/db');
const {
  isEmailConfigured,
  sendInquiryNotification,
  sendInquiryConfirmation,
} = require('../services/emailService');

exports.submitInquiry = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, budget, skypeOrPhone, message } = req.body;

  try {
    const inquiry = await dbRepo.saveInquiry({
      name,
      email,
      budget: budget || '',
      skypeOrPhone: skypeOrPhone || '',
      message
    });

    let emailSent = false;
    if (isEmailConfigured()) {
      try {
        await sendInquiryNotification(inquiry);
        console.log(`[contact] Admin notification sent for: ${name} <${email}>`);
        emailSent = true;
      } catch (mailErr) {
        console.error('[contact] Failed to send admin notification:', mailErr.message);
      }
      try {
        await sendInquiryConfirmation(inquiry);
        console.log(`[contact] Guest confirmation sent to: ${email}`);
        emailSent = true;
      } catch (mailErr) {
        console.error('[contact] Failed to send guest confirmation:', mailErr.message);
      }
    } else {
      console.warn(
        'Contact inquiry saved but email not sent — add SMTP_HOST, SMTP_USER, SMTP_PASS to server/.env'
      );
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Your message was sent! Check your inbox for a confirmation — we will reply shortly.'
        : 'Your message was received! We will get back to you shortly.',
      emailSent,
      data: inquiry
    });
  } catch (error) {
    console.error('Submit inquiry error:', error);
    res.status(500).json({ message: 'Error submitting your inquiry. Please try again.' });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await dbRepo.getInquiries();
    res.json(inquiries);
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ message: 'Error retrieving messages' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['new', 'in-progress', 'archived'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status type' });
  }

  try {
    const updated = await dbRepo.updateInquiryStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Error updating inquiry status' });
  }
};

exports.deleteInquiry = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await dbRepo.deleteInquiry(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ message: 'Inquiry deleted successfully', id });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ message: 'Error deleting inquiry' });
  }
};
