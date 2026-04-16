import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import "../styles/Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <div className="footer-logo">
              <GraduationCap className="footer-logo-icon" />
              <span className="footer-logo-text">ScholarSphere</span>
            </div>
            <p className="footer-description">
              Empowering VJTI students through accessible scholarship opportunities. 
              Find, apply, and track scholarships all in one place.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook className="social-icon" />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter className="social-icon" />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin className="social-icon" />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram className="social-icon" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Available Scholarships</a></li>
              <li><a href="#">Application Guidelines</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Contact Support</a></li>
            </ul>
          </div>

          {/* Scholarship Categories */}
          <div className="footer-section">
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              <li><a href="#">Merit Based</a></li>
              <li><a href="#">SC/ST Scholarships</a></li>
              <li><a href="#">OBC Scholarships</a></li>
              <li><a href="#">EWS Category</a></li>
              <li><a href="#">Special Scholarships</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="contact-info">
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <span>
                  VJTI, H R Mahajani Marg,<br />
                  Matunga, Mumbai - 400019
                </span>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" />
                <span>+91 22 2419 8100</span>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" />
                <span>scholarships@vjti.ac.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} ScholarSphere - VJTI. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Help Center</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
