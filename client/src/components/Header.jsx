import { useState } from 'react';
import { EXTERNAL_LINKS, ASSETS } from '../data/siteContent';
import logoImg from '../assets/TheVAorbitMAIN2.png';

export default function Header({ scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header id="home" className="hero-area">
      <div className="overlay">
        <span />
        <span />
      </div>

      <nav className={`navbar navbar-expand-md fixed-top scrolling-navbar ${scrolled ? 'menu-bg' : ''}`}>
        <div className="container">
          <a className="navbar-brand" href="#home" aria-label="The VA Orbit home">
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
                <a className="nav-link" href={EXTERNAL_LINKS.about} target="_blank" rel="noreferrer" onClick={closeMenu}>
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link page-scroll" href="#services" onClick={closeMenu}>
                  Services
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link page-scroll" href="#pricing" onClick={closeMenu}>
                  Rates
                </a>
              </li>
              {/* <li className="nav-item">
                <a className="nav-link page-scroll" href="#packages" onClick={closeMenu}>
                  Packages
                </a>
              </li> */}
              <li className="nav-item">
                <a className="nav-link page-scroll" href="#contact" onClick={closeMenu}>
                  Contact
                </a>
              </li>

            </ul>
          </div>
        </div>
      </nav>

      <div className="container hero-contents-wrap">
        <div className="row space-100">
          <div className="col-lg-6 col-md-12 col-xs-12">
            <div className="contents">
              <h2 className="head-title">
                Got your own AI-powered online business yet?
              </h2>
              <p>
                Let&apos;s upgrade your business into a high-converting website
                <br />
                with AI systems, to 2x, 3x, 10x your ROI.
              </p>
              <div className="header-button">
                <a
                  href={EXTERNAL_LINKS.getQuote}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-border-filled"
                >
                  Get A Quote
                </a>
                <a href="#book" className="btn btn-border page-scroll">
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
    </header>
  );
}
