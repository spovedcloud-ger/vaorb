/**
 * Test contact-form email after SMTP_PASS is set in server/.env
 * Run: npm run test-email --prefix server
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const {
  isEmailConfigured,
  sendInquiryNotification,
  sendInquiryConfirmation,
} = require('../services/emailService');

async function main() {
  if (!isEmailConfigured()) {
    console.error(
      '\nSMTP not ready. In server/.env set SMTP_PASS to your Google App Password for accounts@thevaorbit.com\n' +
        'Create one: https://myaccount.google.com/apppasswords\n'
    );
    process.exit(1);
  }

  const sample = {
    name: 'Email Test',
    email: process.env.TEST_EMAIL_TO || process.env.CONTACT_EMAIL,
    budget: 'Test',
    message: 'Test message from npm run test-email',
  };

  console.log('Sending notification to', process.env.CONTACT_EMAIL);
  await sendInquiryNotification(sample);

  console.log('Sending confirmation to', sample.email);
  await sendInquiryConfirmation(sample);

  console.log('\nDone. Check inboxes for both emails.\n');
}

main().catch((err) => {
  console.error('\nEmail test failed:', err.message);
  if (err.message.includes('Invalid login')) {
    console.error('Use a Google App Password (not your normal password) for SMTP_PASS.');
  }
  process.exit(1);
});
