const CALL_TYPE_LABELS = {
  discovery: 'General Discovery Call (15 min)',
  strategy: 'AI Strategy Session (30 min)',
  consultation: 'Flash Site Consultation (15 min)',
};

function formatTime12h(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatBookingDate(dateStr) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getCallTypeLabel(callType) {
  return CALL_TYPE_LABELS[callType] || callType || 'Discovery Call';
}

function formatBookingSummary(booking) {
  const dateLabel = formatBookingDate(booking.date);
  const timeLabel = formatTime12h(booking.time);
  const callLabel = getCallTypeLabel(booking.callType);
  const tz = booking.timezone || 'UTC';
  return { dateLabel, timeLabel, callLabel, tz };
}

module.exports = {
  formatBookingDate,
  formatTime12h,
  getCallTypeLabel,
  formatBookingSummary,
};
