import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function StarIcon({ full }) {
  if (full) {
    return (
      <svg className="gw-rv-avg-rating__star" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" role="img" aria-hidden="true" fill="none">
        <g fill="currentColor">
          <path d="M9.99993 1.66663L12.2041 6.96615L17.9254 7.42482L13.5664 11.1588L14.8981 16.7418L9.99993 13.75L5.10172 16.7418L6.43347 11.1588L2.07446 7.42482L7.79574 6.96615L9.99993 1.66663Z" />
        </g>
      </svg>
    );
  }
  return (
    <svg className="gw-rv-avg-rating__star-empty" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" role="img" aria-hidden="true" fill="none">
      <g fill="currentColor">
        <path d="M12.2047 6.96611L17.9257 7.42509L13.5662 11.1588L14.8984 16.7415L10.0001 13.75L5.10181 16.7415L6.434 11.1588L2.07446 7.42509L7.79549 6.96611L10.0001 1.66663L12.2047 6.96611ZM8.65649 8.151L5.17017 8.43014L7.82642 10.7063L7.01506 14.108L10.0001 12.2851L12.9843 14.108L12.1737 10.7063L14.8292 8.43014L11.3437 8.151L10.0001 4.92102L8.65649 8.151Z" />
      </g>
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <div className="gw-verified-badge" title="Verified Buyer">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
        <g fill="currentColor">
          <path d="M4.62991 8.8101C5.28736 5.84454 8.2244 3.97344 11.19 4.63089C11.5944 4.72054 11.9949 4.46539 12.0845 4.061C12.1742 3.6566 11.919 3.2561 11.5146 3.16645C7.74027 2.32969 4.00223 4.71109 3.16547 8.48544C2.32872 12.2598 4.71011 15.9978 8.48447 16.8346C12.2588 17.6713 15.9969 15.29 16.8336 11.5156C16.9233 11.1112 16.6681 10.7107 16.2637 10.621C15.8593 10.5314 15.4588 10.7865 15.3692 11.1909C14.7117 14.1565 11.7747 16.0276 8.80912 15.3701C5.84356 14.7127 3.97247 11.7757 4.62991 8.8101Z" />
          <path d="M16.0299 6.78033C16.3228 6.48744 16.3228 6.01257 16.0299 5.71967C15.737 5.42678 15.2621 5.42678 14.9692 5.71967L9.99955 10.6893L7.77988 8.46967C7.48699 8.17678 7.01211 8.17678 6.71922 8.46967C6.42633 8.76257 6.42633 9.23744 6.71922 9.53033L9.46922 12.2803C9.76211 12.5732 10.237 12.5732 10.5299 12.2803L16.0299 6.78033Z" />
        </g>
      </svg>
    </div>
  );
}

function ReviewSlider({ reviews }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [expandedReviews, setExpandedReviews] = useState({});

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 650) {
        setVisibleCards(1);
      } else if (window.innerWidth < 992) {
        setVisibleCards(2);
      } else {
        setVisibleCards(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = reviews.length - visibleCards;
  const pageCount = Math.ceil(reviews.length / visibleCards);
  const activeDot = Math.min(
    Math.floor(currentIndex / visibleCards),
    pageCount - 1
  );

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));
  const goToPage = (pageIdx) => {
    setCurrentIndex(Math.min(pageIdx * visibleCards, maxIndex));
  };

  const toggleExpand = (id) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="gw-rv-main-slider-widget-wrapper">
      <div className="gw-rv-main-slider-widget container">
        
        {/* Header Controls */}
        <div className="gw-rv-main-slider-widget__header">
          <div className="gw-rv-main-slider-widget__title">
            <p className="gw-title-main">Client Review</p>
            <p className="gw-title-sub">from 271 reviews</p>
          </div>
        </div>

        {/* Carousel Slider Track with side controls */}
        <div className="gw-rv-slider-wrapper">
          <div className="gw-rv-main-slider">
            <div className="gw-slider-container">
              <div
                className="gw-slider-track"
              style={{
                transform: `translate3d(-${currentIndex * (100 / visibleCards)}%, 0px, 0px)`,
              }}
            >
              {reviews.map((r) => {
                const isExpanded = expandedReviews[r.id];
                const shouldTruncate = r.text.length > 140;
                const displayText = shouldTruncate && !isExpanded 
                  ? r.text.substring(0, 135) + '...' 
                  : r.text;

                return (
                  <div
                    className="gw-rv-slider-item"
                    key={r.id}
                    style={{
                      width: `${100 / visibleCards}%`,
                    }}
                  >
                    <div className="gw-rv-slider-item__card">
                      <div className="gw-rv-slider-item__image-wrapper">
                        <img
                          className="gw-image__content"
                          src={r.image}
                          alt={r.alt}
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="gw-rv-slider-item__content">
                        <div className="gw-rv-slider-item__review-author">
                          <p className="gw-author-name">{r.author}</p>
                          <VerifiedBadge />
                        </div>
                        
                        <div className="gw-rv-avg-rating" aria-label={`${r.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon key={i} full={i < r.rating} />
                          ))}
                        </div>

                        <div className="gw-rv-slider-item__body">
                          <p className="gw-review-text">{displayText}</p>
                          {shouldTruncate && (
                            <button
                              type="button"
                              className="gw-read-more-btn"
                              onClick={() => toggleExpand(r.id)}
                            >
                              {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

            <div className="gw-rv-slider-controls">
              <button
                type="button"
                className="gw-slider-arrow gw-slider-arrow--prev"
                onClick={prev}
                disabled={currentIndex === 0}
                aria-label="Previous reviews"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="gw-slider-arrow gw-slider-arrow--next"
                onClick={next}
                disabled={currentIndex >= maxIndex}
                aria-label="Next reviews"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

        {/* Dots Indicator */}
        {pageCount > 1 && (
          <div className="gw-rv-slider-dots">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`gw-slider-dot ${i === activeDot ? 'active' : ''}`}
                onClick={() => goToPage(i)}
                aria-label={`Go to slide page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [navbarScrolled, setNavbarScrolled] = useState(false);

  useEffect(() => {
    document.title = "About Us - Client Reviews | The VA Orbit";
    window.scrollTo(0, 0);

    const onScroll = () => setNavbarScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const reviews = useMemo(
    () => [
      {
        id: 'r1',
        author: 'Tennille C.',
        rating: 5,
        image: '/assets/Tennille Cilia.jpg',
        alt: 'Tennille C.',
        text: 'The VA Orbit completely transformed our business operations. Their team handled our admin tasks flawlessly, giving us back 20+ hours a week. Highly professional and detail-oriented!',
      },
      {
        id: 'r2',
        author: 'Tarek E.',
        rating: 5,
        image: '/assets/Tarek El-Din.jpg',
        alt: 'Tarek E.',
        text: 'Our new website built by The VA Orbit is sleek, fast, and exactly what we needed. The development process was smooth and the turnaround time was impressive.',
      },
      {
        id: 'r3',
        author: 'Steph L.',
        rating: 4,
        image: '/assets/Steph Liew.jpg',
        alt: 'Steph L.',
        text: 'Great virtual assistant services! They helped streamline our email management and scheduling. Only wish we found them sooner. Very responsive team.',
      },
      {
        id: 'r4',
        author: 'James P.',
        rating: 5,
        image: '/assets/James Peterson.jpg',
        alt: 'James P.',
        text: 'The web development team delivered a stunning e-commerce site for us. Clean code, great UI/UX, and mobile-optimized. Could not be happier with the result!',
      },
      {
        id: 'r5',
        author: 'James H.',
        rating: 4,
        image: '/assets/James Haley.jpg',
        alt: 'James H.',
        text: 'Solid VA support for our social media management. Content scheduling and customer engagement have never been better. A reliable partner for digital tasks.',
      },
      {
        id: 'r6',
        author: 'James D.',
        rating: 5,
        image: '/assets/James Dann.jpg',
        alt: 'James D.',
        text: "Outstanding service from start to finish. The VA Orbit handled our data entry, research, and calendar management with zero errors. I've recommended them to three other business owners already.",
      },
      {
        id: 'r7',
        author: 'Harry W.',
        rating: 5,
        image: '/assets/Harry Wall.jpg',
        alt: 'Harry W.',
        text: 'Dashboard and reporting system they built for us is a game changer. Real-time data, clean visuals, and exactly what we needed to track our KPIs.',
      },
      {
        id: 'r8',
        author: 'Drew G.',
        rating: 5,
        image: '/assets/Drew Groves.jpg',
        alt: 'Drew G.',
        text: 'They redesigned our landing page and conversions went up by 35%. The team understood our brand vision and executed it perfectly. Top-notch web development.',
      },
      {
        id: 'r9',
        author: 'Debbie H.',
        rating: 5,
        image: '/assets/Debbie Hussein.jpg',
        alt: 'Debbie H.',
        text: "Our executive team was drowning in administrative work until we partnered with The VA Orbit. Now we focus on growth while they handle the day-to-day. Absolutely invaluable.",
      },
      {
        id: 'r10',
        author: 'Brendan N.',
        rating: 5,
        image: '/assets/Brendan Ng.jpg',
        alt: 'Brendan N.',
        text: 'Full-stack development for our SaaS platform was delivered on time and within budget. Clean architecture, thorough documentation, and ongoing support. Highly recommended!',
      },
    ],
    []
  );

  return (
    <>
      <Header scrolled={navbarScrolled} showHero={false} />
      
      <main className="about-main-content">
        <div className="rich-text__wrapper rich-text__wrapper--center page-width">
          <div className="rich-text__blocks center">
            <h2 className="rich-text__heading rte inline-richtext h1">
              Client Reviews
            </h2>
            <div className="rich-text__text rte">
              <p>Hear from our clients about how our VA and web development services help their businesses thrive.</p>
            </div>
            <div className="rich-text__buttons">
              <a href="#about-reviews-section" className="button button--primary">
                See All Reviews
              </a>
            </div>
          </div>
        </div>

        <section id="about-reviews-section" className="shopify-section section">
          <div className="page-width">
            <div className="shopify-block shopify-app-block gw-full-width">
              <ReviewSlider reviews={reviews} />
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenAdmin={() => {}} />
    </>
  );
}
