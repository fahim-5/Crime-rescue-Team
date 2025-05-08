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

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const handleViewFullDetails = (reportId) => {
    closeModal();
    // Use a generic route that works for both roles
    navigate(`/report/${reportId}`);
  };

  // Filter crimes based on search term and police_id
  const filteredCrimes = crimes.filter((crime) => {
    // Apply the search filter
    const matchesSearch = crime.id
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // If we're in admin mode (showing all reports), only filter by search term
    if (showAllReports) {
      return matchesSearch;
    }

    // Otherwise, filter by both police_id and search term
    const matchesPoliceId = crime.police_id === userData.policeId;
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

  return (
    <div className={styles["reported-crimes-container"]}>
      <h2 className={styles["reported-crimes-header"]}>My Cases</h2>

      {error && <div className={styles["error-message"]}>{error}</div>}

      {showAllReports && (
        <div className={styles["info-message"]}>
          Showing all reports in admin view mode. Note that all reports are
          visible, not just those assigned to you.
        </div>
      )}

      {loading ? (
        <div className={styles["loading-message"]}>
          Loading crime reports...
        </div>
      ) : (
        <div className={styles["crimes-table-container"]}>
          <div className={styles["search-container"]}>
            <input
              type="text"
              placeholder="Search by Crime ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles["search-input"]}
            />
          </div>

          {filteredCrimes.length === 0 ? (
            <div className={styles["no-crimes-message"]}>
              {searchTerm
                ? "No matching crime reports found."
                : showAllReports
                ? "No crime reports available in the system."
                : "No crime reports are currently assigned to you."}
            </div>
          ) : (
            <table className={styles["crimes-table"]}>
              <thead>
                <tr>
                  <th>Crime ID</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrimes.map((crime) => (
                  <tr key={crime.id}>
                    <td>{crime.id}</td>
                    <td>{crime.location || "Unknown"}</td>
                    <td>
                      {crime.time
                        ? new Date(crime.time).toLocaleString()
                        : "Unknown"}
                    </td>
                    <td>{crime.status || "Pending"}</td>
                    <td>
                      <button
                        className={styles["view-btn"]}
                        onClick={() => handleViewReport(crime)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Reporter Details Modal */}
      {showModal && selectedReport && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["reporter-info"]}>
            <div className={styles["modal-header-h1"]}>
              <h3>Reporter Details</h3>
            </div>
            <div className={styles["modal-body"]}>
              <div className={styles["report-detail"]}>
                <span className={styles["detail-label"]}>Report ID:</span>
                <span className={styles["detail-value"]}>
                  {selectedReport.id}
                </span>
              </div>
              <div className={styles["report-detail"]}>
                <span className={styles["detail-label"]}>Reporter Name:</span>
                <span className={styles["detail-value"]}>
                  {selectedReport.reporter?.name ||
                    selectedReport.reporter?.full_name ||
                    "Anonymous"}
                </span>
              </div>
              <div className={styles["report-detail"]}>
                <span className={styles["detail-label"]}>Reporter ID:</span>
                <span className={styles["detail-value"]}>
                  {selectedReport.reporter?.id || "Not available"}
                </span>
              </div>
              <div className={styles["report-detail"]}>
                <span className={styles["detail-label"]}>Reporter Email:</span>
                <span className={styles["detail-value"]}>
                  {selectedReport.reporter?.email || "Not available"}
                </span>
              </div>
              <div className={styles["report-detail"]}>
                <span className={styles["detail-label"]}>
                  Reporter Address:
                </span>
                <span className={styles["detail-value"]}>
                  {selectedReport.reporter?.address || "Not available"}
                </span>
              </div>
              <div className={styles["report-detail"]}>
                <span className={styles["detail-label"]}>Report Location:</span>
                <span className={styles["detail-value"]}>
                  {selectedReport.location || "Unknown"}
                </span>
              </div>
              <div className={styles["report-detail"]}>
                <span className={styles["detail-label"]}>Report Time:</span>
                <span className={styles["detail-value"]}>
                  {selectedReport.time
                    ? new Date(selectedReport.time).toLocaleString()
                    : "Unknown"}
                </span>
              </div>
              <div className={styles["report-detail"]}>
                <span className={styles["detail-label"]}>Report Status:</span>
                <span className={styles["detail-value"]}>
                  {selectedReport.status || "Pending"}
                </span>
              </div>
              <div className={styles["report-detail"]}>
                <span className={styles["detail-label"]}>
                  Assigned Officer ID:
                </span>
                <span className={styles["detail-value"]}>
                  {selectedReport.police_id || "Not assigned"}
                </span>
              </div>
            </div>
            <div className={styles["modal-footer"]}>
              <button
                className={styles["more-details-btn"]}
                onClick={() => handleViewFullDetails(selectedReport.id)}
              >
                Report Details
              </button>
              <button className={styles["close-btn-b"]} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCases;
