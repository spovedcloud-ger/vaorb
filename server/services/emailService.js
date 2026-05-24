const nodemailer = require('nodemailer');

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'accounts@thevaorbit.com';
const SITE_NAME = process.env.SITE_NAME || 'The VA Orbit';
const SMTP_USER = process.env.SMTP_USER || CONTACT_EMAIL;
const MAIL_FROM =
  process.env.MAIL_FROM ||
  process.env.SMTP_FROM ||
  SMTP_USER ||
  CONTACT_EMAIL;

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_PASS.trim() !== ''
  );
}

function createTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, text, html, replyTo }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn(
      '[email] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Skipping send.'
    );
    return { sent: false, skipped: true };
  }

  const info = await transporter.sendMail({
    from: `"${SITE_NAME}" <${MAIL_FROM}>`,
    to,
    replyTo,
    subject,
    text,
    html,
  });

  return { sent: true, messageId: info.messageId };
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Notify the business inbox when a "Start The Conversation" form is submitted.
 */
async function sendInquiryNotification(inquiry) {
  const { name, email, budget, skypeOrPhone, message } = inquiry;
  const subject = `[${SITE_NAME}] New contact inquiry from ${name}`;

  const text = [
    `New inquiry via "Start The Conversation"`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    budget ? `Budget: ${budget}` : null,
    skypeOrPhone ? `Phone / Skype: ${skypeOrPhone}` : null,
    ``,
    `Message:`,
    message,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <h2 style="margin:0 0 12px;font-family:sans-serif;color:#076fab;">New contact inquiry</h2>
    <p style="font-family:sans-serif;color:#333;">Submitted from <strong>Start The Conversation</strong> on ${SITE_NAME}.</p>
    <table style="font-family:sans-serif;font-size:14px;color:#333;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Name</td><td>${escapeHtml(name)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      ${budget ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600;">Budget</td><td>${escapeHtml(budget)}</td></tr>` : ''}
      ${skypeOrPhone ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600;">Phone / Skype</td><td>${escapeHtml(skypeOrPhone)}</td></tr>` : ''}
    </table>
    <p style="font-family:sans-serif;font-size:14px;font-weight:600;color:#333;margin:20px 0 8px;">Message</p>
    <p style="font-family:sans-serif;font-size:14px;color:#333;white-space:pre-wrap;margin:0;">${escapeHtml(message)}</p>
  `;

  return sendMail({
    to: CONTACT_EMAIL,
    replyTo: email,
    subject,
    text,
    html,
  });
}

/**
 * Auto-reply to the person who submitted the form.
 */
async function sendInquiryConfirmation(inquiry) {
  const { name, email } = inquiry;
  const subject = `We received your message — ${SITE_NAME}`;
  const firstName = name.trim().split(/\s+/)[0] || 'there';

  const text = [
    `Hi ${firstName},`,
    ``,
    `Thank you for reaching out through ${SITE_NAME}. We received your message and will reply within 24 hours on weekdays (often much sooner).`,
    ``,
    `If anything is urgent, you can also email us directly at ${CONTACT_EMAIL}.`,
    ``,
    `— ${SITE_NAME}`,
  ].join('\n');

  const html = `
    <p style="font-family:sans-serif;font-size:15px;color:#333;">Hi ${escapeHtml(firstName)},</p>
    <p style="font-family:sans-serif;font-size:15px;color:#333;line-height:1.6;">
      Thank you for reaching out through <strong>${SITE_NAME}</strong>. We received your message and will reply within 24 hours on weekdays (often much sooner).
    </p>
    <p style="font-family:sans-serif;font-size:15px;color:#333;line-height:1.6;">
      If anything is urgent, email us at <a href="mailto:${escapeHtml(CONTACT_EMAIL)}">${escapeHtml(CONTACT_EMAIL)}</a>.
    </p>
    <p style="font-family:sans-serif;font-size:15px;color:#076fab;margin-top:24px;">— ${escapeHtml(SITE_NAME)}</p>
  `;

  return sendMail({
    to: email,
    subject,
    text,
    html,
  });
}

module.exports = {
  isEmailConfigured,
  sendInquiryNotification,
  sendInquiryConfirmation,
};
