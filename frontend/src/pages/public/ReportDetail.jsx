import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import styles from "./ReportDetail.module.css";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaUsers,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaArrowLeft,
  FaShieldAlt,
  FaUserCircle,
  FaRegClock,
  FaVenus,
  FaMars,
  FaGenderless,
  FaFolder,
  FaInfoCircle,
  FaEye,
  FaCommentAlt,
  FaTag,
  FaClipboardCheck
} from "react-icons/fa";
import { formatDistanceToNow, format } from "date-fns";

const ReportDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);

        if (!id) {
          throw new Error("Report ID is required");
        }

        const response = await fetch(
          `http://localhost:5000/api/reports/${id}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch report (Status: ${response.status})`
          );
        }

        const data = await response.json();
        setReport(data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching report details:", err);
        setError(err.message || "Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [id, token]);

  const getGenderIcon = (gender) => {
    switch (gender.toLowerCase()) {
      case "male":
        return <FaMars className={styles.genderIconMale} />;
      case "female":
        return <FaVenus className={styles.genderIconFemale} />;
      default:
        return <FaGenderless className={styles.genderIconOther} />;
    }
  };

  const getStatusBadge = (report) => {
    if (report.valid_count >= 3) {
      return (
        <span className={styles.statusBadgeConfirmed}>
          <FaCheck /> Confirmed
        </span>
      );
    } else if (report.total_validations > 0) {
      return (
        <span className={styles.statusBadgePending}>
          <FaInfoCircle /> Under Review
        </span>
      );
    } else {
      return (
        <span className={styles.statusBadgeNew}>
          <FaFolder /> New
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <div className={styles.actionButtons}>
            <button onClick={() => navigate("/reports")} className={styles.backButton}>
              <FaArrowLeft /> Back to Reports
            </button>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <h2>Report Not Found</h2>
          <p>The report you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate("/reports")} className={styles.backButton}>
            <FaArrowLeft /> Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate("/reports")} className={styles.backButton}>
          <FaArrowLeft /> <span>Back to Reports</span>
        </button>
        <div className={styles.headerContent}>
          <h1>
            {report.crime_type.charAt(0).toUpperCase() +
              report.crime_type.slice(1)}{" "}
            Report <span className={styles.idTag}>#{id.substring(0, 8)}</span>
          </h1>
          {getStatusBadge(report)}
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaTag className={styles.cardHeaderIcon} />
              <h2>Incident Details</h2>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <FaMapMarkerAlt className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Location</span>
                  <span className={styles.detailValue}>{report.location}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <FaCalendarAlt className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Date & Time</span>
                  <span className={styles.detailValue}>
                    {format(new Date(report.time), "PPP")} at{" "}
                    {format(new Date(report.time), "p")}
                    <div className={styles.timeAgo}>
                      {formatDistanceToNow(new Date(report.time), {
                        addSuffix: true,
                      })}
                    </div>
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <FaRegClock className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Reported</span>
                  <span className={styles.detailValue}>
                    {format(new Date(report.created_at), "PPP")}
                    <div className={styles.timeAgo}>
                      {formatDistanceToNow(new Date(report.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaUsers className={styles.cardHeaderIcon} />
              <h2>Suspects & Victim Information</h2>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <FaUsers className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Number of Suspects</span>
                  <span className={styles.detailValue}>{report.num_criminals}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  {getGenderIcon(report.victim_gender)}
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Victim Gender</span>
                  <span className={styles.detailValue}>
                    {report.victim_gender.charAt(0).toUpperCase() +
                      report.victim_gender.slice(1)}
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <FaExclamationTriangle className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Armed Suspects</span>
                  <span className={styles.detailValue}>
                    {report.armed === "yes"
                      ? "Yes (Armed)"
                      : report.armed === "no"
                      ? "No (Unarmed)"
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {(report.photos && report.photos.length > 0) ||
          (report.videos && report.videos.length > 0) ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaEye className={styles.cardHeaderIcon} />
                <h2>Evidence</h2>
              </div>

              {report.photos && report.photos.length > 0 && (
                <div className={styles.evidenceSection}>
                  <h3>Photos ({report.photos.length})</h3>
                  <div className={styles.photoGallery}>
                    {report.photos.map((photo, index) => (
                      <div key={`photo-${index}`} className={styles.galleryItem}>
                        <img src={photo.url} alt={`Evidence ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.videos && report.videos.length > 0 && (
                <div className={styles.evidenceSection}>
                  <h3>Videos ({report.videos.length})</h3>
                  <div className={styles.videoGallery}>
                    {report.videos.map((video, index) => (
                      <div key={`video-${index}`} className={styles.galleryItem}>
                        <video controls>
                          <source src={video.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaClipboardCheck className={styles.cardHeaderIcon} />
              <h2>Verification Status</h2>
            </div>

            <div className={styles.verificationStats}>
              <div className={styles.statCard}>
                <FaCheck className={styles.validIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{report.valid_count || 0}</span>
                  <span className={styles.statLabel}>Confirmed</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <FaTimes className={styles.invalidIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{report.invalid_count || 0}</span>
                  <span className={styles.statLabel}>Disputed</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <FaUserCircle className={styles.totalIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    {report.total_validations || 0}
                  </span>
                  <span className={styles.statLabel}>Total Validations</span>
                </div>
              </div>
            </div>

            {report.validations && report.validations.length > 0 ? (
              <div className={styles.validationsList}>
                <h3>Recent Validations</h3>
                {report.validations.slice(0, 3).map((validation, index) => (
                  <div key={`validation-${index}`} className={styles.validationItem}>
                    <div
                      className={`${styles.validationStatus} ${
                        validation.is_valid ? styles.valid : styles.invalid
                      }`}
                    >
                      {validation.is_valid ? <FaCheck /> : <FaTimes />}
                    </div>
                    <div className={styles.validationDetails}>
                      <div className={styles.validationUser}>
                        <FaUserCircle className={styles.userIcon} />
                        <span>{validation.full_name || validation.username}</span>
                      </div>
                      <div className={styles.validationTime}>
                        {formatDistanceToNow(new Date(validation.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                      {validation.comment && (
                        <div className={styles.validationComment}>
                          <FaCommentAlt className={styles.commentIcon} />
                          {validation.comment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noValidations}>No validations yet</p>
            )}
          </div>

          {report.alerts && report.alerts.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FaShieldAlt className={styles.cardHeaderIcon} />
                <h2>Police Response</h2>
              </div>

              <div className={styles.alertsList}>
                {report.alerts.map((alert, index) => (
                  <div
                    key={`alert-${index}`}
                    className={`${styles.alertItem} ${styles[alert.status]}`}
                  >
                    <div className={styles.alertIcon}>
                      <FaShieldAlt />
                    </div>
                    <div className={styles.alertDetails}>
                      <div className={styles.alertHeader}>
                        <span className={styles.alertStatus}>
                          {alert.status.charAt(0).toUpperCase() +
                            alert.status.slice(1)}
                        </span>
                        <span className={styles.alertTime}>
                          {formatDistanceToNow(new Date(alert.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {alert.police_name && (
                        <div className={styles.alertOfficer}>
                          <FaUserCircle className={styles.officerIcon} />
                          <span>{alert.police_name}</span>
                          {alert.badge_number && (
                            <span className={styles.badgeNumber}>
                              #{alert.badge_number}
                            </span>
                          )}
                          {alert.station && (
                            <span className={styles.stationName}>
                              {alert.station} Station
                            </span>
                          )}
                        </div>
                      )}

                      {alert.response_details && (
                        <div className={styles.responseDetails}>
                          {alert.response_details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
