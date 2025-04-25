import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./ReportDetail.css";
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
        return <FaMars className="gender-icon male" />;
      case "female":
        return <FaVenus className="gender-icon female" />;
      default:
        return <FaGenderless className="gender-icon other" />;
    }
  };

  const getStatusBadge = (report) => {
    if (report.valid_count >= 3) {
      return (
        <span className="status-badge confirmed">
          <FaCheck /> Confirmed
        </span>
      );
    } else if (report.total_validations > 0) {
      return (
        <span className="status-badge pending">
          <FaInfoCircle /> Under Review
        </span>
      );
    } else {
      return (
        <span className="status-badge new">
          <FaFolder /> New
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="report-detail-container loading">
        <FaSpinner className="spinner" />
        <p>Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-detail-container error">
        <FaExclamationTriangle className="error-icon" />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <div className="action-buttons">
          <button onClick={() => navigate("/reports")} className="back-button">
            <FaArrowLeft /> Back to Reports
          </button>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="report-detail-container error">
        <FaExclamationTriangle className="error-icon" />
        <h2>Report Not Found</h2>
        <p>The report you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/reports")} className="back-button">
          <FaArrowLeft /> Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="report-detail-container">
      <div className="report-detail-header">
        <button onClick={() => navigate("/reports")} className="back-button">
          <FaArrowLeft /> Back to Reports
        </button>
        <h1>
          {report.crime_type.charAt(0).toUpperCase() +
            report.crime_type.slice(1)}{" "}
          Report
        </h1>
        {getStatusBadge(report)}
      </div>

      <div className="report-detail-card">
        <div className="report-section">
          <h2>Incident Details</h2>

          <div className="detail-group">
            <div className="detail-item">
              <FaMapMarkerAlt className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Location</span>
                <span className="detail-value">{report.location}</span>
              </div>
            </div>

            <div className="detail-item">
              <FaCalendarAlt className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Date & Time</span>
                <span className="detail-value">
                  {format(new Date(report.time), "PPP")} at{" "}
                  {format(new Date(report.time), "p")}
                  <small className="time-ago">
                    (
                    {formatDistanceToNow(new Date(report.time), {
                      addSuffix: true,
                    })}
                    )
                  </small>
                </span>
              </div>
            </div>

            <div className="detail-item">
              <FaRegClock className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Reported</span>
                <span className="detail-value">
                  {format(new Date(report.created_at), "PPP")}
                  <small className="time-ago">
                    (
                    {formatDistanceToNow(new Date(report.created_at), {
                      addSuffix: true,
                    })}
                    )
                  </small>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2>Suspects & Victim Information</h2>

          <div className="detail-group">
            <div className="detail-item">
              <FaUsers className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Number of Suspects</span>
                <span className="detail-value">{report.num_criminals}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                {getGenderIcon(report.victim_gender)}
              </div>
              <div className="detail-content">
                <span className="detail-label">Victim Gender</span>
                <span className="detail-value">
                  {report.victim_gender.charAt(0).toUpperCase() +
                    report.victim_gender.slice(1)}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <FaExclamationTriangle className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Armed Suspects</span>
                <span className="detail-value">
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
          <div className="report-section">
            <h2>Evidence</h2>

            {report.photos && report.photos.length > 0 && (
              <div className="evidence-group">
                <h3>Photos ({report.photos.length})</h3>
                <div className="photo-gallery">
                  {report.photos.map((photo, index) => (
                    <div key={`photo-${index}`} className="gallery-item">
                      <img src={photo.url} alt={`Evidence ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.videos && report.videos.length > 0 && (
              <div className="evidence-group">
                <h3>Videos ({report.videos.length})</h3>
                <div className="video-gallery">
                  {report.videos.map((video, index) => (
                    <div key={`video-${index}`} className="gallery-item">
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

        <div className="report-section">
          <h2>Verification Status</h2>

          <div className="verification-stats">
            <div className="verification-stat">
              <FaCheck className="valid-icon" />
              <div className="stat-content">
                <span className="stat-value">{report.valid_count || 0}</span>
                <span className="stat-label">Confirmed</span>
              </div>
            </div>

            <div className="verification-stat">
              <FaTimes className="invalid-icon" />
              <div className="stat-content">
                <span className="stat-value">{report.invalid_count || 0}</span>
                <span className="stat-label">Disputed</span>
              </div>
            </div>

            <div className="verification-stat">
              <FaUserCircle className="total-icon" />
              <div className="stat-content">
                <span className="stat-value">
                  {report.total_validations || 0}
                </span>
                <span className="stat-label">Total Validations</span>
              </div>
            </div>
          </div>

          {report.validations && report.validations.length > 0 ? (
            <div className="validations-list">
              <h3>Recent Validations</h3>
              {report.validations.slice(0, 3).map((validation, index) => (
                <div key={`validation-${index}`} className="validation-item">
                  <div
                    className={`validation-status ${
                      validation.is_valid ? "valid" : "invalid"
                    }`}
                  >
                    {validation.is_valid ? <FaCheck /> : <FaTimes />}
                  </div>
                  <div className="validation-details">
                    <div className="validation-user">
                      <FaUserCircle className="user-icon" />
                      <span>{validation.full_name || validation.username}</span>
                    </div>
                    <div className="validation-time">
                      {formatDistanceToNow(new Date(validation.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                    {validation.comment && (
                      <div className="validation-comment">
                        {validation.comment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-validations">No validations yet</p>
          )}
        </div>

        {report.alerts && report.alerts.length > 0 && (
          <div className="report-section">
            <h2>Police Response</h2>

            <div className="alerts-list">
              {report.alerts.map((alert, index) => (
                <div
                  key={`alert-${index}`}
                  className={`alert-item ${alert.status}`}
                >
                  <div className="alert-icon">
                    <FaShieldAlt />
                  </div>
                  <div className="alert-details">
                    <div className="alert-header">
                      <span className="alert-status">
                        {alert.status.charAt(0).toUpperCase() +
                          alert.status.slice(1)}
                      </span>
                      <span className="alert-time">
                        {formatDistanceToNow(new Date(alert.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {alert.police_name && (
                      <div className="alert-officer">
                        <FaUserCircle className="officer-icon" />
                        <span>{alert.police_name}</span>
                        {alert.badge_number && (
                          <span className="badge-number">
                            #{alert.badge_number}
                          </span>
                        )}
                        {alert.station && (
                          <span className="station-name">
                            {alert.station} Station
                          </span>
                        )}
                      </div>
                    )}

                    {alert.response_details && (
                      <div className="response-details">
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
  );
};

export default ReportDetail;
