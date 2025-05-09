import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useApi } from "../../utils/useApi";
import axios from "axios";
import styles from "./PendingCases.module.css";

const MyCases = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    fetchWithAuth,
    isLoading: apiIsLoading,
    error: apiError,
    setError,
  } = useApi();
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorMessage] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState({});
  const [tempUserData, setTempUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isPoliceUser, setIsPoliceUser] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingReporterDetails, setLoadingReporterDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [notification, setNotification] = useState(null);
  const [isNotificationExiting, setIsNotificationExiting] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch reports after user profile is loaded
  useEffect(() => {
    // Only fetch data once we have user information and confirm they are a police user
    if (userData && userData.id && (isPoliceUser || user?.role === "police")) {
      console.log(
        "User profile loaded, fetching reports for police user:",
        userData.policeId
      );
      fetchData();
    }
  }, [userData, isPoliceUser]);

  // Update component error state when API error changes
  useEffect(() => {
    if (apiError) {
      setErrorMessage(apiError);
    }
  }, [apiError]);

  // In the useEffect, add auto-dismissal with animation
  useEffect(() => {
    let dismissTimer;
    if (notification) {
      dismissTimer = setTimeout(() => {
        setIsNotificationExiting(true);
        setTimeout(() => {
          setNotification(null);
          setIsNotificationExiting(false);
        }, 300);
      }, 3000);
    }

    return () => {
      clearTimeout(dismissTimer);
    };
  }, [notification]);

  const checkAuthToken = () => {
    return localStorage.getItem("token");
  };

  const setFallbackProfileData = () => {
    // Set fallback data for userData
    const fallbackData = {
      id: 1,
      username: "officer",
      email: "officer@example.com",
      fullName: "Police Officer",
      phone: "",
      nid: "",
      address: "",
      joinDate: "Jan 1, 2023",
      lastLogin: "2 hours ago",
      policeId: "POL-001",
      rank: "Officer",
      badge: "12345",
      station: "Central Station",
    };

    setUserData(fallbackData);
    setTempUserData(fallbackData);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Include the role parameter in the URL to indicate this is a police user
      let endpoint = "http://localhost:5000/api/reports?role=police";
      let data;

      try {
        // First attempt with the regular endpoint
        data = await fetchWithAuth(endpoint);
        setShowAllReports(false); // Only showing reports assigned to this officer
      } catch (initialError) {
        console.error("Initial fetch attempt failed:", initialError);

        // If the first attempt fails with a permission error, try the admin endpoint
        if (
          initialError.message &&
          initialError.message.includes("Access denied")
        ) {
          console.log("Trying admin endpoint as fallback...");
          endpoint = "http://localhost:5000/api/reports/admin";
          data = await fetchWithAuth(endpoint);
          setShowAllReports(true); // Show all reports in admin mode
        } else {
          // If it's not a permission error, rethrow
          throw initialError;
        }
      }

      if (data && data.success) {
        console.log("Successfully fetched", data.data.length, "reports");
        setCrimes(data.data || []);
        setErrorMessage(null);
      } else {
        throw new Error("Failed to fetch crime reports");
      }
    } catch (err) {
      console.error("Error fetching crime reports:", err);
      setErrorMessage(err.message || "Failed to load crime reports");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (report) => {
    try {
      // Set the initial report data to show loading state
      setSelectedReport(report);
      setShowModal(true);
      setLoadingReporterDetails(true);

      // Make an API call to get detailed report information including reporter details
      const response = await fetchWithAuth(
        `http://localhost:5000/api/reports/${report.id}/details?include_reporter=true`
      );

      if (response.success) {
        console.log("Detailed report with reporter info:", response.data);

        // Update the report with reporter details
        setSelectedReport({
          ...report,
          reporter: response.data.reporter || {},
          // Update any other fields that might have been fetched
          status: response.data.status || report.status,
          time: response.data.time || report.time,
          location: response.data.location || report.location,
          police_id: response.data.police_id || report.police_id,
        });
      } else {
        console.error("Failed to fetch report details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
    } finally {
      setLoadingReporterDetails(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const handleViewFullDetails = (reportId) => {
    closeModal();
    // Update to use police route pattern to match the URL structure
    navigate(`/police/report/${reportId}`);
  };

  // Add useMemo to calculate filtered crimes based on activeTab and searchTerm
  const filteredCrimes = useMemo(() => {
    return crimes
      .filter((crime) => {
        // Handle tab filtering
        if (activeTab === "all") return true;
        return crime.status === activeTab;
      })
      .filter((crime) => {
        // Police officer should only see their assigned cases unless they're admin
        if (!showAllReports && userData.policeId) {
          return crime.police_id === userData.policeId;
        }
        return true; // Admin sees all cases
      })
      .filter((crime) => {
        // Handle search filtering
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          crime.id?.toString().includes(search) ||
          (crime.title || crime.description || "")
            ?.toLowerCase()
            .includes(search) ||
          (crime.crime_type || crime.type || "")
            ?.toLowerCase()
            .includes(search) ||
          (crime.location || "")?.toLowerCase().includes(search) ||
          (crime.description || "")?.toLowerCase().includes(search) ||
          (crime.reporter_name || "")?.toLowerCase().includes(search)
        );
      });
  }, [crimes, activeTab, searchTerm, showAllReports, userData.policeId]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      // Always attempt to get a token (will now always return something)
      const token = checkAuthToken();

      // Check if the user is a police officer based on localStorage
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          if (userObj && userObj.role === "police") {
            console.log(
              "Setting police user status true from fetchUserProfile"
            );
            setIsPoliceUser(true);
          }
        }
      } catch (error) {
        console.error("Error checking user role in fetchUserProfile:", error);
      }

      if (!token) {
        // If token is invalid or missing, use fallback data immediately
        console.log("No valid token available, using fallback data");
        setFallbackProfileData();
        setIsLoading(false);
        return;
      }

      // Attempt to load profile from server, but with error handling
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            timeout: 5000, // 5 second timeout to prevent long loading
          }
        );

        if (response.data.success) {
          // Clear any previous error since we successfully loaded data
          setProfileError("");

          const profileData = response.data.user;
          console.log("Profile data from API:", profileData);

          // Check if user is police from API response
          if (profileData.role === "police") {
            console.log("Setting police user status to true from API response");
            setIsPoliceUser(true);
          }

          // Format date
          const joinDate = new Date(profileData.created_at).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );

          const userData = {
            id: profileData.id,
            username: profileData.username || "",
            email: profileData.email || "",
            fullName: profileData.full_name || "",
            phone: profileData.mobile_no || "",
            nid: profileData.national_id || "",
            address: profileData.address || "",
            joinDate: joinDate,
            lastLogin: profileData.last_login
              ? new Date(profileData.last_login).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "2 hours ago",
          };

          // Add police-specific fields if the user is a police officer or if the fields exist in the response
          const isPoliceUser =
            profileData.role === "police" ||
            profileData.police_id ||
            profileData.badge_number ||
            profileData.rank ||
            profileData.station;

          if (isPoliceUser) {
            console.log("Police fields from API:", {
              police_id: profileData.police_id,
              badge_number: profileData.badge_number,
              rank: profileData.rank,
              station: profileData.station,
              role: profileData.role,
            });

            userData.policeId = profileData.police_id || "";
            userData.rank = profileData.rank || "";
            userData.badge = profileData.badge_number || ""; // Map badge_number to badge
            userData.station = profileData.station || "";
          }

          setUserData(userData);
          setTempUserData({ ...userData });
        } else {
          console.log("Server returned non-success status:", response.data);
          // Don't overwrite previous error messages from token validation
          if (!profileError) {
            setProfileError(
              response.data.message || "Failed to load profile data"
            );
          }
          setFallbackProfileData();
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);

        // If the error is a 401 unauthorized, the token is invalid or expired
        if (error.response && error.response.status === 401) {
          setProfileError("Your session has expired. Please log in again.");
          // Clear invalid token
          localStorage.removeItem("token");
        } else if (!profileError) {
          if (error.response) {
            // Server responded with an error
            setProfileError(
              "Error: " +
                (error.response.data.message || "Failed to load profile")
            );
          } else if (error.request) {
            // Request was made but no response received
            setProfileError(
              "Network error: Cannot connect to server. Try again later."
            );
          } else {
            // Something else happened
            setProfileError(
              "An unexpected error occurred. Please try again later."
            );
          }
        }

        // Always set fallback data so the page remains usable
        setFallbackProfileData();
      }
    } catch (error) {
      console.error("General profile fetch error:", error);
      setProfileError("Could not load profile data. Using offline mode.");
      setFallbackProfileData();
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine case priority based on crime type and status
  const getCasePriority = (crime) => {
    if (crime.type === "homicide" || crime.crime_type === "homicide")
      return "high";
    if (crime.type === "assault" || crime.crime_type === "assault")
      return "medium";
    if (crime.status === "resolved") return "low";
    return "normal";
  };

  // Make date formatting more robust
  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) return "Unknown";

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown";
    }
  };

  // Update the fetchCrimes function to properly handle status
  const fetchCrimes = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        "http://localhost:5000/api/reports?role=police"
      );
      if (response.success) {
        const formattedCrimes = response.data.map((crime) => ({
          ...crime,
          date: new Date(
            crime.created_at || crime.timestamp || Date.now()
          ).toLocaleString(),
          time: new Date(
            crime.created_at || crime.timestamp || Date.now()
          ).toLocaleTimeString(),
          status: crime.status || "pending",
        }));

        console.log("Formatted crimes with status:", formattedCrimes);
        setCrimes(formattedCrimes);
      } else {
        console.error("Failed to fetch crimes:", response.message);
        setErrorMessage("Failed to fetch crimes: " + response.message);
      }
    } catch (error) {
      console.error("Error fetching crimes:", error);
      setErrorMessage("Error fetching crimes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to show notification
  const showNotification = (type, title, message) => {
    setNotification({
      type,
      title,
      message,
      id: Date.now(), // Unique ID to help with removal
    });

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3300); // slightly longer than animation duration
  };

  // Update dismiss function to handle animation
  const dismissNotification = () => {
    setIsNotificationExiting(true);
    setTimeout(() => {
      setNotification(null);
      setIsNotificationExiting(false);
    }, 300); // Match animation duration
  };

  // Update handleStatusChange to use the new notification system
  const handleStatusChange = async (crimeId, newStatus) => {
    if (!crimeId || !newStatus) return;

    try {
      setUpdatingStatus((prev) => ({ ...prev, [crimeId]: true }));

      const response = await fetchWithAuth(
        `http://localhost:5000/api/reports/${crimeId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.success) {
        console.log(
          `Status updated successfully to ${newStatus}`,
          response.data
        );

        // Update the crime's status in the state
        setCrimes((prevCrimes) => {
          const updatedCrimes = prevCrimes.map((crime) =>
            crime.id === crimeId ? { ...crime, status: newStatus } : crime
          );

          // If filtering by tab, the item might need to be removed from the view
          if (activeTab !== "all" && activeTab !== newStatus) {
            // Item will be filtered out in the UI since it no longer matches the active tab
            // No need to remove it from the state since we're filtering in the render logic
          }

          return updatedCrimes;
        });

        // Show success notification instead of alert
        setErrorMessage(null); // Clear any existing errors
        showNotification(
          "success",
          "Status Updated",
          `Case #${crimeId} status changed to ${newStatus.toUpperCase()}`
        );
      } else {
        console.error("Failed to update status:", response.message);
        setErrorMessage(`Failed to update status: ${response.message}`);
        showNotification(
          "error",
          "Update Failed",
          response.message || "Failed to update case status"
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setErrorMessage(
        `Error updating status: ${error.message || "Unknown error"}`
      );
      showNotification(
        "error",
        "Update Failed",
        error.message || "An unexpected error occurred"
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [crimeId]: false }));
    }
  };

  return (
    <div className={styles.caseFilesContainer}>
      <div className={styles.caseFilesHeader}>
        <div className={styles.caseFilesTitle}>
          <h1>Case Files</h1>
          <div className={styles.badgeId}>
            {userData.badge && <span>Badge #{userData.badge}</span>}
            {userData.station && <span>{userData.station} Station</span>}
          </div>
        </div>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search cases by ID, location or crime type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.searchIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </div>

      {showAllReports && (
        <div className={styles.adminBadge}>
          ADMIN VIEW - Showing all department cases
        </div>
      )}

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "all" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("all")}
        >
          All Cases
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "pending" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "investigating" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("investigating")}
        >
          Investigating
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "resolved" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("resolved")}
        >
          Resolved
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Retrieving case files...</p>
        </div>
      ) : (
        <div className={styles.filesCabinet}>
          {filteredCrimes.length === 0 ? (
            <div className={styles.emptyCabinetMessage}>
              <div className={styles.emptyFolder}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <p>No case files match your criteria</p>
              <span>Try adjusting your search or filter settings</span>
            </div>
          ) : (
            <div className={styles.filesList}>
              {filteredCrimes.map((crime) => (
                <div
                  key={crime.id}
                  className={`${styles.caseFile} ${
                    styles[`priority-${getCasePriority(crime)}`]
                  }`}
                >
                  <div className={styles.caseFileTab}>
                    <span className={styles.caseId}>#{crime.id}</span>
                  </div>
                  <div className={styles.caseFileContent}>
                    <div className={styles.caseMeta}>
                      <div className={styles.caseTypeStamp}>
                        {crime.status === "resolved" && (
                          <div className={styles.resolvedStamp}>RESOLVED</div>
                        )}
                        {crime.police_id && (
                          <div className={styles.assignedStamp}>ASSIGNED</div>
                        )}
                        <span>
                          {crime.type || crime.crime_type || "Unclassified"}
                        </span>
                      </div>
                      <div className={styles.caseDate}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>
                          {formatTime(crime.time || crime.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.statusChangeWrapper}>
                      <div className={styles.statusChangeDropdown}>
                        <button
                          className={styles.statusChangeButton}
                          disabled={updatingStatus[crime.id]}
                        >
                          {updatingStatus[crime.id] ? (
                            <>
                              <div className={styles.miniSpinner}></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                              Change Status
                            </>
                          )}
                        </button>
                        <div className={styles.statusOptions}>
                          <button
                            className={`${styles.statusOption} ${
                              crime.status === "pending"
                                ? styles.currentStatus
                                : ""
                            }`}
                            onClick={() =>
                              handleStatusChange(crime.id, "pending")
                            }
                            disabled={
                              crime.status === "pending" ||
                              updatingStatus[crime.id]
                            }
                          >
                            Pending
                          </button>
                          <button
                            className={`${styles.statusOption} ${
                              crime.status === "investigating"
                                ? styles.currentStatus
                                : ""
                            }`}
                            onClick={() =>
                              handleStatusChange(crime.id, "investigating")
                            }
                            disabled={
                              crime.status === "investigating" ||
                              updatingStatus[crime.id]
                            }
                          >
                            Investigating
                          </button>
                          <button
                            className={`${styles.statusOption} ${
                              crime.status === "resolved"
                                ? styles.currentStatus
                                : ""
                            }`}
                            onClick={() =>
                              handleStatusChange(crime.id, "resolved")
                            }
                            disabled={
                              crime.status === "resolved" ||
                              updatingStatus[crime.id]
                            }
                          >
                            Resolved
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={styles.caseLocation}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                      <span>{crime.location || "Unknown location"}</span>
                    </div>
                    <div className={styles.caseDescription}>
                      {crime.description ||
                        "No description available for this case."}
                    </div>
                    <div className={styles.caseStatus}>
                      <div className={styles.statusIndicator}>
                        <span
                          className={
                            styles[`status-${crime.status || "pending"}`]
                          }
                        >
                          {crime.status
                            ? crime.status.toUpperCase()
                            : "PENDING"}
                        </span>
                      </div>

                      <div className={styles.caseActionButtons}>
                        <button
                          className={styles.caseDetailsButton}
                          onClick={() => handleViewReport(crime)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          View Details
                        </button>
                        <button
                          className={styles.caseReportButton}
                          onClick={() => navigate(`/police/report/${crime.id}`)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
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
                          Full Report
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.paperClip}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reporter Details Modal - keeping the same function but with updated design */}
      {showModal && selectedReport && (
        <div className={styles.modalOverlay}>
          <div className={styles.caseFileModal}>
            <div className={styles.modalHeader}>
              <h2>Case #{selectedReport.id} Details</h2>
              <button className={styles.closeModalButton} onClick={closeModal}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
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
                  Reporter Information
                </h3>

                {loadingReporterDetails ? (
                  <div className={styles.sectionLoading}>
                    <div className={styles.miniSpinner}></div>
                    <span>Loading reporter details...</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>Name:</div>
                      <div className={styles.detailValue}>
                        {selectedReport.reporter?.full_name ||
                          selectedReport.reporter?.name ||
                          "Anonymous"}
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>ID:</div>
                      <div className={styles.detailValue}>
                        {selectedReport.reporter?.id || "Not available"}
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>Email:</div>
                      <div className={styles.detailValue}>
                        {selectedReport.reporter?.email || "Not available"}
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>Phone:</div>
                      <div className={styles.detailValue}>
                        {selectedReport.reporter?.phone || "Not available"}
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>Address:</div>
                      <div className={styles.detailValue}>
                        {selectedReport.reporter?.address || "Not available"}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.modalSection}>
                <h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
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
                  Case Details
                </h3>
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Location:</div>
                  <div className={styles.detailValue}>
                    {selectedReport.location || "Unknown"}
                  </div>
                </div>
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Time Reported:</div>
                  <div className={styles.detailValue}>
                    {selectedReport.time
                      ? new Date(selectedReport.time).toLocaleString()
                      : "Unknown"}
                  </div>
                </div>
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Status:</div>
                  <div className={styles.detailValue}>
                    <span
                      className={
                        styles[
                          `modalStatus-${selectedReport.status || "pending"}`
                        ]
                      }
                    >
                      {selectedReport.status?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                </div>
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Assigned To:</div>
                  <div className={styles.detailValue}>
                    {selectedReport.police_id || "Not assigned"}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.secondaryButton} onClick={closeModal}>
                Close
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => handleViewFullDetails(selectedReport.id)}
              >
                View Full Case Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification overlay */}
      {notification && (
        <div
          className={`${styles.notificationOverlay} ${
            isNotificationExiting ? styles.exiting : ""
          }`}
        >
          <div
            className={`${styles.notification} ${styles[notification.type]} ${
              isNotificationExiting ? styles.exiting : ""
            }`}
          >
            <div className={styles.notificationIcon}>
              {notification.type === "success" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              )}
              {notification.type === "error" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
              {notification.type === "info" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              )}
            </div>
            <div className={styles.notificationContent}>
              <div className={styles.notificationTitle}>
                {notification.title}
              </div>
              <div className={styles.notificationMessage}>
                {notification.message}
              </div>
            </div>
            <button
              className={styles.notificationDismiss}
              onClick={dismissNotification}
              aria-label="Close notification"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCases;
