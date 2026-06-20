import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'AI Interview', href: '#' },
      { name: 'Mock Coding', href: '#' },
      { name: 'Resume Analysis', href: '#' },
    ],
    Company: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    Legal: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Cookies', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: <FiGithub size={18} />, href: '#', label: 'GitHub' },
    { icon: <FiTwitter size={18} />, href: '#', label: 'Twitter' },
    { icon: <FiLinkedin size={18} />, href: '#', label: 'LinkedIn' },
    { icon: <FiMail size={18} />, href: '#', label: 'Email' },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#footer-grad)" />
                <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="footer-grad" x1="0" y1="0" x2="28" y2="28">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <span>Intern<span className="gradient-text">JetCo</span></span>
            </Link>
            <p className="footer__description">
              Practice interviews with peers, mentors, and AI. Land your dream tech job with confidence.
            </p>
            <div className="footer__socials">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="footer__social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="footer__column">
              <h4 className="footer__column-title">{title}</h4>
              <ul className="footer__column-links">
                {links.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="footer__link">{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p>&copy; {currentYear} InternJetCo. All rights reserved.</p>
          <p>Built with ❤️ for aspiring engineers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
