import { ASSETS, EXTERNAL_LINKS } from '../data/siteContent';

export function QuoteBanner({ quote, sub, className = '' }) {
  return (
    <p className={`top-quote ${className}`}>
      {quote}
      {sub && <span>{sub}</span>}
    </p>
  );
}

export function ServicesSection() {
  return (
    <>
      <QuoteBanner
        quote="“If you really want to grow your business, you’ve got to learn to delegate to the pros.”"
        sub="Running a business can be a breeze with the right digital partner, specially in this day and age, when talent knows no boundaries."
      />
      <section id="services" className="section">
        <div className="container">
          <div className="features-text section-header text-center">
            <h2 className="section-title">Full Digital Service</h2>
            <div className="desc-text">
              <p>
                This is a fully outsourced digital agency services. We provide done-for-you
                customized needs or remote support to scale, plus{' '}
                <u>work directly with the expert who does the actual work</u> for a more efficient,
                faster turnaround, and cohesive design and development process.
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-6 col-xs-12">
              <div className="services-item text-center">
                <div className="icon">
                  <span className="lni-cog" aria-hidden />
                </div>
                <h4>Game Plan</h4>
                <p>Discovery stage. We converge: to brainstorm ideas, conceptualize, and formulate blueprint.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-xs-12">
              <div className="services-item text-center">
                <div className="icon">
                  <span className="lni-brush" aria-hidden />
                </div>
                <h4>Design &amp; Develop</h4>
                <p>Execute: create wireframes/mockups or drafts while exchanging feedback as we convert to deliverables.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-xs-12">
              <div className="services-item text-center">
                <div className="icon">
                  <span className="lni-heart" aria-hidden />
                </div>
                <h4>Launch &amp; Maintain</h4>
                <p>We go online with an awesome finished product. Then we monitor and update as-needed thereafter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function BusinessPlanSection() {
  return (
    <section id="business-plan" className="section">
      <div className="container">
        <div className="row business-row">
          <div className="col-lg-6 col-md-12 pl-0 pt-70 pr-5">
            <div className="business-item-img">
              <img src={ASSETS.business} className="img-fluid" alt="Business solutions" />
            </div>
          </div>
          <div className="col-lg-6 col-md-12 pl-4">
            <div className="business-item-info">
              <h3>Crafted for Business, Agency, &amp; Everything in Between</h3>
              <p>
                Entrepreneur, Startup, Influencer, B2B, whatever type of business or industry
                you&apos;re in, we provide in-demand support to help you grow.
              </p>
              <p>
                <u>
                  We are the go-to dedicated global offshoring agency that other digital agencies
                  hire to do the work for their clients.
                </u>
              </p>
              <a className="btn btn-common page-scroll" href="#features">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ShowcaseBanner({ title, description, ctaLabel, ctaHref = '#book', onCtaClick }) {
  return (
    <section id="showcase" className="showcase-block">
      <div className="container-fluid right-position">
        <div className="row gradient-bg">
          <div className="col-lg-12">
            <div className="showcase-text section-header text-center">
              <h2 className="section-title">{title}</h2>
              <div className="desc-text">
                <p>{description}</p>
              </div>
              <div className="header-button">
                <a
                  href={ctaHref}
                  className="btn btn-border page-scroll"
                  onClick={onCtaClick}
                >
                  {ctaLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const features = [
    { icon: 'lni-coffee-cup', title: 'Branding', text: 'Logo design, corporate identity, illustration, print collateral, web page, brochure, and any type of graphic design.' },
    { icon: 'lni-briefcase', title: 'Website', text: 'Stylish and fully functional custom WP sites cohesively designed with your brand that drives engagements.' },
    { icon: 'lni-invention', title: 'Sales Funnel', text: 'High-converting lead generation or email marketing with landing page, opt-in form, paid ads, plus A/B testing.' },
    { icon: 'lni-layers', title: 'Ecommerce', text: 'Paypal, Woocommerce, Shopify, etc. An online business that accepts online payments for digital or physical goods.' },
    { icon: 'lni-reload', title: 'Paid Ads', text: 'Tactical advertisement/PPC with Google Ads, Facebook Ads, Linkedin Ads, and more.' },
    { icon: 'lni-support', title: 'And More', text: 'Tech support, designers, web devs, sales and marketing, AI automation, subscription, SEO, eCourse, etc.' },
  ];

  return (
    <section id="features" className="section">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="features-text section-header text-center">
              <p className="features-quote">
                &ldquo;You know you need a digital contractor... Or you can go with me, who&apos;s been creating beautiful, high-converting websites for over a decade.&rdquo;
              </p>
              <h2 className="section-title">Service Offerings</h2>
              <div className="desc-text">
                <p>
                  We got you covered! <u>Take the first step by getting in touch</u> and tell us about
                  your project. <u>We serve businesses of all size and form.</u>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="row featured-bg">
          {features.map((f, i) => (
            <div key={f.title} className="col-lg-6 col-md-6 col-xs-12 p-0">
              <div className={`feature-item ${i % 2 === 0 ? 'featured-border1' : 'featured-border2'}`}>
                <div className="feature-icon float-left">
                  <span className={f.icon} aria-hidden />
                </div>
                <div className="feature-info float-left">
                  <h4>{f.title}</h4>
                  <p>{f.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
