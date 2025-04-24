import React from 'react';
import styles from './Instructions.module.css';

const Instructions = () => {
  return (
    <div className={styles.instructionsContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.mainTitle}>Welcome to Stop Crime</h1>
        <p className={styles.subtitle}>Your complete guide to getting started with our crime reporting platform</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Getting Started</h2>
        <div className={styles.instructionCard}>
          <h3 className={styles.cardTitle}>Platform Overview</h3>
          <p className={styles.cardIntro}>
            Our platform provides three distinct access levels tailored to different user needs:
          </p>
          <ul className={styles.instructionList}>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Public:</strong>Community members can report crimes, view safety alerts, and access prevention resources. This level focuses on community engagement and rapid incident reporting.
            </li>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Police:</strong>Verified law enforcement personnel gain access to real-time reports, case management tools, and analytical dashboards to coordinate responses effectively.
            </li>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Admin:</strong> System administrators oversee user verification, platform configuration, and have access to comprehensive analytics for strategic decision-making.
            </li>
          </ul>
          <p className={styles.cardIntro}>
            Each role is carefully designed with specific capabilities and security measures to ensure appropriate access while maintaining data integrity. Our tiered approach enables efficient collaboration between community members and law enforcement to combat crime effectively.
          </p>
        </div>
      </section>

      {/* Rest of the component remains exactly the same */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Creation</h2>
        <div className={styles.instructionGrid}>
          {/* Public User */}
          <div className={styles.instructionCard}>
            <h3 className={styles.cardTitle}>Public User Registration</h3>
            <p className={styles.cardIntro}>
              For community members who want to report crimes or view alerts
            </p>
            <ul className={styles.instructionList}>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Select "Public" as your role during registration
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Complete all required fields in the registration form
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Verify your email address through the confirmation link
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Your account will be active immediately after verification
              </li>
            </ul>
            <div className={styles.featureHighlight}>
              <strong>Key Features:</strong> Report crimes, receive alerts, view safety tips
            </div>
          </div>

          {/* Police */}
          <div className={styles.instructionCard}>
            <h3 className={styles.cardTitle}>Police Officer Registration</h3>
            <p className={styles.cardIntro}>
              For law enforcement personnel who need to manage and respond to reports
            </p>
            <ul className={styles.instructionList}>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Choose "Police" as your role during registration
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Provide your official badge number and department information
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Submit required verification documents
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Your application will be reviewed by an administrator (24-48 hours)
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                You'll receive approval notification via email
              </li>
            </ul>
            <div className={styles.featureHighlight}>
              <strong>Key Features:</strong> Manage cases, update statuses, access analytics
            </div>
          </div>

          {/* Admin */}
          <div className={styles.instructionCard}>
            <h3 className={styles.cardTitle}>Administrator Registration</h3>
            <p className={styles.cardIntro}>
              For system administrators who manage users and platform operations
            </p>
            <ul className={styles.instructionList}>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Select "Admin" as your role during registration
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Enter an existing administrator's email for verification
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                A 6-digit verification code will be sent to that email
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Enter the code within 10 minutes to complete registration
              </li>
              <li className={styles.listItem}>
                <span className={styles.checkIcon}>✓</span>
                Set up your security questions for account recovery
              </li>
            </ul>
            <div className={styles.featureHighlight}>
              <strong>Key Features:</strong> User management, system configuration, advanced analytics
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Login Instructions</h2>
        <div className={styles.instructionCard}>
          <h3 className={styles.cardTitle}>General Login Process</h3>
          <ul className={styles.instructionList}>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Email:</strong> Enter your registered email address
            </li>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Password:</strong> Provide your secure password
            </li>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Role Selection:</strong> Choose your appropriate role from the dropdown
            </li>
            <li className={styles.listItem}>
              <span className={styles.checkIcon}>✓</span>
              <strong>Access:</strong> Click "Login" to enter your personalized dashboard
            </li>
          </ul>
          <div className={styles.note}>
            <strong>Note:</strong> If you've forgotten your password, use the "Forgot Password" link on the login page.
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Need Help?</h2>
        <div className={styles.helpCard}>
          <p>
            Our support team is available 24/7 to assist you with any questions or issues.
            Contact us at <a href="crime_rescue_bd@stopcrime.com" className={styles.contactLink}>crime_rescue_bd@stopcrime.com</a> or 
            call our helpline at <span className={styles.contactLink}>111-222-555</span>.
          </p>
          <button className={styles.contactButton}>Live Chat Support</button>
        </div>
      </section>
    </div>
  );
};

export default Instructions;