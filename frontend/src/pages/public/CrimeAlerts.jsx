import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import "./CrimeAlerts.css";

const API_URL = "http://localhost:5000";

const CrimeAlerts = () => {
  const [activeAlert, setActiveAlert] = useState(null);
  const [filter, setFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchAlerts();
  }, [filter, user]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_URL}/api/crime-alerts`;

      // If the user is logged in, prioritize alerts in their area
      if (user && user.address) {
        console.log("User address from context:", user.address);

        // Extract location parts for more flexible matching
        const addressParts = user.address.split("-");
        let searchTerm = user.address;

        if (addressParts.length >= 2) {
          // For Dhaka, use the area name
          if (addressParts[0].trim().toLowerCase() === "dhaka") {
            searchTerm = addressParts[1].trim();
          } else {
            searchTerm = addressParts[0].trim(); // Use district otherwise
          }
        }

        console.log("Using search term for alerts:", searchTerm);
        url = `${API_URL}/api/crime-alerts/location?location=${encodeURIComponent(
          searchTerm
        )}`;
      }

      // Add status filter if not 'all'
      if (filter !== "all") {
        url += url.includes("?") ? `&status=${filter}` : `?status=${filter}`;
      }

      console.log("Fetching alerts from URL:", url);

      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log("API response:", response.data);

      if (response.data && response.data.success) {
        setAlerts(response.data.data);
        console.log("Retrieved alerts:", response.data.data.length);

        if (response.data.data.length > 0) {
          console.log("First alert:", response.data.data[0]);
        }
      } else {
        setError("Failed to load alerts");
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError("Failed to load alerts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDetails = (alert) => {
    setActiveAlert(alert);
  };

  const closeDetails = () => {
    setActiveAlert(null);
  };

  return (
    <div className="crime-alerts-container">
      <header className="alerts-header">
        <h1>Crime Alert Notifications</h1>
        <p className="subtitle">
          Real-time updates on criminal activity in your area
        </p>

        <div className="filter-controls">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Alerts
          </button>
          <button
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active Incidents
          </button>
          <button
            className={`filter-btn ${filter === "resolved" ? "active" : ""}`}
            onClick={() => setFilter("resolved")}
          >
            Resolved Cases
          </button>
        </div>
      </header>

      <div className="alerts-list">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading alerts...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className={`alert-card ${alert.status}`}>
              <div className="alert-header">
                <span className={`alert-type ${alert.type.toLowerCase()}`}>
                  {alert.type}
                </span>
                <span className="alert-time">
                  {formatTime(alert.timestamp || alert.created_at)}
                </span>
                <span className={`alert-status ${alert.status}`}>
                  {alert.status === "active" ? "ACTIVE" : "RESOLVED"}
                </span>
              </div>

              <div className="alert-body">
                <h3 className="alert-location">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {alert.location}
                </h3>
                <p className="alert-description">{alert.description}</p>
              </div>

              <div className="alert-footer">
                <button
                  className="details-btn"
                  onClick={() => openDetails(alert)}
                >
                  View Full Details
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-alerts">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3>No alerts found</h3>
            <p>
              There are currently no {filter === "all" ? "" : filter} crime
              alerts in your area.
            </p>
          </div>
        )}
      </div>

      {/* Detailed Alert Modal */}
      {activeAlert && (
        <div className="alert-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closeDetails}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>

            <div className="modal-header">
              <h2>{activeAlert.type} Incident Details</h2>
              <span className={`modal-status ${activeAlert.status}`}>
                {activeAlert.status === "active"
                  ? "ACTIVE ALERT"
                  : "RESOLVED CASE"}
              </span>
            </div>

            <div className="modal-body">
              <div className="detail-group">
                <h3>Incident Overview</h3>
                <p>
                  <strong>Location:</strong> {activeAlert.location}
                </p>
                <p>
                  <strong>Reported:</strong>{" "}
                  {formatTime(activeAlert.timestamp || activeAlert.created_at)}
                </p>
                <p>
                  <strong>Description:</strong> {activeAlert.description}
                </p>
              </div>

              {activeAlert.details && (
                <>
                  <div className="detail-group">
                    <h3>Details</h3>
                    {activeAlert.details.peopleInvolved && (
                      <p>
                        <strong>People Involved:</strong>{" "}
                        {activeAlert.details.peopleInvolved}
                      </p>
                    )}
                    {activeAlert.details.victimDescription && (
                      <p>
                        <strong>Victim(s):</strong>{" "}
                        {activeAlert.details.victimDescription}
                      </p>
                    )}
                    {activeAlert.details.weapons && (
                      <p>
                        <strong>Weapons:</strong> {activeAlert.details.weapons}
                      </p>
                    )}
                    {activeAlert.details.suspectDescription && (
                      <p>
                        <strong>Suspect Description:</strong>{" "}
                        {activeAlert.details.suspectDescription}
                      </p>
                    )}
                  </div>

                  <div className="detail-group">
                    <h3>Police Response</h3>
                    {activeAlert.details.dangerLevel && (
                      <p>
                        <strong>Danger Level:</strong>{" "}
                        {activeAlert.details.dangerLevel}
                      </p>
                    )}
                    {activeAlert.details.policeResponse && (
                      <p>
                        <strong>Status:</strong>{" "}
                        {activeAlert.details.policeResponse}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="action-btn primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Contact Authorities
              </button>
              <button className="action-btn secondary" onClick={closeDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeAlerts;
