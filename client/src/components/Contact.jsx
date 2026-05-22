import { useState } from 'react';
import { ASSETS, EXTERNAL_LINKS } from '../data/siteContent';

export default function Contact({ onSubmit, onBookingClick }) {
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    budget: '',
    skypeOrPhone: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactData.name || !contactData.email || !contactData.message) {
      setFormStatus({ type: 'error', text: 'Name, email, and message are required fields!' });
      return;
    }

    setIsSubmitting(true);
    setFormStatus({ type: 'loading', text: 'Sending your inquiry...' });

    try {
      const { ok, body } = await onSubmit(contactData);
      if (ok) {
        setFormStatus({
          type: 'success',
          text: body.message || 'Inquiry submitted successfully!',
        });
        setContactData({ name: '', email: '', budget: '', skypeOrPhone: '', message: '' });
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
                      annbuendia023@gmail.com
                    </a>{' '}
                    [hello@annbuendia.com]
                  </p>
                  <p>
                    Or, by filling out the form below. Response time is almost immediately during
                    weekdays, or within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row contact-row">
            <div className="col-lg-6 col-md-12">
              <form id="contact-form" onSubmit={handleSubmit} noValidate>
                {formStatus.text && (
                  <div className={`form-alert form-alert-${formStatus.type}`}>
                    {formStatus.text}
                  </div>
                )}
                <div className="controls">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          id="form_name"
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="Your Name *"
                          value={contactData.name}
                          onChange={(e) =>
                            setContactData({ ...contactData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          id="form_lastname"
                          type="text"
                          name="surname"
                          className="form-control"
                          placeholder="Your Budget"
                          value={contactData.budget}
                          onChange={(e) =>
                            setContactData({ ...contactData, budget: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          id="form_email"
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="Your Email *"
                          value={contactData.email}
                          onChange={(e) =>
                            setContactData({ ...contactData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          id="form_phone"
                          type="tel"
                          name="phone"
                          className="form-control"
                          placeholder="Your Skype"
                          value={contactData.skypeOrPhone}
                          onChange={(e) =>
                            setContactData({ ...contactData, skypeOrPhone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <textarea
                          id="form_message"
                          name="message"
                          className="form-control"
                          placeholder="Your Message *"
                          rows={4}
                          value={contactData.message}
                          onChange={(e) =>
                            setContactData({ ...contactData, message: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <button
                        type="submit"
                        className="btn btn-send"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-lg-1" />

            <div className="col-lg-4 col-md-12">
              <div className="contact-img">
                <img src={ASSETS.contact} className="img-fluid" alt="Contact Ann Buendia" />
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
