import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiShield,
  FiAlertTriangle,
  FiEdit2,
  FiX,
  FiCheck,
  FiLock,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiBriefcase,
  FiAward,
} from "react-icons/fi";
import styles from "./Settings.module.css";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getProfileUpdateErrors,
  validatePassword,
} from "../utils/validationUtils";

const Settings = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isPoliceUser, setIsPoliceUser] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    username: "",
    email: "",
    fullName: "",
    phone: "",
    nid: "",
    address: "",
    joinDate: "",
    lastLogin: "2 hours ago",
    // Police specific fields
    policeId: "",
    rank: "",
    badge: "",
    station: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [tempUserData, setTempUserData] = useState({ ...userData });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDeletionSuccess, setShowDeletionSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [redirectPath, setRedirectPath] = useState("/");

  // Determine if the user is an admin or police when component mounts
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        console.log("User data from localStorage:", userObj); // Debug log
        if (userObj && userObj.role === "admin") {
          console.log("Admin user detected, enabling special handling");
          setIsAdminUser(true);
        }
        if (userObj && userObj.role === "police") {
          console.log("Police user detected, enabling police-specific fields");
          setIsPoliceUser(true);
        }

        // Log specifically if the police role is found
        console.log("User role:", userObj.role);
        console.log("Is police user:", userObj.role === "police");
      } else {
        console.log("No user data found in localStorage");
      }
    } catch (error) {
      console.error("Error checking user role status:", error);
    }
  }, []);

  // Check if we're on the police/settings route
  const isPoliceRoute = location.pathname.includes("police/settings");

  // Show police fields when user is police role (regardless of route)
  // Force enable for debugging if needed by setting to true
  const showPoliceFields = isPoliceUser || isPoliceRoute;

  // Debug log showPoliceFields status
  useEffect(() => {
    console.log("showPoliceFields:", showPoliceFields);
    console.log("isPoliceUser:", isPoliceUser);
    console.log("isPoliceRoute:", isPoliceRoute);
  }, [showPoliceFields, isPoliceUser, isPoliceRoute]);

  // Fetch user profile data when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Check if token exists and is valid, but with a fallback that always allows access
  const checkAuthToken = () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      let userObj = null;

      // Clear any previous error messages
      setProfileError("");

      try {
        userObj = userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }

      // Check for token existence
      if (!token) {
        console.log(
          "No auth token found - proceeding with limited functionality"
        );
        setProfileError(
          "Limited functionality available. Please log in for full access."
        );

        // Return a dummy token to allow the page to load
        return null;
      }

      // Simple format check but don't block access
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.log(
          "Token has invalid format - proceeding with limited functionality"
        );
        setProfileError(
          "Session format is invalid. Some features may be limited."
        );

        // Still return the token to allow basic functionality
        return null;
      }

      // Try to check token expiry but don't block if it fails
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        console.debug("Token payload:", payload);

        // Even if token is expired, still return it for basic functionality
        if (payload.exp && payload.exp < currentTime) {
          console.log("Token expired - proceeding with limited functionality");
          setProfileError(
            "Your session has expired. Please log in again for full access."
          );
          return null;
        }

        // Valid token - normal operation
        return token;
      } catch (error) {
        // Even if token validation fails, still allow basic page access
        console.error("Token parsing error:", error);
        setProfileError(
          "Session validation issues. Some features may be limited."
        );
        return null;
      }
    } catch (error) {
      console.error("General token validation error:", error);
      setProfileError(
        "An error occurred with authentication. Limited functionality available."
      );
      return null;
    }
  };

  // Handle auth errors consistently
  const handleAuthError = (error, errorMessage) => {
    console.error(errorMessage, error);

    // Check if the user is an admin
    let isAdmin = false;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        isAdmin = userObj && userObj.role === "admin";
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    // If admin user, don't auto-redirect even on 401 errors
    if (error.response && error.response.status === 401 && !isAdmin) {
      // Token is invalid or expired - only redirect for non-admin users
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      logout();
      navigate("/login");
    }

    return error.response?.data?.message || errorMessage;
  };

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

  // Helper function to set fallback profile data
  const setFallbackProfileData = () => {
    // Try to get user data from localStorage
    try {
      const userStr = localStorage.getItem("user");
      let storedUser = null;

      if (userStr) {
        storedUser = JSON.parse(userStr);
        console.log("User data from localStorage:", storedUser);
      }

      // Use stored user data or fallback values
      const fallbackData = {
        id: storedUser?.id || "user",
        username: storedUser?.username || "user",
        email: storedUser?.email || "user@example.com",
        fullName: storedUser?.full_name || "User",
        phone: storedUser?.mobile_no || "",
        nid: storedUser?.national_id || "",
        address: storedUser?.address || "",
        joinDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        lastLogin: "Recently",
      };

      // Add police-specific fields if appropriate
      // Check both stored role and component state
      const isPolice =
        (storedUser && storedUser.role === "police") || isPoliceUser;

      if (isPolice) {
        console.log("Adding police fields from localStorage:", {
          police_id: storedUser?.police_id,
          badge_number: storedUser?.badge_number,
          rank: storedUser?.rank,
          station: storedUser?.station,
        });

        fallbackData.policeId = storedUser?.police_id || "";
        fallbackData.rank = storedUser?.rank || "";
        fallbackData.badge = storedUser?.badge_number || ""; // Map badge_number to badge
        fallbackData.station = storedUser?.station || "";
      }

      console.log("Setting user data:", fallbackData);
      setUserData(fallbackData);
      setTempUserData(fallbackData);
    } catch (error) {
      console.error("Error setting fallback data:", error);
      // Ultimate fallback with hardcoded values
      const hardcodedFallback = {
        id: "user",
        username: "user",
        email: "user@example.com",
        fullName: "User",
        phone: "",
        nid: "",
        address: "",
        joinDate: new Date().toLocaleDateString(),
        lastLogin: "Recently",
      };

      // Add police-specific fields even to hardcoded fallback if user is police
      if (isPoliceUser) {
        hardcodedFallback.policeId = "";
        hardcodedFallback.rank = "";
        hardcodedFallback.badge = "";
        hardcodedFallback.station = "";
      }

      setUserData(hardcodedFallback);
      setTempUserData(hardcodedFallback);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUserData({
      ...tempUserData,
      [name]: value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      setProfileError("");
      setProfileSuccess("");

      const token = checkAuthToken();

      // Validate user input
      const validationError = getProfileUpdateErrors(tempUserData);
      if (validationError) {
        setProfileError(validationError);
        setIsLoading(false);
        return;
      }

      // Address format validation: District-Thana
      if (!/^[a-zA-Z\s]+-[a-zA-Z\s]+$/.test(tempUserData.address)) {
        setProfileError(
          "Address must be in format: District-Thana (e.g., Dhaka-Mirpur)"
        );
        setIsLoading(false);
        return;
      }

      // Prepare update data - include all fields that can be updated
      const updateData = {
        full_name: tempUserData.fullName,
        email: tempUserData.email,
        mobile_no: tempUserData.phone || "",
        address: tempUserData.address || "",
      };

      // Include NID if it exists
      if (tempUserData.nid) {
        updateData.national_id = tempUserData.nid;
      }

      // Include police-specific fields if user is police
      if (showPoliceFields) {
        updateData.police_id = tempUserData.policeId || "";
        updateData.rank = tempUserData.rank || "";
        updateData.badge = tempUserData.badge || ""; // Frontend uses badge, backend expects badge field
        updateData.station = tempUserData.station || "";

        console.log("Sending police fields to API:", {
          police_id: updateData.police_id,
          badge: updateData.badge,
          rank: updateData.rank,
          station: updateData.station,
        });
      }

      console.log("Sending profile update data:", updateData);

      try {
        const response = await axios.put(
          "http://localhost:5000/api/auth/profile",
          updateData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            timeout: 8000, // 8 second timeout
          }
        );

        if (response.data.success) {
          // Update the local state with the new data
          setUserData({
            ...userData,
            fullName: tempUserData.fullName,
            email: tempUserData.email,
            phone: tempUserData.phone,
            address: tempUserData.address,
            nid: tempUserData.nid,
            // Update police fields if applicable
            ...(showPoliceFields && {
              policeId: tempUserData.policeId,
              rank: tempUserData.rank,
              badge: tempUserData.badge,
              station: tempUserData.station,
            }),
          });

          // Update local storage user data
          try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const storedUser = JSON.parse(userStr);
              const updatedUser = {
                ...storedUser,
                full_name: tempUserData.fullName,
                email: tempUserData.email,
                mobile_no: tempUserData.phone || "",
                address: tempUserData.address || "",
                national_id: tempUserData.nid || "",
              };

              // Add police fields to local storage if applicable
              if (showPoliceFields) {
                updatedUser.police_id = tempUserData.policeId || "";
                updatedUser.rank = tempUserData.rank || "";
                updatedUser.badge = tempUserData.badge || "";
                updatedUser.station = tempUserData.station || "";
              }

              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          } catch (err) {
            console.error("Error updating local storage user data:", err);
          }

          // Update user in auth context if email or name changed
          if (
            user &&
            (user.email !== tempUserData.email ||
              user.full_name !== tempUserData.fullName)
          ) {
            const updatedUser = {
              ...user,
              email: tempUserData.email,
              full_name: tempUserData.fullName,
              mobile_no: tempUserData.phone || "",
              address: tempUserData.address || "",
              national_id: tempUserData.nid || "",
            };

            // Add police fields to auth context if applicable
            if (showPoliceFields) {
              updatedUser.police_id = tempUserData.policeId || "";
              updatedUser.rank = tempUserData.rank || "";
              updatedUser.badge = tempUserData.badge || "";
              updatedUser.station = tempUserData.station || "";
            }

            login(updatedUser);
          }

          setProfileSuccess("Profile updated successfully");
          setEditMode(false);
          setShowProfileModal(false);
          setShowSuccessAlert(true); // Show success alert
        } else {
          setProfileError(response.data.message || "Failed to update profile");
        }
      } catch (error) {
        console.error("Profile update error:", error);
        if (error.response) {
          setProfileError(
            "Server error: " +
              (error.response.data.message || "Failed to update profile")
          );
        } else if (error.request) {
          setProfileError(
            "Network error: Cannot connect to server. Please try again later."
          );
        } else {
          setProfileError(
            "An unexpected error occurred. Please try again later."
          );
        }
      }
    } catch (error) {
      console.error("General save changes error:", error);
      setProfileError(
        "An error occurred while saving changes. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setTempUserData({ ...userData });
    setEditMode(false);
  };

  // Add a function to check server status
  const checkServerStatus = async () => {
    try {
      // Try to connect to the server's health endpoint
      const response = await axios.get("http://localhost:5000/api/health", {
        timeout: 5000, // 5 second timeout
      });

      return response.status === 200 && response.data.status === "ok";
    } catch (error) {
      console.error("Server health check failed:", error);
      return false;
    }
  };

  const handleDeleteRequest = async () => {
    try {
      // Check server status before showing delete confirmation
      try {
        const serverAvailable = await checkServerStatus();

        if (!serverAvailable) {
          alert(
            "Server appears to be offline. Please try again later when the service is available."
          );
          return;
        }
      } catch (error) {
        console.error("Server check error:", error);
        // Continue anyway - we'll let the user try
      }

      // Get token but don't stop the process if there are issues
      const token = checkAuthToken();

      // Always show the delete confirmation, even with token issues
      setShowDeleteConfirmation(true);
    } catch (error) {
      console.error("Delete request error:", error);
      // Still show the confirmation dialog
      setShowDeleteConfirmation(true);
    }
  };

  // Add this new function to handle the deletion success modal
  const handleDeletionSuccessDisplay = (path) => {
    setRedirectPath(path);
    setShowDeletionSuccess(true);

    // Start countdown for redirection
    let countdownTime = 5;
    setRedirectCountdown(countdownTime);

    const countdownInterval = setInterval(() => {
      countdownTime -= 1;
      setRedirectCountdown(countdownTime);

      if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        // Navigate when countdown finishes
        try {
          navigate(path);
        } catch (navError) {
          console.error("Navigation error:", navError);
          window.location.href = path;
        }
      }
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      return;
    }

    try {
      setIsLoading(true);
      const token = checkAuthToken();

      // If token might be invalid, warn the user but still allow them to try
      if (
        token === "dummy-fallback-token" ||
        token === "fallback-error-token"
      ) {
        if (
          !window.confirm(
            "Your session may be invalid, which could prevent account deletion. Do you still want to try?"
          )
        ) {
          setIsLoading(false);
          setShowDeleteConfirmation(false);
          return;
        }
      }

      try {
        // Log token for debugging (truncate it for security)
        console.log(
          "Delete request with token:",
          token?.substring(0, 5) + "..."
        );

        const response = await axios.delete(
          "http://localhost:5000/api/auth/account",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            timeout: 10000, // 10 second timeout
          }
        );

        console.log("Delete account response:", response.data);

        if (response.data.success) {
          // Clear local storage and context
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          try {
            logout();
          } catch (error) {
            console.error("Error during logout:", error);
          }

          // Hide the delete confirmation modal
          setShowDeleteConfirmation(false);

          // Get redirect path from the server response or default to home page
          const redirectPath = response.data.redirectTo || "/";
          console.log("Will redirect to:", redirectPath);

          // Show the success modal with countdown instead of alert
          handleDeletionSuccessDisplay(redirectPath);
        } else {
          alert(
            response.data.message ||
              "Failed to delete account. Please try again."
          );
        }
      } catch (error) {
        console.error("Account deletion error:", error);

        let errorMessage = "An error occurred while deleting your account.";

        if (error.response) {
          console.error("Error details:", error.response.data);
          errorMessage =
            error.response.data.message ||
            `Error ${error.response.status}: Failed to delete account`;
        } else if (error.request) {
          errorMessage =
            "Network error: Cannot connect to server. Please try again later.";
        }

        alert(errorMessage);
      }
    } catch (error) {
      console.error("General delete account error:", error);
      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.fullScreenContainer}>
      <div className={styles.contentWrapper}>
        {/* Success Alert - show after profile update */}
        {showSuccessAlert && (
          <div className={styles.successAlert}>
            <div className={styles.successAlertContent}>
              <div className={styles.successAlertIcon}>✓</div>
              <div className={styles.successAlertMessage}>
                Profile has been updated successfully!
              </div>
              <div className={styles.successAlertButtons}>
                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => {
                    setShowSuccessAlert(false);
                    setShowProfileModal(true);
                  }}
                >
                  View Profile
                </button>
                <button
                  className={`${styles.button} ${styles.secondaryButton}`}
                  onClick={() => setShowSuccessAlert(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Deletion Success Modal */}
        {showDeletionSuccess && (
          <div className={styles.modalOverlay}>
            <div
              className={`${styles.modalContent} ${styles.deletionSuccessModal}`}
            >
              <div className={`${styles.modalHeader} ${styles.successHeader}`}>
                <h2 className={styles.modalTitle}>
                  Account Deleted Successfully
                </h2>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.deletionSuccessIcon}>
                  <FiCheck size={48} color="#4CAF50" />
                </div>
                <p className={styles.deletionSuccessMessage}>
                  Your account has been permanently deleted. All your data has
                  been removed from our system.
                </p>
                <p className={styles.deletionRedirectMessage}>
                  You will be redirected to the home page in{" "}
                  <span className={styles.countdownTimer}>
                    {redirectCountdown}
                  </span>{" "}
                  seconds.
                </p>
                <div className={styles.redirectProgressContainer}>
                  <div
                    className={styles.redirectProgressBar}
                    style={{ width: `${(redirectCountdown / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => navigate(redirectPath)}
                >
                  Go to Home Now
                </button>
              </div>
            </div>
          </div>
        )}

        <header className={styles.header}>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>
            Manage your profile and security preferences
          </p>
        </header>

        <div className={styles.mainGrid}>
          {/* Left Column - Profile Overview */}
          <section className={`${styles.section} ${styles.profileSection}`}>
            <div className={styles.sectionHeader}>
              <FiUser className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Profile Overview</h2>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.avatar}>{userData.fullName.charAt(0)}</div>

              <div className={styles.profileInfo}>
                <h3>{userData.fullName}</h3>
                <p className={styles.profileMeta}>@{userData.username}</p>
                {showPoliceFields && (
                  <p className={styles.profileMeta}>
                    <FiAward className={styles.inlineIcon} /> {userData.rank}
                  </p>
                )}
                <p className={styles.profileMeta}>
                  Member since {userData.joinDate}
                </p>
                <p className={styles.profileMeta}>
                  Last active {userData.lastLogin}
                </p>

                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => {
                    setShowSuccessAlert(false);
                    setShowProfileModal(true);
                  }}
                >
                  <FiEdit2 /> Edit Profile
                </button>
              </div>
            </div>
          </section>

          {/* Right Column - Security and Danger Zone */}
          <div className={styles.rightColumn}>
            <section className={`${styles.section} ${styles.securitySection}`}>
              <div className={styles.sectionHeader}>
                <FiShield className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Account Security</h2>
              </div>

              <div className={styles.settingsGroup}>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <h3 className={styles.settingTitle}>Password</h3>
                    <p className={styles.settingStatus}>
                      Keep your account secure with a strong password
                    </p>
                  </div>
                  <button
                    className={`${styles.button} ${styles.primaryButton}`}
                    onClick={() =>
                      navigate("/forgot-password?mode=change", {
                        state: { mode: "change" },
                      })
                    }
                  >
                    <FiLock /> Change Password
                  </button>
                </div>

                <div className={styles.settingDivider}></div>
              </div>
            </section>

            <section className={`${styles.section} ${styles.dangerZone}`}>
              <div className={styles.sectionHeader}>
                <FiAlertTriangle className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Danger Zone</h2>
              </div>
              <p className={styles.warningText}>
                Permanent actions that cannot be undone
              </p>
              <button
                className={`${styles.button} ${styles.dangerButton}`}
                onClick={handleDeleteRequest}
              >
                <FiAlertTriangle /> Delete Account
              </button>
            </section>
          </div>
        </div>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Edit Profile</h2>
              </div>

              <div className={styles.modalBody}>
                {profileError && (
                  <p className={styles.errorMessage}>{profileError}</p>
                )}
                {profileSuccess && (
                  <p className={styles.successMessage}>{profileSuccess}</p>
                )}

                {/* Debug information about police status */}
                <div style={{ display: "none" }}>
                  <p>Debug: isPoliceUser = {String(isPoliceUser)}</p>
                  <p>Debug: showPoliceFields = {String(showPoliceFields)}</p>
                  <p>
                    Debug: user role ={" "}
                    {localStorage.getItem("user")
                      ? JSON.parse(localStorage.getItem("user"))?.role
                      : "none"}
                  </p>
                </div>

                {editMode ? (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={tempUserData.fullName}
                        onChange={handleInputChange}
                        className={styles.input}
                        disabled={isLoading}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={tempUserData.email}
                        onChange={handleInputChange}
                        className={styles.input}
                        disabled={isLoading}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>National ID</label>
                      <input
                        type="text"
                        name="nid"
                        value={tempUserData.nid}
                        onChange={handleInputChange}
                        className={styles.input}
                        disabled={isLoading}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={tempUserData.phone}
                        onChange={handleInputChange}
                        className={styles.input}
                        disabled={isLoading}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Address</label>
                      <textarea
                        name="address"
                        value={tempUserData.address}
                        onChange={handleInputChange}
                        className={`${styles.input} ${styles.textarea}`}
                        disabled={isLoading}
                        placeholder="Enter your full address"
                      />
                    </div>

                    {/* Police-specific fields in edit mode */}
                    {(showPoliceFields || isPoliceUser) && (
                      <>
                        <div className={styles.sectionDivider}>
                          <FiBriefcase className={styles.dividerIcon} />
                          <span>Police Information</span>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Police ID</label>
                          <input
                            type="text"
                            name="policeId"
                            value={tempUserData.policeId}
                            onChange={handleInputChange}
                            className={styles.input}
                            disabled={isLoading}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Rank</label>
                          <input
                            type="text"
                            name="rank"
                            value={tempUserData.rank}
                            onChange={handleInputChange}
                            className={styles.input}
                            disabled={isLoading}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Badge Number</label>
                          <input
                            type="text"
                            name="badge"
                            value={tempUserData.badge}
                            onChange={handleInputChange}
                            className={styles.input}
                            disabled={isLoading}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Station</label>
                          <input
                            type="text"
                            name="station"
                            value={tempUserData.station}
                            onChange={handleInputChange}
                            className={styles.input}
                            disabled={isLoading}
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className={styles.profileField}>
                      <span className={styles.fieldLabel}>Full Name:</span>
                      <span className={styles.fieldValue}>
                        {userData.fullName}
                      </span>
                    </div>

                    <div className={styles.profileField}>
                      <span className={styles.fieldLabel}>Username:</span>
                      <span className={styles.fieldValue}>
                        {userData.username}
                      </span>
                    </div>

                    <div className={styles.profileField}>
                      <span className={styles.fieldLabel}>Email:</span>
                      <span className={styles.fieldValue}>
                        {userData.email}
                      </span>
                    </div>

                    <div className={styles.profileField}>
                      <span className={styles.fieldLabel}>Phone:</span>
                      <span className={styles.fieldValue}>
                        {userData.phone}
                      </span>
                    </div>

                    <div className={styles.profileField}>
                      <span className={styles.fieldLabel}>NID:</span>
                      <span className={styles.fieldValue}>{userData.nid}</span>
                    </div>

                    <div className={styles.profileField}>
                      <span className={styles.fieldLabel}>Address:</span>
                      <span className={styles.fieldValue}>
                        {userData.address}
                      </span>
                    </div>

                    {/* Police-specific fields in view mode */}
                    {(showPoliceFields || isPoliceUser) && (
                      <>
                        <div className={styles.sectionDivider}>
                          <FiBriefcase className={styles.dividerIcon} />
                          <span>Police Information</span>
                        </div>

                        <div className={styles.profileField}>
                          <span className={styles.fieldLabel}>Police ID:</span>
                          <span className={styles.fieldValue}>
                            {userData.policeId}
                          </span>
                        </div>

                        <div className={styles.profileField}>
                          <span className={styles.fieldLabel}>Rank:</span>
                          <span className={styles.fieldValue}>
                            {userData.rank}
                          </span>
                        </div>

                        <div className={styles.profileField}>
                          <span className={styles.fieldLabel}>
                            Badge Number:
                          </span>
                          <span className={styles.fieldValue}>
                            {userData.badge}
                          </span>
                        </div>

                        <div className={styles.profileField}>
                          <span className={styles.fieldLabel}>Station:</span>
                          <span className={styles.fieldValue}>
                            {userData.station}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className={styles.modalFooter}>
                {editMode ? (
                  <>
                    <button
                      className={`${styles.button} ${styles.primaryButton}`}
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Saving..."
                      ) : (
                        <>
                          <FiCheck /> Save Changes
                        </>
                      )}
                    </button>
                    <button
                      className={`${styles.button} ${styles.secondaryButton}`}
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      <FiX /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`${styles.button} ${styles.primaryButton}`}
                      onClick={() => setEditMode(true)}
                    >
                      <FiEdit2 /> Edit Profile
                    </button>
                    <button
                      className={`${styles.button} ${styles.secondaryButton}`}
                      onClick={() => setShowProfileModal(false)}
                    >
                      <FiX /> Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitleDelete}>Delete Account</h2>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.deleteWarning}>
                  <FiAlertTriangle size={24} color="#ff3b30" />
                  <p>
                    This action <strong>cannot</strong> be undone. This will
                    permanently delete your account and remove all your data
                    from our systems.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    To confirm, type "DELETE" in the box below:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className={styles.input}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={`${styles.button} ${styles.dangerButton}`}
                  onClick={handleDeleteAccount}
                  disabled={isLoading || deleteConfirmText !== "DELETE"}
                >
                  {isLoading ? "Deleting..." : "Delete Account"}
                </button>
                <button
                  className={`${styles.button} ${styles.secondaryButton}`}
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeleteConfirmText("");
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
