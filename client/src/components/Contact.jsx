import { useState } from 'react';
import { ASSETS, EXTERNAL_LINKS } from '../data/siteContent';

export default function Contact({ onSubmit, onBookingClick }) {
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    budget: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!contactData.name.trim()) newErrors.name = 'Please enter your name.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactData.email || !emailRegex.test(contactData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (contactData.budget && contactData.budget.trim().length > 100) {
      newErrors.budget = 'Budget description is too long.';
    }
    if (!contactData.message.trim()) newErrors.message = 'Please enter your message.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormStatus({ type: 'error', text: 'Please fix the errors below before submitting.' });
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    setFormStatus({ type: 'loading', text: 'Sending your inquiry...' });

    try {
      const { ok, body } = await onSubmit(contactData);
      if (ok) {
        setFormStatus({
          type: 'success',
          text: body.message || 'Inquiry submitted successfully!',
        });
        setContactData({ name: '', email: '', budget: '', message: '' });
      } else {
        setFormStatus({
          type: 'error',
          text: body.message || body.errors?.[0]?.msg || 'Submission error.',
        });
      }
    } catch {
      setFormStatus({
        type: 'error',
        text: 'Server connection failure. Please email annbuendia023@gmail.com',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="contact" className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="contact-text section-header text-center">
                <h2 className="section-title">Start The Conversation</h2>
                <div className="desc-text">
                  <p>
                    The best way to reach us is through direct email:{' '}
                    <a href={EXTERNAL_LINKS.emailPrimary} target="_blank" rel="noreferrer">
                      carlfalle023@gmail.com
                    </a>{' '}
                    [hello@carlfalle.com]
                  </p>
                  <p>
                    Or, by filling out the form below. Response time is almost immediately during
                    weekdays, or within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row contact-row align-items-center">
            <div className="col-lg-6 col-md-12">
              <form id="contact-form" onSubmit={handleSubmit} noValidate className="p-4 shadow-sm rounded bg-white" style={{ border: '1px solid #f0f0f0' }}>
                {formStatus.text && (
                  <div 
                    className="mb-4"
                    style={{ 
                      backgroundColor: formStatus.type === 'error' ? '#f8d7da' : formStatus.type === 'success' ? '#d4edda' : '#e2e3e5',
                      color: formStatus.type === 'error' ? '#721c24' : formStatus.type === 'success' ? '#0b7324' : '#383d41',
                      border: `1px solid ${formStatus.type === 'error' ? '#f5c6cb' : formStatus.type === 'success' ? '#c3e6cb' : '#d6d8db'}`,
                      padding: '15px',
                      borderRadius: '8px',
                      fontWeight: formStatus.type === 'success' ? 'bold' : '500'
                    }}
                  >
                    {formStatus.text}
                  </div>
                )}
                <div className="controls">
                  <div className="form-group mb-3">
                    <input
                      id="form_name"
                      type="text"
                      name="name"
                      className="form-control shadow-none"
                      placeholder="Your Name *"
                      value={contactData.name}
                      onChange={(e) =>
                        setContactData({ ...contactData, name: e.target.value })
                      }
                      style={{ 
                        padding: '12px 15px', 
                        borderRadius: '8px',
                        borderColor: errors.name ? '#dc3545' : '' 
                      }}
                      required
                    />
                    {errors.name && <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '5px' }}>{errors.name}</div>}
                  </div>
                  <div className="form-group mb-3">
                    <input
                      id="form_email"
                      type="email"
                      name="email"
                      className="form-control shadow-none"
                      placeholder="Your Email *"
                      value={contactData.email}
                      onChange={(e) =>
                        setContactData({ ...contactData, email: e.target.value })
                      }
                      style={{ 
                        padding: '12px 15px', 
                        borderRadius: '8px',
                        borderColor: errors.email ? '#dc3545' : '' 
                      }}
                      required
                    />
                    {errors.email && <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '5px' }}>{errors.email}</div>}
                  </div>
                  <div className="form-group mb-3">
                    <input
                      id="form_lastname"
                      type="text"
                      name="surname"
                      className="form-control shadow-none"
                      placeholder="Your Budget (Optional)"
                      value={contactData.budget}
                      onChange={(e) =>
                        setContactData({ ...contactData, budget: e.target.value })
                      }
                      style={{ 
                        padding: '12px 15px', 
                        borderRadius: '8px',
                        borderColor: errors.budget ? '#dc3545' : '' 
                      }}
                    />
                    {errors.budget && <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '5px' }}>{errors.budget}</div>}
                  </div>
                  <div className="form-group mb-4">
                    <textarea
                      id="form_message"
                      name="message"
                      className="form-control shadow-none"
                      placeholder="Your Message *"
                      rows={5}
                      value={contactData.message}
                      onChange={(e) =>
                        setContactData({ ...contactData, message: e.target.value })
                      }
                      style={{ 
                        padding: '12px 15px', 
                        borderRadius: '8px',
                        borderColor: errors.message ? '#dc3545' : '' 
                      }}
                      required
                    />
                    {errors.message && <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '5px' }}>{errors.message}</div>}
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="btn btn-send w-100 mt-2"
                      disabled={isSubmitting}
                      style={{ padding: '12px', fontSize: '1.1rem', borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                </div>
              </form>
            </div>

            <div className="col-lg-1" />

            <div className="col-lg-4 col-md-12">
              <div className="contact-img">
                <img src={ASSETS.contact} className="img-fluid" alt="Contact Carl Falle Buendia" />
              </div>
            </div>
          </div>
        </div>

        <div className="container booking-wrap">
          <hr className="section-divider" />
          <div id="book" className="contact-text section-header text-center">
            <h3 className="section-title">Or Book A FREE 15 to 30-Min Consult Call</h3>
            <div className="desc-text">
              <div className="zcal-inline-widget">
                <iframe
                  src={EXTERNAL_LINKS.zcal}
                  loading="lazy"
                  width="100%"
                  height="650"
                  frameBorder="0"
                  scrolling="no"
                  title="Book a consult call"
                  onLoad={onBookingClick}
                />
              </div>
            </div>
          </div>
          <p className="contact-quote">
            &ldquo;If it&apos;s not working; learn to pivot fast.&rdquo;
          </p>
        </div>
      </section>
    </>
  );
}
