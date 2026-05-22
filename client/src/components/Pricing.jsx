import { useState } from 'react';
import {
  filterPricing,
  getStartedUrl,
  PRICING_CATEGORIES,
  EXTERNAL_LINKS,
} from '../data/siteContent';

const CATEGORY_META = {
  hourly: {
    title: 'Hourly Support Rates',
    desc: 'Our cost-effective website management & support hourly rates. Choose your plan, fill out the form, and send payment via card or PayPal.',
    footnote:
      'Technical support hours for WordPress mini tasks (30 min–1 hr). Unused hours do not carry over. Maximum 3 hours per business day.',
  },
  packages: {
    title: 'Custom Website Packages',
    anchor: 'packages',
    desc: 'Professional custom WordPress website bundled packages. Choose your package, fill out the form, and send 50% down payment.',
    footnote:
      'Branded websites launch in 1–4 weeks in 3 phases: design, development, then QA and launch tutorial.',
    includes:
      'All site packages include: Custom brand design • Optimised WordPress theme • Mobile responsive • SEO ready • Social integrations • Blog • Up to 2 revision rounds •',
  },
  hybrid: {
    title: 'Site Hybrid',
    anchor: 'hybrid',
    desc: null,
    footnote: null,
  },
  other: {
    title: 'Other Services',
    anchor: 'other',
    desc: null,
    footnote: null,
  },
};

function PricingCard({ plan }) {
  const btnClass =
    plan.featured && !['yearly', 'diy'].includes(plan.planType)
      ? 'btn btn-common'
      : 'btn btn-border';

  return (
    <div className={`col-lg-4 col-md-4 col-xs-12 ${plan.wide ? 'col-lg-6' : ''}`}>
      <div className={`pricing-table text-center ${plan.featured ? 'featured-plan' : ''}`}>
        <div className="pricing-details">
          <h3>{plan.title}</h3>
          <h1>
            <span>$</span>
            {plan.price.toLocaleString()}
            {plan.priceSuffix && <span>{plan.priceSuffix}</span>}
          </h1>
          <ul>
            {plan.details.map((detail, i) => (
              <li
                key={i}
                style={detail.includes('at $') ? { textDecoration: 'underline' } : undefined}
              >
                {detail}
              </li>
            ))}
          </ul>
        </div>
        <div className="plan-button">
          {plan.comingSoon ? (
            <span className="btn btn-border disabled">coming soon</span>
          ) : (
            <a
              href={getStartedUrl(plan.buyPlan)}
              target="_blank"
              rel="noreferrer"
              className={btnClass}
            >
              Buy This
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Pricing({ pricing, loading }) {
  const [activeCategory, setActiveCategory] = useState('hourly');
  const meta = CATEGORY_META[activeCategory];
  const plans = filterPricing(pricing, activeCategory);

  return (
    <section className="section pricing-section">
      <div id="pricing" className="container">
        <div className="pricing-text section-header text-center">
          <p className="pricing-quote">
            &ldquo;If you think that hiring professionals is expensive, try hiring amateurs.&rdquo;
            <span>
              One of the biggest mistakes any business could make is not invest in top talents and
              tools.
            </span>
          </p>
          <h2 className="section-title">Service Plans</h2>
          <div className="mini-text pricing-intro">
            Priced in USD. Competitive rates a fraction of local agency costs. Hosting and premium
            assets remain in your full ownership.
          </div>
        </div>

        <div className="pricing-tabs">
          {PRICING_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`pricing-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="row">
          <div className="col-lg-12 text-center category-heading">
            <h3 id={meta.anchor || (activeCategory === 'hourly' ? 'rates' : undefined)}>
              {meta.title}
            </h3>
            {meta.desc && (
              <div className="desc-text">
                <p>{meta.desc}</p>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="pricing-loading">Loading live prices...</p>
        ) : (
          <div className="row pricing-tables">
            {plans.map((plan) => (
              <PricingCard key={plan.planType} plan={plan} />
            ))}
          </div>
        )}

        {meta.footnote && <div className="mini-text pricing-footnote">{meta.footnote}</div>}

        {activeCategory === 'packages' && meta.includes && (
          <div className="mini-text pricing-includes">
            {meta.includes}{' '}
            <a href={EXTERNAL_LINKS.hosting} target="_blank" rel="noreferrer">
              Click here for hosting
            </a>{' '}
            [affiliate].
          </div>
        )}

        {activeCategory === 'other' && (
          <>
            <p className="pricing-serious">
              Serious about your business? Then treat it like one. I build premium,
              conversion-focused digital solutions that actually work.
            </p>
            <p className="pricing-serious-sub">Ready to do it right the first time? Let&apos;s talk.</p>
          </>
        )}
      </div>
    </section>
  );
}
