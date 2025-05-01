import React from 'react';
import { 
  FaShieldAlt, 
  FaCheckCircle, 
  FaBell, 
  FaUserShield, 
  FaMapMarkerAlt, 
  FaUsers,
  FaLock,
  FaChartLine,
  FaDatabase
} from 'react-icons/fa';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Empowering Communities Through Collaborative Safety</h1>
          <p className={styles.subtitle}>
            Our advanced crime reporting platform bridges the gap between citizens and law enforcement,
            creating safer neighborhoods through real-time collaboration and verified incident reporting.
          </p>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Crimes Prevented</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>500K+</span>
              <span className={styles.statLabel}>Active Users</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>95%</span>
              <span className={styles.statLabel}>Response Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.mission}>
        <div className={styles.missionContent}>
          <h2 className={styles.missionTitle}>Our Mission</h2>
          <p className={styles.missionStatement}>
            To create the most effective, community-driven crime prevention network that leverages
            technology to validate incidents in real-time, ensuring rapid response from authorities
            while maintaining complete transparency and accountability.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.icon}><FaShieldAlt /></div>
            <h3>Verified Incident Reporting</h3>
            <p>Multi-level verification system ensures only credible incidents receive immediate attention.</p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.icon}><FaCheckCircle /></div>
            <h3>AI-Powered Validation</h3>
            <p>Advanced algorithms analyze location accuracy and historical patterns for credibility scoring.</p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.icon}><FaBell /></div>
            <h3>Smart Alert System</h3>
            <p>Hyper-localized threat alerts with recommended safety actions and evacuation routes.</p>
          </div>
          
          <div className={styles.card}>
            <div className={styles.icon}><FaUserShield /></div>
            <h3>Identity Verification</h3>
            <p>Multi-tier verification system for civilians, law enforcement, and government officials.</p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className={styles.workflow}>
        <div className={styles.steps}>
          <div className={styles.step} data-step="1">
            <h3>Incident Report</h3>
            <p>Detailed reporting with media uploads and automatic metadata collection.</p>
          </div>
          
          <div className={styles.step} data-step="2">
            <h3>Community Validation</h3>
            <p>Real-time anonymous verification from nearby trusted users.</p>
          </div>
          
          <div className={styles.step} data-step="3">
            <h3>AI Analysis</h3>
            <p>Cross-referencing with historical data and crime pattern recognition.</p>
          </div>
          
          <div className={styles.step} data-step="4">
            <h3>Dispatch</h3>
            <p>Automated routing to appropriate response teams with all necessary data.</p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className={styles.security}>
        <div className={styles.missionContent}>
          <h2 className={styles.missionTitle}>Military-Grade Security</h2>
          <p className={styles.missionStatement}>
            We implement the highest security standards to protect user data and maintain trust.
          </p>
          <div className={styles.badges}>
            <div className={styles.badge}><FaLock /> AES-256 Encryption</div>
            <div className={styles.badge}><FaChartLine /> SOC 2 Certified</div>
            <div className={styles.badge}><FaDatabase /> GDPR Compliant</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;