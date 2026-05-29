import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import BackToTop from './components/BackToTop';
import { useBotpress } from './hooks/useBotpress';
import {
  ServicesSection,
  BusinessPlanSection,
  ShowcaseBanner,
  FeaturesSection,
} from './components/MainSections';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { useSiteApi } from './hooks/useSiteApi';
import { useAdmin } from './hooks/useAdmin';
import { EXTERNAL_LINKS } from './data/siteContent';

import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [navbarScrolled, setNavbarScrolled] = useState(false);

  const {
    apiBase,
    pricing,
    setPricing,
    pricingLoading,
    trackBookingClick,
    submitContact,
  } = useSiteApi();

  const admin = useAdmin(apiBase, pricing, setPricing);

  useBotpress();

  useEffect(() => {
    const onScroll = () => setNavbarScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);

    const onAnchorClick = (e) => {
      const link = e.target.closest('a.page-scroll');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        // Account for fixed header (Header uses fixed-top navbar)
        const header = document.querySelector('.navbar.fixed-top') || document.querySelector('.navbar');
        const headerOffset = header?.offsetHeight ?? 70;

        const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
        const scrollToY = Math.max(0, targetTop - headerOffset);

        window.scrollTo({ top: scrollToY, behavior: 'smooth' });
      }
    };
    document.addEventListener('click', onAnchorClick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onAnchorClick);
    };
  }, []);

  const path = window.location.pathname;

  if (path === '/about') {
    return <AboutPage />;
  }

  if (path !== '/' && !path.startsWith('/#')) {
    return <NotFoundPage />;
  }

  return (
    <>
      <Header scrolled={navbarScrolled} />


      <ServicesSection />
      <BusinessPlanSection />

      <ShowcaseBanner
        title="Flash Website Promo | View Your Website"
        description="Launch your high-converting, AI-powered, beautiful smart website in 10-15 business days. Website packages on sale starting at $2694. Book a call to view demo templates for your niche."
        ctaLabel="Book a Call to View Demos"
        onCtaClick={trackBookingClick}
      />

      <FeaturesSection />

      <ShowcaseBanner
        title="AI Automate Your Business | Effortless Efficiency, Unlimited Growth"
        description="Transform the way you work by automating time-consuming tasks with cutting-edge AI solutions. From lead generation to customer engagement, our AI automation tools handle operations from A to Z."
        ctaLabel="AI Strategy Session – Book Your Free Call Now!"
        onCtaClick={trackBookingClick}
      />

      <Pricing pricing={pricing} loading={pricingLoading} />

      <ShowcaseBanner
        title="Unli Service For Multiple Projects"
        description="Unlimited service subscriptions for businesses and digital agencies with frequent white-labelled done-for-you task requests. Pause or cancel anytime."
        ctaLabel="Learn More"
        ctaHref={EXTERNAL_LINKS.learnMore}
      />

      <Contact onSubmit={submitContact} onBookingClick={trackBookingClick} />

      <Footer onOpenAdmin={() => admin.setShowAdmin(true)} />

      <BackToTop />

      <AdminPanel
        show={admin.showAdmin}
        onClose={() => admin.setShowAdmin(false)}
        isLoggedIn={admin.isAdminLoggedIn}
        password={admin.adminPassword}
        onPasswordChange={admin.setAdminPassword}
        onLogin={admin.handleAdminLogin}
        onLogout={admin.handleAdminLogout}
        tab={admin.adminTab}
        onTabChange={admin.setAdminTab}
        inquiries={admin.adminInquiries}
        analytics={admin.adminAnalytics}
        pricing={pricing}
        cmsStatus={admin.cmsStatus}
        actionLoading={admin.inquiryActionLoading}
        onUpdateInquiry={admin.handleUpdateInquiryStatus}
        onDeleteInquiry={admin.handleDeleteInquiry}
        onUpdatePrice={admin.handleUpdatePrice}
      />
    </>
  );
}

export default App;
