import { useState, useEffect, useCallback, useMemo } from 'react';
import avatarImg from '../assets/carlv2.png';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CALL_TYPES = [
  { value: 'discovery', label: 'General Discovery Call', icon: '🔍', duration: '15 min' },
  { value: 'strategy', label: 'AI Strategy Session', icon: '🤖', duration: '30 min' },
  { value: 'consultation', label: 'Flash Site Consultation', icon: '⚡', duration: '15 min' },
];

function formatTime12h(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatTime24h(timeStr) {
  return timeStr;
}

export default function BookingCalendar({ onBookingClick }) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCallType, setSelectedCallType] = useState('discovery');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [use24h, setUse24h] = useState(false);
  const [step, setStep] = useState('date'); // 'date' | 'time' | 'form' | 'success'
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [userTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const grid = [];

    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push(d);
    }
    return grid;
  }, [currentMonth, currentYear]);

  // Check if a day is selectable (today onwards, weekdays only)
  const isDaySelectable = useCallback((day) => {
    if (!day) return false;
    const date = new Date(currentYear, currentMonth, day);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return false; // weekend

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Allow from tomorrow onwards (need lead time)
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date >= tomorrow;
  }, [currentMonth, currentYear, today]);

  // Month navigation
  const canGoPrev = useMemo(() => {
    return currentYear > today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonth > today.getMonth());
  }, [currentMonth, currentYear, today]);

  const goToPrevMonth = () => {
    if (!canGoPrev) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
    setStep('date');
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
    setSelectedDate(null);
    setSelectedTime(null);
    setStep('date');
  };

  // Fetch available slots when a date is selected
  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    setSlotsLoading(true);
    fetch(`${API_BASE}/bookings/slots?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        setAvailableSlots(data.slots || []);
      })
      .catch(() => {
        setAvailableSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, currentMonth, currentYear]);

  const handleDateClick = (day) => {
    if (!isDaySelectable(day)) return;
    setSelectedDate(day);
    setSelectedTime(null);
    setStep('time');
    if (onBookingClick) onBookingClick();
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    setStep('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Please enter your name.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email.';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSubmitting(true);

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          date: dateStr,
          time: selectedTime,
          timezone: userTimezone,
          callType: selectedCallType,
          notes: formData.notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitResult({ type: 'success', message: data.message });
        setStep('success');
      } else {
        setSubmitResult({ type: 'error', message: data.errors?.[0]?.msg || data.message || 'Booking failed.' });
      }
    } catch {
      setSubmitResult({ type: 'error', message: 'Server connection failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setStep('date');
    setFormData({ name: '', email: '', notes: '' });
    setFormErrors({});
    setSubmitResult(null);
    setSelectedCallType('discovery');
  };

  const selectedCallInfo = CALL_TYPES.find(c => c.value === selectedCallType);
  const formattedSelectedDate = selectedDate
    ? new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    : '';

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  return (
    <div className="booking-calendar">
      {/* Profile Header */}
      <div className="booking-profile">
        <div className="booking-profile-avatar">
          <img src={avatarImg} alt="Carl" />
        </div>
        <h3 className="booking-profile-name">Carl Falle</h3>
        <div className="booking-profile-details">
          <span>Executive Virtual Assistant | Admin & Operations Support | Medical Executive Assistant | Helping Entrepreneurs Scale Efficiently</span>
        </div>
      </div>

      {/* Call Type Selector (Hidden) */}
      {false && (
        <div className="booking-call-types">
          {CALL_TYPES.map(ct => (
            <button
              key={ct.value}
              className={`booking-call-type-btn ${selectedCallType === ct.value ? 'active' : ''}`}
              onClick={() => setSelectedCallType(ct.value)}
            >
              <span className="booking-call-icon">{ct.icon}</span>
              <span className="booking-call-label">{ct.label}</span>
              <span className="booking-call-duration">{ct.duration}</span>
            </button>
          ))}
        </div>
      )}

      <div className="booking-layout">
        {/* Calendar Side */}
        <div className="booking-calendar-panel">
          <div className="booking-step-label">
            {step === 'date' && 'Select a Date'}
            {step === 'time' && 'Select a Time'}
            {step === 'form' && 'Confirm Details'}
            {step === 'success' && 'Booking Confirmed!'}
          </div>

          {/* Calendar Header */}
          <div className="booking-cal-header">
            <button
              className="booking-nav-btn"
              onClick={goToPrevMonth}
              disabled={!canGoPrev}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="booking-cal-month">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              className="booking-nav-btn"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {/* Day Labels */}
          <div className="booking-cal-weekdays">
            {DAYS.map(d => <span key={d} className="booking-weekday">{d}</span>)}
          </div>

          {/* Calendar Grid */}
          <div className="booking-cal-grid">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="booking-day-cell empty" />;
              }
              const selectable = isDaySelectable(day);
              const selected = day === selectedDate;
              const todayCell = isToday(day);
              return (
                <button
                  key={day}
                  className={[
                    'booking-day-cell',
                    selectable ? 'selectable' : 'disabled',
                    selected ? 'selected' : '',
                    todayCell ? 'today' : ''
                  ].join(' ')}
                  onClick={() => handleDateClick(day)}
                  disabled={!selectable}
                  aria-label={`${MONTHS[currentMonth]} ${day}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Timezone + Format Toggle */}
          <div className="booking-timezone-bar">
            <div className="booking-timezone">
              <span className="booking-tz-icon">🌐</span>
              <span>{userTimezone}</span>
            </div>
            <div className="booking-format-toggle">
              <span className={!use24h ? 'active' : ''}>am/pm</span>
              <button
                className={`booking-toggle-switch ${use24h ? 'on' : ''}`}
                onClick={() => setUse24h(!use24h)}
                aria-label="Toggle time format"
              >
                <span className="booking-toggle-knob" />
              </button>
              <span className={use24h ? 'active' : ''}>24h</span>
            </div>
          </div>
        </div>

        {/* Right Side: Time Slots / Form / Success */}
        <div className="booking-details-panel">
          {step === 'date' && (
            <div className="booking-placeholder">
              <div className="booking-placeholder-icon">📅</div>
              <p>Select a date from the calendar to view available time slots.</p>
              <p className="booking-hint">Weekdays only · {selectedCallInfo?.duration} sessions</p>
            </div>
          )}

          {step === 'time' && (
            <div className="booking-timeslots">
              <h4 className="booking-slots-title">
                {formattedSelectedDate}
              </h4>
              {slotsLoading ? (
                <div className="booking-slots-loading">
                  <div className="booking-spinner" />
                  <p>Loading available slots...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="booking-slots-grid">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      className={`booking-slot-btn ${selectedTime === slot ? 'selected' : ''}`}
                      onClick={() => handleTimeClick(slot)}
                    >
                      {use24h ? formatTime24h(slot) : formatTime12h(slot)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="booking-no-slots">
                  <span>😕</span>
                  <p>No available slots for this date.</p>
                  <p>Please try another date.</p>
                </div>
              )}
              <button className="booking-back-btn" onClick={() => { setStep('date'); setSelectedDate(null); }}>
                ← Back to calendar
              </button>
            </div>
          )}

          {step === 'form' && (
            <div className="booking-form-wrap">
              <div className="booking-summary-card">
                <div className="booking-summary-item">
                  <span className="booking-summary-icon">📅</span>
                  <span>{formattedSelectedDate}</span>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-icon">🕐</span>
                  <span>{use24h ? formatTime24h(selectedTime) : formatTime12h(selectedTime)}</span>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-icon">{selectedCallInfo?.icon}</span>
                  <span>{selectedCallInfo?.label} ({selectedCallInfo?.duration})</span>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-icon">📹</span>
                  <span>Google Meet</span>
                </div>
              </div>

              {submitResult?.type === 'error' && (
                <div className="booking-alert error">{submitResult.message}</div>
              )}

              <form onSubmit={handleSubmit} className="booking-form">
                <div className="booking-field">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="booking-field-error">{formErrors.name}</span>}
                </div>
                <div className="booking-field">
                  <input
                    type="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="booking-field-error">{formErrors.email}</span>}
                </div>
                <div className="booking-field">
                  <textarea
                    placeholder="Notes (optional)"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="booking-form-actions">
                  <button type="button" className="booking-back-btn" onClick={() => setStep('time')}>
                    ← Back
                  </button>
                  <button type="submit" className="booking-confirm-btn" disabled={submitting}>
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="booking-success">
              <div className="booking-success-icon">✅</div>
              <h3>Booking Confirmed!</h3>
              <p>{submitResult?.message}</p>
              <div className="booking-summary-card">
                <div className="booking-summary-item">
                  <span className="booking-summary-icon">📅</span>
                  <span>{formattedSelectedDate}</span>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-icon">🕐</span>
                  <span>{use24h ? formatTime24h(selectedTime) : formatTime12h(selectedTime)}</span>
                </div>
                <div className="booking-summary-item">
                  <span className="booking-summary-icon">{selectedCallInfo?.icon}</span>
                  <span>{selectedCallInfo?.label}</span>
                </div>
              </div>
              <button className="booking-confirm-btn" onClick={resetBooking}>
                Book Another Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
