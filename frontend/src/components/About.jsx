import React from 'react';
import { FaShieldAlt, FaCheckCircle, FaBell, FaUserShield, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>Empowering Communities Through Collaborative Safety</h1>
          <p className="hero-subtitle">
            Our advanced crime reporting platform bridges the gap between citizens and law enforcement,
            creating safer neighborhoods through real-time collaboration and verified incident reporting.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Crimes Prevented</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500,000+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">95%</span>
              <span className="stat-label">Response Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mission-section">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p className="mission-statement">
            To create the most effective, community-driven crime prevention network that leverages
            technology to validate incidents in real-time, ensuring rapid response from authorities
            while maintaining complete transparency and accountability.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="features-section">
        <h2 className="section-title">Advanced Safety Features</h2>
        <p className="section-subtitle">
          Our platform combines cutting-edge technology with community power to deliver unmatched safety solutions
        </p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Verified Incident Reporting</h3>
            <p>
              Every report undergoes multi-level verification from nearby users before being escalated to authorities,
              ensuring only credible incidents receive immediate attention.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            <h3>AI-Powered Validation</h3>
            <p>
              Our proprietary algorithm analyzes multiple data points including location accuracy, reporter history,
              and incident patterns to assign credibility scores to each report.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaBell />
            </div>
            <h3>Smart Alert System</h3>
            <p>
              Receive hyper-localized alerts about verified incidents in your immediate vicinity,
              with threat level assessments and recommended safety actions.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaUserShield />
            </div>
            <h3>Identity Verification</h3>
            <p>
              All users undergo secure identity confirmation to maintain platform integrity,
              with different verification levels for civilians, law enforcement, and officials.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaMapMarkerAlt />
            </div>
            <h3>Precision Geolocation</h3>
            <p>
              Advanced geofencing technology ensures accurate incident mapping and automatically
              notifies the most relevant responders based on jurisdiction and proximity.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaUsers />
            </div>
            <h3>Community Watch</h3>
            <p>
              Join neighborhood safety networks where verified users can collaborate on preventing crime
              and sharing safety tips specific to your local area.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="workflow-section">
        <h2 className="section-title">Our Verification Process</h2>
        <p className="section-subtitle">
          The most rigorous incident validation system in public safety technology
        </p>
        
        <div className="workflow-steps">
          <div className="workflow-card">
            <div className="step-number">1</div>
            <h3>Incident Report</h3>
            <p>
              User submits detailed report with photos/video, location data, and incident description.
              Our system automatically logs metadata including device information and location history.
            </p>
          </div>
          
          <div className="workflow-card">
            <div className="step-number">2</div>
            <h3>Community Validation</h3>
            <p>
              Nearby verified users receive anonymous notification to confirm or deny the incident.
              Multiple independent confirmations trigger elevated priority status.
            </p>
          </div>
          
          <div className="workflow-card">
            <div className="step-number">3</div>
            <h3>AI Analysis</h3>
            <p>
              Our system cross-references the report with historical data, crime patterns, and
              sensor inputs to assess credibility and assign threat level.
            </p>
          </div>
          
          <div className="workflow-card">
            <div className="step-number">4</div>
            <h3>Law Enforcement Dispatch</h3>
            <p>
              Verified high-confidence incidents are automatically routed to the appropriate
              response teams with all relevant data packaged for immediate action.
            </p>
          </div>
        </div>
      </section>

      {/* Security Assurance */}
      <section className="security-section">
        <div className="security-content">
          <h2>Enterprise-Grade Security</h2>
          <p>
            We implement military-grade encryption, regular third-party audits, and strict data access protocols
            to ensure all user information and incident reports remain completely secure and anonymous when required.
          </p>
          <div className="security-badges">
            <div className="badge">GDPR Compliant</div>
            <div className="badge">256-bit Encryption</div>
            <div className="badge">SOC 2 Certified</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;