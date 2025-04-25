import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import styles from "./Home.module.css";
import {
  FiAlertTriangle,
  FiEye,
  FiShield,
  FiMapPin,
  FiUsers,
  FiBarChart2,
} from "react-icons/fi";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiAlertTriangle className={styles.featureIcon} />,
      title: "Real-time Reporting",
      description:
        "Instantly report criminal activities in your area with our easy-to-use interface.",
    },
    {
      icon: <FiEye className={styles.featureIcon} />,
      title: "Community Watch",
      description:
        "View and validate reports from other users to help authorities prioritize responses.",
    },
    {
      icon: <FiShield className={styles.featureIcon} />,
      title: "Safety Analytics",
      description:
        "Access crime statistics and safety tips tailored to your neighborhood.",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>
            Welcome to <span className={styles.highlight}>Safe Society</span>
          </h1>
          <p className={styles.subtitle}>
            Your vigilance makes our community safer. Report crimes, validate
            incidents, and stay informed about safety in your neighborhood.
          </p>

          {user ? (
            <div className={styles.userGreeting}>
              Welcome back, {user.full_name || user.username}! Ready to make a
              difference today?
            </div>
          ) : (
            <p className={styles.secondaryText}>
              Sign in to access all safety features and contribute to your
              community.
            </p>
          )}

          <div className={styles.ctaSection}>
            <div className={styles.actionButtons}>
              {user && (
                <button
                  className={styles.primaryButton}
                  onClick={() => navigate("/report")}
                >
                  <FiAlertTriangle /> Report a Crime
                </button>
              )}

              <button
                className={styles.viewReportsButton}
                onClick={() => navigate("/reports")}
              >
                <FiEye /> View My Reports
              </button>
            </div>
          </div>

          <div className={styles.features}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                {feature.icon}
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
