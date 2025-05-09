import React, { useState, useEffect } from "react";
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

  // Filter crimes based on search term and police_id
  const filteredCrimes = crimes.filter((crime) => {
    // Apply the search filter
    const matchesSearch =
      crime.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (crime.location &&
        crime.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (crime.crime_type &&
        crime.crime_type.toLowerCase().includes(searchTerm.toLowerCase()));

    // If we're in admin mode (showing all reports), only filter by search term and active tab
    if (showAllReports) {
      if (activeTab === "all") return matchesSearch;
      if (activeTab === "pending")
        return matchesSearch && (!crime.status || crime.status === "pending");
      if (activeTab === "investigating")
        return matchesSearch && crime.status === "investigating";
      if (activeTab === "resolved")
        return matchesSearch && crime.status === "resolved";
      return matchesSearch;
    }

    // Otherwise, filter by both police_id, search term, and active tab
    const matchesPoliceId = crime.police_id === userData.policeId;

    if (activeTab === "all") return matchesPoliceId && matchesSearch;
    if (activeTab === "pending")
      return (
        matchesPoliceId &&
        matchesSearch &&
        (!crime.status || crime.status === "pending")
      );
    if (activeTab === "investigating")
      return (
        matchesPoliceId && matchesSearch && crime.status === "investigating"
      );
    if (activeTab === "resolved")
      return matchesPoliceId && matchesSearch && crime.status === "resolved";

    return matchesPoliceId && matchesSearch;
  });

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

  // Helper function to format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    </div>
  );
};

export default MyCases;
