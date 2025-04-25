import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import "./MyReports.css";
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
  FaPlus
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        setLoading(true);

        // Only fetch reports if user is logged in
        if (!user || !token) {
          setReports([]);
          setError("Please log in to view your reports");
          setLoading(false);
          return;
        }

        // Make API request to fetch reports
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

  const getPoliceResponseBadge = (report) => {
    if (!report.alerts || report.alerts.length === 0) {
      return null;
    }

    const latestAlert = report.alerts[0];

    switch (latestAlert.status) {
      case "responded":
        return (
          <span className="response-badge responded">
            <FaShieldAlt /> Police Responded
          </span>
        );
      case "confirmed":
        return (
          <span className="response-badge confirmed">
            <FaCheck /> Confirmed by Police
          </span>
        );
      case "pending":
        return (
          <span className="response-badge pending">
            <FaSpinner /> Awaiting Response
          </span>
        );
      case "closed":
        return (
          <span className="response-badge closed">
            <FaTimes /> Case Closed
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="reports-container loading">
        <FaSpinner className="spinner" />
        <p>Loading your reports...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="reports-container error">
        <FaExclamationTriangle className="error-icon" />
        <h2>Authentication Required</h2>
        <p className="error-message">{error}</p>
        <a href="/login" className="login-button">
          <FaSignInAlt /> Log In
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container error">
        <FaExclamationTriangle className="error-icon" />
        <h2>Something Went Wrong</h2>
        <p className="error-message">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          <FaRedo /> Try Again
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="reports-container empty">
        <h2>My Reports</h2>
        <p className="reports-subtitle">
          Track the status of your crime reports and view responses from authorities
        </p>
        <div className="empty-state">
          <FaExclamationTriangle className="empty-icon" />
          <p>You haven't submitted any reports yet. Start by submitting your first crime report to help keep your community safe.</p>
          <a href="/report" className="report-button">
            <FaPlus /> Submit a Report
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>My Reports</h2>
        <p className="reports-subtitle">
          Track the status of your crime reports and view responses from the
          authorities
        </p>
      </div>

      <div className="reports-list">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <h3>
                {report.crime_type.charAt(0).toUpperCase() +
                  report.crime_type.slice(1)}
              </h3>
              {getStatusBadge(report)}
            </div>

            <div className="report-details">
              <div className="detail-item">
                <FaMapMarkerAlt className="detail-icon" />
                <span>{report.location}</span>
              </div>

              <div className="detail-item">
                <FaCalendarAlt className="detail-icon" />
                <span>
                  {new Date(report.time).toLocaleDateString()} at{" "}
                  {new Date(report.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <small className="time-ago">
                    {formatDistanceToNow(new Date(report.time), {
                      addSuffix: true,
                    })}
                  </small>
                </span>
              </div>

              <div className="detail-item">
                <FaUsers className="detail-icon" />
                <span>
                  {report.num_criminals} suspect
                  {report.num_criminals !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="report-status">
              <div className="validation-status">
                <div className="validation-count">
                  <div className="validation-header">
                    <FaShieldAlt className="validation-icon" />
                    <span className="validation-label">
                      Community Validation
                    </span>
                  </div>
                  <div className="validation-stats">
                    <div className="stat-item valid">
                      <FaCheck className="stat-icon" />
                      <span className="stat-value">
                        {report.valid_count || 0}
                      </span>
                      <span className="stat-label">Valid</span>
                    </div>
                    <div className="divider"></div>
                    <div className="stat-item invalid">
                      <FaTimes className="stat-icon" />
                      <span className="stat-value">
                        {report.invalid_count || 0}
                      </span>
                      <span className="stat-label">Invalid</span>
                    </div>
                  </div>
                </div>
              </div>

              {getPoliceResponseBadge(report)}
            </div>

            {report.photos && report.photos.length > 0 && (
              <div className="media-preview">
                <div className="photo-count">
                  {report.photos.length} photo
                  {report.photos.length !== 1 ? "s" : ""} attached
                </div>
                <div className="thumbnail">
                  <img src={report.photos[0].url} alt="Crime scene evidence" />
                </div>
              </div>
            )}

            <a href={`/report/${report.id}`} className="view-details-button">
              View Full Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyReports;