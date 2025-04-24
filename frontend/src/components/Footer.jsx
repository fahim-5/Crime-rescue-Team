import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const { user } = useAuth();

  // Role-based quick links (same as before)
  const getQuickLinks = () => {
    if (user?.role === "admin") {
      return (
        <>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/reports">Reports</Link>
          </li>
          <li>
            <Link to="/admin/validations">Validations</Link>
          </li>
          <li>
            <Link to="/admin/analytics">Analytics</Link>
          </li>
          <li>
            <Link to="/admin/settings">Console</Link>
          </li>
        </>
      );
    } else if (user?.role === "police") {
      return (
        <>
          <li>
            <Link to="/police/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/police/reports">All Reports</Link>
          </li>
          <li>
            <Link to="/police/pending">Pending Cases</Link>
          </li>
          <li>
            <Link to="/police/resolved">Resolved Cases</Link>
          </li>
          <li>
            <Link to="/police/analytics">Analytics</Link>
          </li>
        </>
      );
    } else {
      // Public user or not logged in
      return (
        <>
          {!user && (
            <>
              <li>
                <Link to="/instructions">Instruction</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/">Sign In</Link>
              </li>
              <li>
                <Link to="/start">Sign Up</Link>
              </li>
            </>
          )}

          {user && (
            <>
              <li>
                <Link to="/home">Home</Link>
              </li>
              <li>
                <Link to="/report">Report</Link>
              </li>
              <li>
                <Link to="/notifications">Notifications</Link>
              </li>
              <li>
                <Link to="/alert">Alert</Link>
              </li>
              <li>
                <Link to="/public/settings">Account</Link>
              </li>
            </>
          )}
        </>
      );
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3 className="logo">Stop Crime.</h3>
          <p className="tagline">
            A platform to report crimes, get help from authorities, and contribute
            to safer communities.
          </p>
          
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul className="quick-links">{getQuickLinks()}</ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <ul className="contact-info">
            <li>Email: fahimfaysal@gmail.com</li>
            <li>Phone: +088 1774071130</li>
            <li>Emergency: 2229955</li>
          </ul>
        </div>


        <div className="social-icons">
            <a href="https://facebook.com" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://youtube.com" aria-label="YouTube"><FaYoutube /></a>
          </div>

      </div>

      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Stop Crime. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;