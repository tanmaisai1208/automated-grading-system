import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      <div className="footer-pattern"></div>
      
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>GradeForge</h3>
            <p className="footer-desc">
              Empowering educators with intelligent grade computation and comprehensive 
              analytics for academic excellence.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Email">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 4H17C17.55 4 18 4.45 18 5V15C18 15.55 17.55 16 17 16H3C2.45 16 2 15.55 2 15V5C2 4.45 2.45 4 3 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 5L10 11L2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H16C17.1 18 18 17.1 18 16V4C18 2.9 17.1 2 16 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 9V14M6 6V6.01M10 14V10C10 9.5 10.5 9 11 9C11.5 9 12 9.5 12 10V14M10 14V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M18 4.5C17.25 4.875 16.5 5.125 15.625 5.25C16.5 4.75 17.125 3.875 17.375 2.875C16.625 3.375 15.75 3.625 14.875 3.875C14.125 3 13 2.5 11.875 2.5C9.75 2.5 8 4.25 8 6.375C8 6.75 8 7 8.125 7.25C5.375 7.125 2.875 5.625 1.25 3.25C0.875 3.875 0.75 4.625 0.75 5.5C0.75 7 1.5 8.25 2.625 9C2 9 1.375 8.75 0.875 8.5C0.875 10.375 2.25 11.875 4 12.25C3.625 12.375 3.25 12.375 2.875 12.375C2.625 12.375 2.375 12.375 2.125 12.25C2.625 13.875 4.125 15 5.875 15C4.5 16 2.75 16.625 0.875 16.625H0C1.75 17.75 3.875 18.5 6.125 18.5C11.875 18.5 15 12.5 15 7C15 6.75 15 6.625 15 6.375C15.75 5.875 16.5 5.25 17 4.5H18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#integrations">Integrations</a></li>
                <li><a href="#api">API Access</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li><a href="#guides">User Guides</a></li>
                <li><a href="#tutorials">Tutorials</a></li>
                <li><a href="#research">Research</a></li>
                <li><a href="#support">Support Center</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Institution</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#team">Our Team</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#security">Security</a></li>
                <li><a href="#compliance">FERPA Compliance</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p className="copyright">© 2024 GradeForge. All Rights Reserved.</p>
            <div className="certification-badge">
              <span className="badge-icon">✓</span>
              <span>FERPA Compliant</span>
            </div>
          </div>
          <div className="footer-version">
            <span>Version 2.5.0</span>
            <span className="separator">|</span>
            <span>Built for Educators</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
