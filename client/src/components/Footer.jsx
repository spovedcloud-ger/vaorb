import { EXTERNAL_LINKS } from '../data/siteContent';

export default function Footer({ onOpenAdmin }) {
  return (
    <>
      <footer>
        <section id="footer-Content" className="footer-cta" style={{ backgroundColor: '#383838' }}>
          <div className="copyright">
            <div className="container">
              <div className="row footer-cta-row">
                <div className="mini-text">
                  Already know that every business needs a smart website in the AI era? Get a sleek,
                  branded business website built by a pro in just 1-2 weeks. Scroll up and reach out
                  now!
                </div>
              </div>
            </div>
          </div>
        </section>
      </footer>

      <footer>
        <section id="footer-Content" className="footer-affiliate" style={{ backgroundColor: '#2D2D2D' }}>
          <div className="copyright">
            <div className="container">
              <div className="row">
                <div className="mini-text affiliate-text">
                  This site contains affiliate links with which I may earn a commission when you
                  purchase through it, at no extra cost to you.
                </div>
              </div>
            </div>
          </div>
        </section>
      </footer>

      <footer>
        <section id="footer-Content">
          <div className="copyright">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="site-info text-center">
                    <p>
                      <a href={EXTERNAL_LINKS.about} target="_blank" rel="noreferrer">
                        About
                      </a>
                      &nbsp;&nbsp;&nbsp;
                      <a href="#pricing" className="page-scroll">
                        Support
                      </a>
                      &nbsp;&nbsp;&nbsp;
                      <a href="#packages" className="page-scroll">
                        Websites
                      </a>
                      &nbsp;&nbsp;&nbsp;
                      <a href="#contact" className="page-scroll">
                        Contact
                      </a>
                      &nbsp;&nbsp;&nbsp;
                      <a href={EXTERNAL_LINKS.tools} target="_blank" rel="noreferrer">
                        Tools
                      </a>
                      &nbsp;&nbsp;&nbsp;
                      <button type="button" className="footer-link-btn" onClick={onOpenAdmin}>
                        Earn
                      </button>
                      &nbsp;&nbsp;|&nbsp;&nbsp;© 2015-2026&nbsp;&nbsp;
                      <a href="https://www.carlfalle.com" rel="nofollow">
                        Carl Falle
                      </a>

                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </footer>
    </>
  );
}
