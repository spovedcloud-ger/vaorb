import { useState, useEffect } from 'react';
import { EXTERNAL_LINKS, ASSETS } from '../data/siteContent';
import logoImg from '../assets/TheVAorbitMAIN2.png';

export default function Header({ scrolled, showHero = true }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    document.body.classList.toggle('nav-menu-open', menuOpen);
    return () => document.body.classList.remove('nav-menu-open');
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onScroll = () => setMenuOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  return (
    <header id="home" className={showHero ? "hero-area" : "subpage-header"}>
      {showHero ? (
        <div className="overlay">
          <span />
          <span />
        </div>
      ) : (
        <div className="subpage-header-spacer" style={{ height: '70px' }} />
      )}

      <nav
        className={`navbar navbar-expand-md fixed-top scrolling-navbar ${scrolled || !showHero ? 'menu-bg navbar-scrolled' : ''}`}
      >
        <div className="container">
          <a className="navbar-brand" href={showHero ? "#home" : "/"} aria-label="The VA Orbit home">
            <img src={logoImg} alt="The VA Orbit" />
          </a>
          <button
            type="button"
            className="navbar-toggler"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="lni-menu" aria-hidden />
          </button>

          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarCollapse">
            <ul className="navbar-nav mr-auto w-100 justify-content-end">
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="/about"
                  target={window.location.pathname === '/about' ? '_self' : '_blank'}
                  rel={window.location.pathname === '/about' ? '' : 'noreferrer'}
                  onClick={(e) => {
                    closeMenu();
                    if (window.location.pathname === '/about') {
                      e.preventDefault();
                      window.location.reload();
                    }
                  }}
                >
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link page-scroll" href={showHero ? "#services" : "/#services"} onClick={closeMenu}>
                  Services
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link page-scroll" href={showHero ? "#pricing" : "/#pricing"} onClick={closeMenu}>
                  Rates
                </a>
              </li>
              {/* <li className="nav-item">
                <a className="nav-link page-scroll" href="#packages" onClick={closeMenu}>
                  Packages
                </a>
              </li> */}
              <li className="nav-item">
                <a className="nav-link page-scroll" href={showHero ? "#contact" : "/#contact"} onClick={closeMenu}>
                  Contact
                </a>
              </li>

            </ul>
          </div>
        </div>
      </nav>

      {showHero && (
        <div className="container hero-contents-wrap">
          <div className="row space-100">
            <div className="col-lg-6 col-md-12 col-xs-12">
              <div className="contents">
                <h2 className="head-title">Reclaimed your first 20+ hours of free time yet?</h2>
                <p>
                  Let&apos;s upgrade your startup with premium strategic support and friction-free SOPs, to 2x, 3x, 10x your focus and ROI.
                </p>
                <div className="header-button">
                  <a href="#book" className="btn btn-border-filled page-scroll">
                    Book A Call
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-xs-12 p-0">
              <div className="intro-img">
                <img src={ASSETS.intro} alt="Carl Falle digital solutions" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
