import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import PoliceStationFinder from "../../components/PoliceStationFinder";
import {
  FaPlus,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./AdminCrimeAlerts.css";

const API_URL = "http://localhost:5000";
const ALERT_VISIBILITY_HOURS = 12; // Alerts will be visible for 12 hours

const AdminCrimeAlerts = () => {
  const [activeAlert, setActiveAlert] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [hasActiveTimers, setHasActiveTimers] = useState(false);
  const [showPoliceStationFinder, setShowPoliceStationFinder] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: "robbery",
    location: "",
    description: "",
    status: "active",
    details: {
      peopleInvolved: "",
      victimDescription: "",
      suspectDescription: "",
      weapons: "",
    },
  });
  const [alertTypes] = useState([
    "robbery",
    "assault",
    "theft",
    "kidnapping",
    "violence",
    "arson",
    "vandalism",
    "suspicious activity",
    "other",
  ]);
  const { user, token } = useAuth();

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  // Update countdown timers every second
  useEffect(() => {
    if (alerts.length === 0) return;

    // Initialize countdowns
    const initialCountdowns = {};
    let anyActiveTimer = false;

    alerts.forEach((alert) => {
      const createdTime = new Date(alert.created_at || alert.timestamp);
      const expiryTime = new Date(
        createdTime.getTime() + ALERT_VISIBILITY_HOURS * 60 * 60 * 1000
      );
      const timeRemaining = calculateTimeRemaining(expiryTime);
      initialCountdowns[alert.id] = timeRemaining;

      if (timeRemaining.total > 0) {
        anyActiveTimer = true;
      }
    });

    setCountdowns(initialCountdowns);
    setHasActiveTimers(anyActiveTimer);

    // Sync with navbar via window property
    window.hasActiveAlerts = anyActiveTimer;
    const event = new CustomEvent("alertsStatusChanged", {
      detail: { hasActiveAlerts: anyActiveTimer },
    });
    window.dispatchEvent(event);

    // Update countdowns every second
    const interval = setInterval(() => {
      let stillActive = false;

      setCountdowns((prevCountdowns) => {
        const newCountdowns = { ...prevCountdowns };

        alerts.forEach((alert) => {
          const createdTime = new Date(alert.created_at || alert.timestamp);
          const expiryTime = new Date(
            createdTime.getTime() + ALERT_VISIBILITY_HOURS * 60 * 60 * 1000
          );
          const timeRemaining = calculateTimeRemaining(expiryTime);
          newCountdowns[alert.id] = timeRemaining;

          if (timeRemaining.total > 0) {
            stillActive = true;
          }
        });

        return newCountdowns;
      });

      setHasActiveTimers(stillActive);

      // Sync with navbar
      window.hasActiveAlerts = stillActive;
      const statusEvent = new CustomEvent("alertsStatusChanged", {
        detail: { hasActiveAlerts: stillActive },
      });
      window.dispatchEvent(statusEvent);
    }, 1000);

    return () => clearInterval(interval);
  }, [alerts]);

  const calculateTimeRemaining = (expiryTime) => {
    const now = new Date();
    const total = expiryTime - now;

    if (total <= 0) {
      return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    // Calculate hours, minutes, seconds
    const hours = Math.floor(total / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);

    return { total, hours, minutes, seconds };
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all alerts (not just for user's location) for admin
      const alertsResponse = await axios.get(`${API_URL}/crime-alerts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (alertsResponse.data && alertsResponse.data.success) {
        const allAlerts = alertsResponse.data.data;

        // Sort by created date (newest first)
        allAlerts.sort(
          (a, b) =>
            new Date(b.created_at || b.timestamp) -
            new Date(a.created_at || a.timestamp)
        );

        setAlerts(allAlerts);
      } else {
        setError("Failed to load alerts");
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError("Failed to load alerts. Please try again later.");

      // Use mock data for demo if API fails
      const mockAlerts = [
        {
          id: "alert1",
          type: "robbery",
          location: "Dhanmondi, Dhaka",
          description: "Armed robbery at convenience store",
          status: "active",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: {
            peopleInvolved: "2 suspects",
            victimDescription: "Store clerk",
            suspectDescription: "Masked men in dark clothing",
            weapons: "Handgun",
          },
          valid_count: 5,
          invalid_count: 1,
        },
        {
          id: "alert2",
          type: "assault",
          location: "Gulshan, Dhaka",
          description: "Physical altercation outside restaurant",
          status: "active",
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          details: {
            peopleInvolved: "3-4 people",
            victimDescription: "Male, approximately 30 years old",
            suspectDescription: "Group of young men",
            weapons: "None reported",
          },
          valid_count: 3,
          invalid_count: 0,
        },
        {
          id: "alert3",
          type: "theft",
          location: "Mirpur, Dhaka",
          description: "Motorcycle theft in residential area",
          status: "resolved",
          created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
          details: {
            peopleInvolved: "1 suspect",
            victimDescription: "Motorcycle owner",
            suspectDescription: "Unknown",
            weapons: "None",
          },
          valid_count: 7,
          invalid_count: 2,
        },
      ];

      setAlerts(mockAlerts);
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

  const formatCountdown = (alertId) => {
    const countdown = countdowns[alertId];
    if (!countdown || countdown.total <= 0) {
      return "Expired";
    }

    return `${countdown.hours.toString().padStart(2, "0")}:${countdown.minutes
      .toString()
      .padStart(2, "0")}:${countdown.seconds.toString().padStart(2, "0")}`;
  };

  const openDetails = (alert) => {
    setActiveAlert(alert);
  };

  const closeDetails = () => {
    setActiveAlert(null);
  };

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/crime-alerts/${alertId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setAlerts(
        alerts.map((alert) =>
          alert.id === alertId ? { ...alert, status: newStatus } : alert
        )
      );

      // Update active alert if it's open
      if (activeAlert && activeAlert.id === alertId) {
        setActiveAlert({ ...activeAlert, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating alert status:", error);
      alert("Failed to update alert status. Please try again.");
    }
  };

  const deleteAlert = async (alertId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this alert? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/crime-alerts/${alertId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove from local state
      setAlerts(alerts.filter((alert) => alert.id !== alertId));

      // Close detail view if it's showing the deleted alert
      if (activeAlert && activeAlert.id === alertId) {
        setActiveAlert(null);
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      alert("Failed to delete alert. Please try again.");
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.location || !newAlert.description) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/crime-alerts`, newAlert, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.success) {
        // Add new alert to the list
        const createdAlert = response.data.data;
        setAlerts([createdAlert, ...alerts]);

        // Reset form and close modal
        setNewAlert({
          type: "robbery",
          location: "",
          description: "",
          status: "active",
          details: {
            peopleInvolved: "",
            victimDescription: "",
            suspectDescription: "",
            weapons: "",
          },
        });
        setShowCreateAlert(false);
      } else {
        alert("Failed to create alert. Please try again.");
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Failed to create alert. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAlert({ ...newAlert, [name]: value });
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setNewAlert({
      ...newAlert,
      details: {
        ...newAlert.details,
        [name]: value,
      },
    });
  };

  const openPoliceStationFinder = (location) => {
    setSelectedLocation(location);
    setShowPoliceStationFinder(true);
  };

  const closePoliceStationFinder = () => {
    setShowPoliceStationFinder(false);
  };

  return (
    <div className="admin-crime-alerts-container">
      <header className="alerts-header">
        <div className="header-content">
          <h1>Crime Alert Management</h1>
          <p className="subtitle">
            Manage and monitor criminal activity alerts in all areas
          </p>
        </div>
        <button
          className="create-alert-btn"
          onClick={() => setShowCreateAlert(true)}
        >
          <FaPlus /> Create New Alert
        </button>
      </header>

      <div className="alerts-filter">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select>
            <option value="all">All Alerts</option>
            <option value="active">Active Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by Type:</label>
          <select>
            <option value="all">All Types</option>
            {alertTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="alerts-list">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading alerts...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className={`alert-card ${alert.status}`}>
              <div className="alert-header">
                <span className={`alert-type ${alert.type.toLowerCase()}`}>
                  {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                </span>
                <span className="alert-time">
                  {formatTime(alert.timestamp || alert.created_at)}
                </span>
                <span className={`alert-status ${alert.status}`}>
                  {alert.status === "active" ? "ACTIVE" : "RESOLVED"}
                </span>
              </div>

              <div className="alert-body">
                <div className="alert-location">
                  <FaMapMarkerAlt className="location-icon" />
                  {alert.location}
                </div>
                <p className="alert-description">{alert.description}</p>
              </div>

              <div className="alert-metadata">
                <div className="validation-info">
                  <div className="validation-count">
                    <span className="valid">
                      <FaCheck /> {alert.valid_count || 0}
                    </span>
                    <span className="invalid">
                      <FaTimes /> {alert.invalid_count || 0}
                    </span>
                  </div>
                </div>

                {alert.status === "active" && (
                  <div className="countdown-timer">
                    <span className="timer-label">Expires in: </span>
                    <span className="timer-value">
                      {formatCountdown(alert.id)}
                    </span>
                  </div>
                )}
              </div>

              <div className="admin-actions">
                <div className="status-actions">
                  {alert.status === "active" ? (
                    <button
                      className="status-btn resolve"
                      onClick={() => handleStatusChange(alert.id, "resolved")}
                    >
                      <FaCheck /> Mark as Resolved
                    </button>
                  ) : (
                    <button
                      className="status-btn reactivate"
                      onClick={() => handleStatusChange(alert.id, "active")}
                    >
                      Reactivate Alert
                    </button>
                  )}
                </div>
                <div className="alert-actions">
                  <button
                    className="action-btn view"
                    onClick={() => openDetails(alert)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
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
            <p>There are currently no crime alerts in the system.</p>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
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
              <h2>
                {activeAlert.type.charAt(0).toUpperCase() +
                  activeAlert.type.slice(1)}{" "}
                Incident Details
              </h2>
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
              )}

              <div className="detail-group">
                <h3>Community Validation</h3>
                <div className="validation-stats">
                  <p>
                    <strong>Valid Reports:</strong>{" "}
                    {activeAlert.valid_count || 0}
                  </p>
                  <p>
                    <strong>Invalid Reports:</strong>{" "}
                    {activeAlert.invalid_count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="validation-buttons">
                <button
                  className="action-btn locate-station"
                  onClick={() => openPoliceStationFinder(activeAlert.location)}
                >
                  <FaMapMarkerAlt /> Find Nearest Police Stations
                </button>
              </div>

              <div className="admin-buttons">
                {activeAlert.status === "active" ? (
                  <button
                    className="action-btn resolve"
                    onClick={() =>
                      handleStatusChange(activeAlert.id, "resolved")
                    }
                  >
                    <FaCheck /> Mark as Resolved
                  </button>
                ) : (
                  <button
                    className="action-btn reactivate"
                    onClick={() => handleStatusChange(activeAlert.id, "active")}
                  >
                    Reactivate Alert
                  </button>
                )}
                <button
                  className="action-btn delete-alert"
                  onClick={() => {
                    deleteAlert(activeAlert.id);
                  }}
                >
                  <FaTrash /> Delete Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="alert-modal">
          <div className="modal-content create-alert-modal">
            <button
              className="close-modal"
              onClick={() => setShowCreateAlert(false)}
            >
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
              <h2>Create New Crime Alert</h2>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="type">Alert Type:</label>
                <select
                  id="type"
                  name="type"
                  value={newAlert.type}
                  onChange={handleInputChange}
                >
                  {alertTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newAlert.location}
                  onChange={handleInputChange}
                  placeholder="Enter specific location"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={newAlert.description}
                  onChange={handleInputChange}
                  placeholder="Describe the incident"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-section">
                <h3>Additional Details</h3>

                <div className="form-group">
                  <label htmlFor="peopleInvolved">People Involved:</label>
                  <input
                    type="text"
                    id="peopleInvolved"
                    name="peopleInvolved"
                    value={newAlert.details.peopleInvolved}
                    onChange={handleDetailChange}
                    placeholder="Number and description of people involved"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="victimDescription">Victim Description:</label>
                  <input
                    type="text"
                    id="victimDescription"
                    name="victimDescription"
                    value={newAlert.details.victimDescription}
                    onChange={handleDetailChange}
                    placeholder="Description of victim(s)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="suspectDescription">
                    Suspect Description:
                  </label>
                  <input
                    type="text"
                    id="suspectDescription"
                    name="suspectDescription"
                    value={newAlert.details.suspectDescription}
                    onChange={handleDetailChange}
                    placeholder="Description of suspect(s)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weapons">Weapons:</label>
                  <input
                    type="text"
                    id="weapons"
                    name="weapons"
                    value={newAlert.details.weapons}
                    onChange={handleDetailChange}
                    placeholder="Any weapons involved"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="action-btn cancel"
                onClick={() => setShowCreateAlert(false)}
              >
                Cancel
              </button>
              <button className="action-btn create" onClick={handleCreateAlert}>
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Police Station Finder Modal */}
      {showPoliceStationFinder && (
        <div className="police-station-finder-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closePoliceStationFinder}>
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
            <h2>Nearby Police Stations</h2>
            <PoliceStationFinder
              location={selectedLocation}
              onClose={closePoliceStationFinder}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCrimeAlerts;
