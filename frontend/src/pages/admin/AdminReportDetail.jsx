import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRegClock,
  FaUsers,
  FaExclamationTriangle,
  FaMale,
  FaFemale,
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaEye,
  FaEdit,
  FaBan,
  FaExclamationCircle,
} from "react-icons/fa";
import "./AdminReportDetail.css";

const API_URL = "http://localhost:5000";

const AdminReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [statusOptions] = useState([
    { value: "pending", label: "Pending" },
    { value: "validating", label: "Validating" },
    { value: "investigating", label: "Investigating" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ]);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:5000/api/reports/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.success) {
          setReport(response.data.data);
        } else {
          setError("Failed to load report details");
        }
      } catch (err) {
        console.error("Error fetching report details:", err);
        setError("Error loading report. Please try again later.");

        // For demo purposes, if API fails, use mock data
        setReport({
          id: id,
          crimeId: `CR-2025-${id}`,
          crime_type: "robbery",
          location: "Dhaka, Bangladesh",
          time: new Date().toISOString(),
          created_at: new Date().toISOString(),
          description: "Armed robbery at local convenience store",
          num_criminals: 2,
          victim_gender: "male",
          armed: "yes",
          status: "pending",
          reporter: {
            id: "user123",
            name: "John Doe",
            phone: "+1234567890",
            email: "john@example.com",
          },
          photos: [],
          videos: [],
          valid_count: 3,
          invalid_count: 1,
          police_response: null,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchReportDetails();
    }
  }, [id, token]);

  const getStatusBadge = (report) => {
    const statusClass = report.status.toLowerCase();
    return (
      <span className={`status-badge ${statusClass}`}>{report.status}</span>
    );
  };

  const getGenderIcon = (gender) => {
    if (gender.toLowerCase() === "male") {
      return <FaMale className="detail-icon gender-male" />;
    } else if (gender.toLowerCase() === "female") {
      return <FaFemale className="detail-icon gender-female" />;
    } else {
      return <FaUsers className="detail-icon" />;
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      setStatusUpdateError(null);

      const response = await axios.put(
        `http://localhost:5000/api/reports/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        setReport((prev) => ({ ...prev, status: newStatus }));
      } else {
        setStatusUpdateError("Failed to update report status");
      }
    } catch (err) {
      console.error("Error updating report status:", err);
      setStatusUpdateError("Error updating status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignPolice = async () => {
    // This would open a modal to assign police officers
    alert("Police assignment functionality would open here");
  };

  const handleSendNotification = async () => {
    // This would open a notification form
    alert("Send notification to reporter functionality would open here");
  };

  if (loading) {
    return (
      <div className="admin-report-detail-container loading">
        <div className="loading-spinner"></div>
        <p>Loading report details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="admin-report-detail-container error">
        <FaExclamationCircle className="error-icon" />
        <h2>Report Not Found</h2>
        <p>
          {error ||
            "The report you're looking for doesn't exist or has been removed."}
        </p>
        <button
          onClick={() => navigate("/admin/reports")}
          className="back-button"
        >
          <FaArrowLeft /> Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="admin-report-detail-container">
      <div className="report-detail-header">
        <button
          onClick={() => navigate("/admin/reports")}
          className="back-button"
        >
          <FaArrowLeft /> Back to Reports
        </button>
        <div className="header-content">
          <h1>
            {report.crime_type.charAt(0).toUpperCase() +
              report.crime_type.slice(1)}{" "}
            Report{" "}
            {report.crimeId && (
              <span className="crime-id">#{report.crimeId}</span>
            )}
          </h1>
          {getStatusBadge(report)}
        </div>
      </div>

      <div className="admin-action-panel">
        <div className="status-control">
          <h3>Update Status</h3>
          <div className="status-buttons">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={`status-button ${option.value} ${
                  report.status === option.value ? "active" : ""
                }`}
                onClick={() => handleStatusChange(option.value)}
                disabled={updatingStatus || report.status === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
          {statusUpdateError && (
            <p className="status-update-error">{statusUpdateError}</p>
          )}
        </div>

        <div className="action-buttons">
          <button className="action-button assign" onClick={handleAssignPolice}>
            <FaUsers /> Assign Police
          </button>
          <button
            className="action-button notify"
            onClick={handleSendNotification}
          >
            <FaExclamationCircle /> Notify Reporter
          </button>
        </div>
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

          {report.description && (
            <div className="description-box">
              <h3>Description</h3>
              <p>{report.description}</p>
            </div>
          )}
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

        <div className="report-section">
          <h2>Reporter Information</h2>
          <div className="detail-group">
            {report.reporter && (
              <>
                <div className="detail-item">
                  <div className="detail-content">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{report.reporter.name}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-content">
                    <span className="detail-label">Contact</span>
                    <span className="detail-value">
                      {report.reporter.phone && (
                        <span className="reporter-phone">
                          {report.reporter.phone}
                        </span>
                      )}
                      {report.reporter.email && (
                        <span className="reporter-email">
                          {report.reporter.email}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}
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
          <h2>Community Validation</h2>
          <div className="validation-stats">
            <div className="stat-item valid">
              <FaCheck className="stat-icon" />
              <span className="stat-value">{report.valid_count || 0}</span>
              <span className="stat-label">Valid Reports</span>
            </div>
            <div className="stat-item invalid">
              <FaTimes className="stat-icon" />
              <span className="stat-value">{report.invalid_count || 0}</span>
              <span className="stat-label">Invalid Reports</span>
            </div>
            <div className="stat-summary">
              {report.valid_count > 0 || report.invalid_count > 0 ? (
                <div className="validation-percentage">
                  <div
                    className="percentage-bar"
                    style={{
                      width: `${
                        (report.valid_count /
                          (report.valid_count + report.invalid_count)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              ) : (
                <p className="no-validations">No community validations yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportDetail;
