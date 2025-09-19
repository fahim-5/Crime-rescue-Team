import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import styles from './MyReports.module.css';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaUsers,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaFolder,
  FaShieldAlt,
  FaInfoCircle,
  FaRedo,
  FaSignInAlt,
  FaPlus,
  FaUserAlt,
  FaClipboardCheck,
  FaExclamationCircle,
  FaFolderOpen,
  FaImage,
} from "react-icons/fa";

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        setLoading(true);

        if (!user || !token) {
          setReports([]);
          setError("Please log in to view your reports");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/reports/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.status}`);
        }

        const data = await response.json();
        setReports(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(
          err.message || "An error occurred while fetching your reports"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserReports();
  }, [user, token]);

  const getStatusBadge = (report) => {
    if (report.valid_count >= 3) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>
          <FaCheck /> Confirmed
        </span>
      );
    } else if (report.total_validations > 0) {
      return (
        <span className={`${styles.statusBadge} ${styles.statusPending}`}>
          <FaInfoCircle /> Under Review
        </span>
      );
    } else {
      return (
        <span className={`${styles.statusBadge} ${styles.statusNew}`}>
          <FaFolder /> New
        </span>
      );
    }
  };

  const getPoliceResponseBadge = (report) => {
    if (!report.alerts || report.alerts.length === 0) {
      return null;
    }

    const latestAlert = report.alerts[0];

    switch (latestAlert.status) {
      case "responded":
        return (
          <div className={styles.policeResponse}>
            <span className={`${styles.responseBadge} ${styles.responseResponded}`}>
              <FaShieldAlt /> Police Responded
            </span>
          </div>
        );
      case "confirmed":
        return (
          <div className={styles.policeResponse}>
            <span className={`${styles.responseBadge} ${styles.responseConfirmed}`}>
              <FaCheck /> Confirmed by Police
            </span>
          </div>
        );
      case "pending":
        return (
          <div className={styles.policeResponse}>
            <span className={`${styles.responseBadge} ${styles.responsePending}`}>
              <FaSpinner /> Awaiting Response
            </span>
          </div>
        );
      case "closed":
        return (
          <div className={styles.policeResponse}>
            <span className={`${styles.responseBadge} ${styles.responseClosed}`}>
              <FaTimes /> Case Closed
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundElements}>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
        </div>
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundElements}>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
        </div>
        <div className={styles.errorContainer}>
          <FaExclamationCircle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Authentication Required</h2>
          <p className={styles.errorMessage}>{error}</p>
          <a href="/login" className={styles.loginButton}>
            <FaSignInAlt /> Log In
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundElements}>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
        </div>
        <div className={styles.errorContainer}>
          <FaExclamationCircle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Something Went Wrong</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            <FaRedo /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundElements}>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
        </div>
        <div className={styles.reportsContainer}>
          <div className={styles.reportsHeader}>
            <h2 className={styles.reportsTitle}>My Reports</h2>
            <p className={styles.reportsSubtitle}>
              Track the status of your crime reports and view responses from
              authorities
            </p>
          </div>
          
          <div className={styles.emptyContainer}>
            <div className={styles.emptyState}>
              <FaFolderOpen className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                You haven't submitted any reports yet. Start by submitting your
                first crime report to help keep your community safe.
              </p>
              <a href="/report" className={styles.reportButton}>
                <FaPlus /> Submit a Report
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundElements}>
        <div className={styles.floatingElement}></div>
        <div className={styles.floatingElement}></div>
        <div className={styles.floatingElement}></div>
        <div className={`${styles.sideAnimation} ${styles.left}`}></div>
        <div className={`${styles.sideAnimation} ${styles.right}`}></div>
      </div>
      
      <div className={styles.reportsContainer}>
        <div className={styles.reportsHeader}>
          {/* <h2 className={styles.reportsTitle}>My Reports</h2> */}
  
        </div>

        <div className={styles.reportsGrid}>
          {reports.map((report) => (
            <div key={report.id} className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <h3 className={styles.reportTitle}>
                  {report.crime_type?.charAt(0)?.toUpperCase() +
                    report.crime_type?.slice(1) || 'Crime Report'}
                </h3>
                {getStatusBadge(report)}
              </div>

              <div className={styles.reportDetails}>
                <div className={styles.detailItem}>
                  <FaMapMarkerAlt className={styles.detailIcon} />
                  <span>{report.location || 'Unknown location'}</span>
                </div>

                <div className={styles.detailItem}>
                  <FaCalendarAlt className={styles.detailIcon} />
                  <span>
                    {report.time ? new Date(report.time).toLocaleDateString() : 'Unknown date'}
                    {report.time && (
                      <span className={styles.timeAgo}>
                        {getTimeAgo(report.time)}
                      </span>
                    )}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <FaUsers className={styles.detailIcon} />
                  <span>
                    {report.num_criminals || 0} suspect
                    {report.num_criminals !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className={styles.reportStatus}>
                <div className={styles.validationStatus}>
                  <div className={styles.validationHeader}>
                    <FaClipboardCheck className={styles.validationIcon} />
                    <span className={styles.validationLabel}>
                      Community Validation
                    </span>
                  </div>
                  <div className={styles.validationStats}>
                    <div className={styles.statItem}>
                      <FaCheck className={`${styles.statIcon} ${styles.statValid}`} />
                      <span className={`${styles.statValue} ${styles.statValid}`}>
                        {report.valid_count || 0}
                      </span>
                      <span className={`${styles.statLabel} ${styles.statValid}`}>
                        Valid
                      </span>
                    </div>
                    
                    <div className={styles.divider}></div>
                    
                    <div className={styles.statItem}>
                      <FaTimes className={`${styles.statIcon} ${styles.statInvalid}`} />
                      <span className={`${styles.statValue} ${styles.statInvalid}`}>
                        {report.invalid_count || 0}
                      </span>
                      <span className={`${styles.statLabel} ${styles.statInvalid}`}>
                        Invalid
                      </span>
                    </div>
                  </div>
                </div>

                {getPoliceResponseBadge(report)}
              </div>

              <a 
                href={`/report/${report.id}`} 
                className={styles.viewDetailsButton}
              >
                View Full Details
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyReports;