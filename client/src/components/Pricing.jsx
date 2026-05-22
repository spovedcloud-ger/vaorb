import { useState } from 'react';
import {
  filterPricing,
  getStartedUrl,
  PRICING_CATEGORIES,
  EXTERNAL_LINKS,
} from '../data/siteContent';

const CATEGORY_META = {
  hourly: {
    title: 'VA Services: Flat Monthly Retainer',
    desc: 'Instead of unpredictable hourly bills, we bundle a set amount of operational capacity into a flat monthly retainer. This gives you predictable expenses and guaranteed dedicated support.',
    footnote:
      'Unused capacity does not roll over to the next month. A flat retainer rewards efficiency—meaning you still get full value even if we finish your tasks faster.',
  },
  packages: {
    title: 'Web Development: Flat Per-Project Pricing',
    anchor: 'packages',
    desc: 'Because building a website has a clear beginning, middle, and end, we charge a flat project fee rather than an unpredictable hourly rate.',
    footnote:
      'We use "Starting At" numbers to give you a baseline and ensure flexibility based on complexity.',
    includes:
      'All site packages include: Custom design • Modern Frontend Frameworks (React, Next.js) • High Performance • Mobile responsive • SEO ready • Full Source Code Ownership •',
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
            </a>.
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
