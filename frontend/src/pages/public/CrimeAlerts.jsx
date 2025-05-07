import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import PoliceStationFinder from "../../components/PoliceStationFinder";
import styles from "./CrimeAlerts.module.css";

const API_URL = "http://localhost:5000";
const ALERT_VISIBILITY_HOURS = 12; // Alerts will be visible for 12 hours

const CrimeAlerts = () => {
  const [activeAlert, setActiveAlert] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [hasActiveTimers, setHasActiveTimers] = useState(false);
  const [validationStatus, setValidationStatus] = useState({});
  const [showPoliceStationFinder, setShowPoliceStationFinder] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [validationCounts, setValidationCounts] = useState({});
  const { user, token } = useAuth();

  // Fetch user profile when component mounts
  useEffect(() => {
    fetchUserProfile();
    fetchAllReports(); // Auto-fetch reports when component mounts
  }, [user, token]);

  // Apply address-based filtering whenever userProfile or allReports change
  useEffect(() => {
    if (userProfile && allReports.length > 0) {
      console.log("Auto-filtering reports based on user profile change");
      filterReportsByUserAddress(allReports);
    }
  }, [userProfile, allReports]);

  // Fetch user profile to get the address
  const fetchUserProfile = async () => {
    if (!user || !token) return;

    try {
      const response = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.success) {
        setUserProfile(response.data.user);
        console.log("User profile fetched:", response.data.user);
        console.log("User address:", response.data.user.address);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Fetch all reports
  const fetchAllReports = async () => {
    try {
      console.log("Fetching all reports...");
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/reports`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      console.log("Reports API response:", response.data);

      if (response.data && response.data.success) {
        console.log(`Retrieved ${response.data.data.length} reports from API`);

        // Check if reports have reporter_address field
        if (response.data.data.length > 0) {
          console.log("Sample report data:", {
            id: response.data.data[0].id,
            location: response.data.data[0].location,
            reporter_address:
              response.data.data[0].reporter_address || "Not set",
          });
        }

        // Store all reports in state
        setAllReports(response.data.data);
        setDataInitialized(true);

        // If userProfile is already available, filter reports now
        // Otherwise, the useEffect will handle filtering when userProfile changes
        if (userProfile) {
          filterReportsByUserAddress(response.data.data);
        }
      } else {
        setError("Failed to load reports");
        console.error("API returned error:", response.data);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      setError("Failed to load reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on user address
  const filterReportsByUserAddress = async (reports) => {
    if (!reports || reports.length === 0) {
      console.log("No reports to filter");
      setAlerts([]);
      return;
    }

    if (!user || !userProfile || !userProfile.address) {
      console.log(
        "No user profile or address to filter with, showing all reports"
      );
      setAlerts(reports);
      return;
    }

    const userAddress = userProfile.address;
    console.log(
      `Filtering ${reports.length} reports with user address: "${userAddress}"`
    );

    // Check if reports have reporter_address field
    const hasReporterAddress = reports.some(
      (report) => report.reporter_address
    );
    if (!hasReporterAddress) {
      console.warn(
        "Warning: Reports don't have reporter_address field. Check backend implementation."
      );
    }

    // Filter reports where reporter_address matches user's address
    const filteredReports = reports.filter((report) => {
      if (!report.reporter_address) {
        console.log(`Report ID: ${report.id} has no reporter_address`);
        return false;
      }

      const isMatch = report.reporter_address === userAddress;
      console.log(
        `Report ID: ${report.id}, Location: ${report.location}, Reporter address: "${report.reporter_address}", Match with "${userAddress}": ${isMatch}`
      );
      return isMatch;
    });

    console.log(
      `Filtered reports: ${filteredReports.length} out of ${reports.length} total reports`
    );

    if (filteredReports.length > 0) {
      console.log(
        "Matched reports:",
        filteredReports.map((a) => a.id).join(", ")
      );
    } else {
      console.log(`No reports match user address: "${userAddress}"`);
    }

    // Fetch validation counts for each alert
    const initialCounts = {};
    for (const alert of filteredReports) {
      try {
        console.log(`Fetching validations for alert ${alert.id}`);

        const validationResponse = await axios.get(
          `${API_URL}/api/reports/${alert.id}/validations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log(
          `Validation data for alert ${alert.id}:`,
          validationResponse.data
        );

        if (validationResponse.data && validationResponse.data.data) {
          const { valid_count, invalid_count, total_validations } =
            validationResponse.data.data;
          initialCounts[alert.id] = {
            confirmed: valid_count || 0,
            disputed: invalid_count || 0,
            total: total_validations || 0,
          };
          console.log(`Counts for alert ${alert.id}:`, initialCounts[alert.id]);
        }
      } catch (validationErr) {
        console.error(
          `Failed to fetch validations for alert ${alert.id}:`,
          validationErr
        );
        if (validationErr.response) {
          console.error("Response status:", validationErr.response.status);
          console.error("Response data:", validationErr.response.data);
        }
        initialCounts[alert.id] = { confirmed: 0, disputed: 0, total: 0 };
      }
    }

    console.log("All validation counts:", initialCounts);
    setValidationCounts(initialCounts);

    // Set the filtered reports as alerts
    setAlerts(filteredReports);

    // Initialize validation status for each alert
    const initialValidationStatus = {};
    filteredReports.forEach((alert) => {
      initialValidationStatus[alert.id] = {
        userValidated: false,
        userMarkedFalse: false,
      };
    });
    setValidationStatus(initialValidationStatus);
  };

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
    const timer = setInterval(() => {
      setCountdowns((prevCountdowns) => {
        const updatedCountdowns = {};
        let allExpired = true;
        let anyTimerActive = false;

        alerts.forEach((alert) => {
          const createdTime = new Date(alert.created_at || alert.timestamp);
          const expiryTime = new Date(
            createdTime.getTime() + ALERT_VISIBILITY_HOURS * 60 * 60 * 1000
          );
          const remaining = calculateTimeRemaining(expiryTime);

          if (remaining.total > 0) {
            allExpired = false;
            anyTimerActive = true;
          }

          updatedCountdowns[alert.id] = remaining;
        });

        // Update active timers state
        setHasActiveTimers(anyTimerActive);

        // Sync with navbar via window property
        window.hasActiveAlerts = anyTimerActive;
        const event = new CustomEvent("alertsStatusChanged", {
          detail: { hasActiveAlerts: anyTimerActive },
        });
        window.dispatchEvent(event);

        // Removed auto-refresh on expiry
        // if (alerts.length > 0 && allExpired) {
        //   fetchAllReports();
        // }

        return updatedCountdowns;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alerts]);

  const calculateTimeRemaining = (expiryTime) => {
    const total = expiryTime - new Date();

    if (total <= 0) {
      return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    return { total, hours, minutes, seconds };
  };

  const formatCountdown = (timeObj) => {
    if (timeObj.total <= 0) {
      return "Expired";
    }

    return `${timeObj.hours.toString().padStart(2, "0")}:${timeObj.minutes
      .toString()
      .padStart(2, "0")}:${timeObj.seconds.toString().padStart(2, "0")}`;
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

  const handleValidation = async (alertId, isValid) => {
    if (!user || !token) {
      alert("Please log in to validate this alert");
      return;
    }

    try {
      // Update UI immediately for better user experience
      setValidationStatus((prev) => ({
        ...prev,
        [alertId]: {
          userValidated: isValid,
          userMarkedFalse: !isValid,
        },
      }));

      console.log(
        `Attempting to validate alert ${alertId} with value: ${isValid}`
      );

      // Send validation to server - using /api/reports/ endpoint structure
      const response = await axios.post(
        `${API_URL}/api/reports/${alertId}/validate`,
        {
          isValid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Validation response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Validation failed");
      }

      // After successful validation, fetch updated validation counts
      const validationResponse = await axios.get(
        `${API_URL}/api/reports/${alertId}/validations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Retrieved validation counts:", validationResponse.data);

      // Update the validation counts state
      if (validationResponse.data && validationResponse.data.data) {
        const { valid_count, invalid_count, total_validations } =
          validationResponse.data.data;
        setValidationCounts((prev) => ({
          ...prev,
          [alertId]: {
            confirmed: valid_count || 0,
            disputed: invalid_count || 0,
            total: total_validations || 0,
          },
        }));
      }
    } catch (err) {
      console.error("Validation error:", err);
      if (err.response) {
        console.error(
          "Error response:",
          err.response.status,
          err.response.data
        );
      }

      // Revert UI state on error
      setValidationStatus((prev) => ({
        ...prev,
        [alertId]: {
          userValidated: false,
          userMarkedFalse: false,
        },
      }));

      alert(err.message || "Failed to validate alert. Please try again.");
    }
  };

  const openPoliceStationFinder = (location) => {
    setSelectedLocation(location);
    setShowPoliceStationFinder(true);
  };

  const closePoliceStationFinder = () => {
    setShowPoliceStationFinder(false);
  };

  return (
    <>
      <div className={styles["crime-alerts-container"]}>
        <header className={styles["alerts-header"]}>
          <h1>Crime Alert Notifications</h1>
          <p className={styles.subtitle}>
            Real-time updates on criminal activity in your area
          </p>

          {userProfile && (
            <div className={styles["address-display"]}>
              Showing reports for address:{" "}
              <strong>{userProfile.address || "Not set"}</strong>
            </div>
          )}
        </header>

        <div className={styles["alerts-list"]}>
          {loading ? (
            <div className={styles["loading-container"]}>
              <div className={styles["loading-spinner"]}></div>
              <p>Loading reports...</p>
            </div>
          ) : error ? (
            <div className={styles["error-container"]}>
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
          ) : !dataInitialized ? (
            <div className={styles["no-alerts"]}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
              <h3>Reports Not Loaded</h3>
              <p>
                Click the "Refresh Reports" button above to load crime reports
                for your area.
              </p>
            </div>
          ) : alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`${styles["alert-card"]} ${
                  styles[alert.status || "active"]
                }`}
              >
                <div className={styles["alert-header"]}>
                  <span
                    className={`${styles["alert-type"]} ${
                      styles[
                        (
                          alert.type ||
                          alert.crime_type ||
                          "other"
                        ).toLowerCase()
                      ]
                    }`}
                  >
                    {alert.type || alert.crime_type || "Report"}
                  </span>
                  <span className={styles["alert-time"]}>
                    {formatTime(alert.timestamp || alert.created_at)}
                  </span>
                  <span
                    className={`${styles["alert-status"]} ${
                      styles[alert.status || "active"]
                    }`}
                  >
                    {alert.status === "active"
                      ? "ACTIVE"
                      : alert.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>

                <div className={styles["alert-body"]}>
                  <h3 className={styles["alert-location"]}>
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
                  <p className={styles["alert-description"]}>
                    {alert.description}
                  </p>
                  {countdowns[alert.id] && (
                    <div className={styles["alert-countdown"]}>
                      <span className={styles["countdown-label"]}>
                        Expires in:
                      </span>
                      <span className={styles["countdown-timer"]}>
                        {formatCountdown(countdowns[alert.id])}
                      </span>
                    </div>
                  )}

                  {/* Add Validation Status Display */}
                  {validationCounts[alert.id] && (
                    <div className={styles["validation-stats"]}>
                      <div className={styles["validation-stat"]}>
                        <span className={styles["validation-label"]}>
                          Confirmed:
                        </span>
                        <span className={styles["validation-value"]}>
                          {validationCounts[alert.id]?.confirmed || 0}
                        </span>
                      </div>
                      <div className={styles["validation-stat"]}>
                        <span className={styles["validation-label"]}>
                          Disputed:
                        </span>
                        <span className={styles["validation-value"]}>
                          {validationCounts[alert.id]?.disputed || 0}
                        </span>
                      </div>
                      <div className={styles["validation-stat"]}>
                        <span className={styles["validation-label"]}>
                          Total:
                        </span>
                        <span className={styles["validation-value"]}>
                          {validationCounts[alert.id]?.total || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles["alert-footer"]}>
                  <div className={styles["validation-buttons"]}>
                    {!validationStatus[alert.id]?.userMarkedFalse && (
                      <button
                        className={`${styles["validate-btn"]} ${
                          validationStatus[alert.id]?.userValidated
                            ? styles.active
                            : ""
                        }`}
                        onClick={() => handleValidation(alert.id, true)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                        {validationStatus[alert.id]?.userValidated
                          ? "Validated ✓"
                          : "Validate"}
                      </button>
                    )}
                    {!validationStatus[alert.id]?.userValidated && (
                      <button
                        className={`${styles["false-report-btn"]} ${
                          validationStatus[alert.id]?.userMarkedFalse
                            ? styles.active
                            : ""
                        }`}
                        onClick={() => handleValidation(alert.id, false)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                        {validationStatus[alert.id]?.userMarkedFalse
                          ? "Marked False ✗"
                          : "False Report"}
                      </button>
                    )}
                  </div>
                  <button
                    className={styles["details-btn"]}
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
            <div className={styles["no-alerts"]}>
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
              <h3>No Reports Found</h3>
              {userProfile && userProfile.address ? (
                <p>
                  There are currently no crime reports matching your address:{" "}
                  <strong>{userProfile.address}</strong>
                </p>
              ) : (
                <p>There are currently no crime reports in your area.</p>
              )}
            </div>
          )}
        </div>

        {/* Detailed Alert Modal */}
        {activeAlert && (
          <div className={styles["alert-modal"]}>
            <div className={styles["modal-content"]}>
              <button className={styles["close-modal"]} onClick={closeDetails}>
                ×
              </button>

              <div className={styles["modal-header"]}>
                <div className={styles["modal-title"]}>
                  <h2>
                    {activeAlert.type || activeAlert.crime_type || "Incident"}{" "}
                    Details
                  </h2>
                  <span
                    className={`${styles["modal-status"]} ${
                      styles[activeAlert.status || "active"]
                    }`}
                  >
                    {activeAlert.status === "active"
                      ? "ACTIVE ALERT"
                      : activeAlert.status === "resolved"
                      ? "RESOLVED CASE"
                      : "PENDING REVIEW"}
                  </span>
                </div>
                <div className={styles["alert-timer"]}>
                  {countdowns[activeAlert.id] && (
                    <div className={styles["alert-countdown"]}>
                      <span className={styles["countdown-label"]}>
                        Alert expires in:
                      </span>
                      <span className={styles["countdown-timer"]}>
                        {formatCountdown(countdowns[activeAlert.id])}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles["modal-body"]}>
                <div className={styles["incident-overview"]}>
                  <h3>Incident Overview</h3>
                  <div className={styles["detail-grid"]}>
                    <div className={styles["detail-item"]}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <div>
                        <strong>Location:</strong>
                        <p>{activeAlert.location}</p>
                      </div>
                    </div>
                    <div className={styles["detail-item"]}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <div>
                        <strong>Time:</strong>
                        <p>
                          {formatTime(
                            activeAlert.timestamp || activeAlert.created_at
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles["detail-grid"]}>
                    <div className={styles["detail-item"]}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                        <line x1="4" y1="22" x2="4" y2="15"></line>
                      </svg>
                      <div>
                        <strong>Crime Type:</strong>
                        <p>
                          {activeAlert.type ||
                            activeAlert.crime_type ||
                            "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className={styles["detail-item"]}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <div>
                        <strong>Description:</strong>
                        <p>{activeAlert.description}</p>
                      </div>
                    </div>
                  </div>

                  {activeAlert.reporter_address && (
                    <div className={styles["detail-grid"]}>
                      <div className={styles["detail-item"]}>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <div>
                          <strong>Reporter Address:</strong>
                          <p>{activeAlert.reporter_address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {activeAlert.details && (
                  <>
                    <div className={styles["detail-group"]}>
                      <h3>Details</h3>
                      <div className={styles["detail-grid"]}>
                        {activeAlert.details.peopleInvolved && (
                          <div className={styles["detail-item"]}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <div>
                              <strong>People Involved:</strong>
                              <p>{activeAlert.details.peopleInvolved}</p>
                            </div>
                          </div>
                        )}
                        {activeAlert.details.victimDescription && (
                          <div className={styles["detail-item"]}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <div>
                              <strong>Victim(s):</strong>
                              <p>{activeAlert.details.victimDescription}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles["detail-grid"]}>
                        {activeAlert.details.weapons && (
                          <div className={styles["detail-item"]}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                            </svg>
                            <div>
                              <strong>Weapons:</strong>
                              <p>{activeAlert.details.weapons}</p>
                            </div>
                          </div>
                        )}
                        {activeAlert.details.suspectDescription && (
                          <div className={styles["detail-item"]}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                              <line x1="12" y1="11" x2="12" y2="17"></line>
                              <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                            <div>
                              <strong>Suspect Description:</strong>
                              <p>{activeAlert.details.suspectDescription}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles["detail-group"]}>
                      <h3>Police Response</h3>
                      <div className={styles["detail-grid"]}>
                        {activeAlert.details.dangerLevel && (
                          <div className={styles["detail-item"]}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                              <line x1="12" y1="9" x2="12" y2="13"></line>
                              <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <div>
                              <strong>Danger Level:</strong>
                              <p
                                className={`${styles["danger-level"]} ${
                                  styles[
                                    activeAlert.details.dangerLevel.toLowerCase()
                                  ]
                                }`}
                              >
                                {activeAlert.details.dangerLevel}
                              </p>
                            </div>
                          </div>
                        )}
                        {activeAlert.details.policeResponse && (
                          <div className={styles["detail-item"]}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            <div>
                              <strong>Status:</strong>
                              <p>{activeAlert.details.policeResponse}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Add Verification Status section to the modal */}
                <div className={styles["detail-group"]}>
                  <h3>Verification Status</h3>
                  <div className={styles["verification-grid"]}>
                    <div className={styles["verification-stat"]}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      <div>
                        <strong>Confirmed:</strong>
                        <p>
                          {validationCounts[activeAlert?.id]?.confirmed || 0}
                        </p>
                      </div>
                    </div>
                    <div className={styles["verification-stat"]}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12"></path>
                      </svg>
                      <div>
                        <strong>Disputed:</strong>
                        <p>
                          {validationCounts[activeAlert?.id]?.disputed || 0}
                        </p>
                      </div>
                    </div>
                    <div className={styles["verification-stat"]}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="4"></circle>
                      </svg>
                      <div>
                        <strong>Total Validations:</strong>
                        <p>{validationCounts[activeAlert?.id]?.total || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles["modal-footer"]}>
                <div className={styles["validation-buttons"]}>
                  {!validationStatus[activeAlert.id]?.userMarkedFalse && (
                    <button
                      className={`${styles["validate-btn"]} ${
                        validationStatus[activeAlert.id]?.userValidated
                          ? styles.active
                          : ""
                      }`}
                      onClick={() => handleValidation(activeAlert.id, true)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      {validationStatus[activeAlert.id]?.userValidated
                        ? "REPORT VALIDATED ✓"
                        : "VALIDATE REPORT"}
                    </button>
                  )}
                  {!validationStatus[activeAlert.id]?.userValidated && (
                    <button
                      className={`${styles["false-report-btn"]} ${
                        validationStatus[activeAlert.id]?.userMarkedFalse
                          ? styles.active
                          : ""
                      }`}
                      onClick={() => handleValidation(activeAlert.id, false)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12"></path>
                      </svg>
                      {validationStatus[activeAlert.id]?.userMarkedFalse
                        ? "REPORT MARKED FALSE ✗"
                        : "MARK AS FALSE"}
                    </button>
                  )}
                </div>

                <div className={styles["action-buttons"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles.primary} ${styles["contact-police-btn"]}`}
                    onClick={() => {
                      openPoliceStationFinder(activeAlert.location);
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    FIND NEARBY POLICE
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles.secondary}`}
                    onClick={closeDetails}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                    CLOSE DETAILS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Police Station Finder Modal - moved outside main container for better visibility */}
      {showPoliceStationFinder && (
        <div className={styles["police-station-modal"]}>
          <PoliceStationFinder
            onClose={closePoliceStationFinder}
            location={selectedLocation}
          />
        </div>
      )}
    </>
  );
};

export default CrimeAlerts;
