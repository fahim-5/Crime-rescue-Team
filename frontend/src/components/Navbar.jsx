import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import NotificationBadge from "./NotificationBadge";
import axios from "axios";
import "./Navbar.css";
import "./profile_popup.css";

const API_URL = "http://localhost:5000";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasActiveAlerts, setHasActiveAlerts] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [userRank, setUserRank] = useState("Silver");
  const location = useLocation();
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const { user, logout: authLogout, token } = useAuth();

  const toggleProfilePopup = () => setProfileOpen((prev) => !prev);

  const isOnAlertsPage = location.pathname.includes("/crime-alerts");

  // Calculate rank based on points
  const calculateRank = (points) => {
    if (points <= 2000) return "Silver";
    if (points <= 6000) return "Gold";
    if (points <= 12000) return "Platinum";
    return "Diamond";
  };

  // Fetch user points when profile popup is opened
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (user && token && profileOpen && user.role === "public") {
        try {
          const response = await axios.get(
            `${API_URL}/api/users/${user.id}/points`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data && response.data.success) {
            const points = response.data.data.points || 0;
            setUserPoints(points);
            setUserRank(calculateRank(points));
            console.log(
              `Fetched user points: ${points}, Rank: ${calculateRank(points)}`
            );
          }
        } catch (error) {
          console.error("Error fetching user points:", error);
          setUserPoints(0);
          setUserRank("Silver");
        }
      }
    };

    fetchUserPoints();
  }, [user, token, profileOpen]);

  useEffect(() => {
    const handleAlertsStatusChange = (event) => {
      setHasActiveAlerts(event.detail.hasActiveAlerts);
    };

    if (window.hasActiveAlerts !== undefined) {
      setHasActiveAlerts(window.hasActiveAlerts);
    }

    window.addEventListener("alertsStatusChanged", handleAlertsStatusChange);

    return () => {
      window.removeEventListener(
        "alertsStatusChanged",
        handleAlertsStatusChange
      );
    };
  }, []);

  const showAlert = (message, type = "info") => {
    const alertBox = document.createElement("div");
    alertBox.classList.add("custom-alert", `alert-${type}`, "show");
    alertBox.innerHTML = `${message} <span class="alert-close">&times;</span>`;
    document.body.appendChild(alertBox);

    alertBox.querySelector(".alert-close").addEventListener("click", () => {
      alertBox.style.opacity = "0";
      setTimeout(() => alertBox.remove(), 400);
    });

    setTimeout(() => {
      alertBox.style.opacity = "0";
      setTimeout(() => alertBox.remove(), 400);
    }, 3000);
  };

  const handleLogout = async (event) => {
    event.stopPropagation();
    try {
      await authLogout();
      showAlert("Logout successful", "success");
      setProfileOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      showAlert("Logout failed", "error");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [profileOpen]);

  const getNavLinks = () => {
    if (user?.role === "admin") {
      return (
        <>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/reports">Reports</Link>
          </li>
          
          

          {/* <li>
            <Link to="/messages">Messages</Link>
          </li> */}


          <li>
            <Link to="/admin/management">Management</Link>
          </li>
          {/* <li><Link to="/admin/validations">Management</Link></li> */}
          <li className="notification-link-container">
            <Link to="/notifications">Notifications</Link>
            <NotificationBadge />
          </li>
          <li>
            <Link to="/admin/settings">Console</Link>
          </li>
        </>
      );
    } else if (user?.role === "police") {
      return (
        <>
          <li>
            <Link to="/police/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/police/pending">Pending Cases</Link>
          </li>
          <li className="notification-link-container">
            <Link to="/notifications">Notifications</Link>
            <NotificationBadge />
          </li>
          <li
            className={`alert-link-container ${
              hasActiveAlerts || isOnAlertsPage ? "alert-active" : ""
            }`}
          >
            <Link to="/police/alert">Crime Alerts</Link>
          </li>
          <li>
            <Link to="/police/analytics">Analytics</Link>
          </li>
          <li>
            <Link to="/police/settings">Console</Link>
          </li>

{/* 
          <li>
            <Link to="/messages">Messages</Link>
          </li> */}



        </>
      );
    } else {
      return (
        <>
          {!user && (
            <>
              <li>
                <Link to="/instructions">Instruction</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </>
          )}
          {user && (
            <>
              <li>
                <Link to="/home">Home</Link>
              </li>
              <li>
                <Link to="/report">Report</Link>
              </li>
              <li className="notification-link-container">
                <Link to="/notifications">Notifications</Link>
                <NotificationBadge />
              </li>
              <li
                className={`alert-link-container ${
                  hasActiveAlerts || isOnAlertsPage ? "alert-active" : ""
                }`}
              >
                <Link to="/crime-alerts">Crime Alerts</Link>
              </li>
              <li>
                <Link to="/public/settings">Account</Link>
              </li>

{/* 
              <li>
                <Link to="/messages">Messages</Link>
              </li> */}


            </>
          )}
        </>
      );
    }
  };

  const getHomeLink = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "police") return "/police/dashboard";
    if (user?.role === "public") return "/home";
    return "/instructions";
  };

  const showAuthLinks = () => {
    if (user) {
      return (
        <button onClick={toggleProfilePopup} className="profile-btn">
          <span className="profile-btn-text">
            {user.full_name || user.username || "Guest"}
          </span>
          <span className="profile-btn-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </span>
        </button>
      );
    } else {
      if (location.pathname !== "/" && location.pathname !== "/start") {
        return (
          <div className="auth-buttons-container">
            <Link to="/" className="auth-btn">
              Sign In
            </Link>
            <Link to="/start" className="auth-btn sign-up-btn">
              Sign Up
            </Link>
          </div>
        );
      } else if (location.pathname === "/") {
        return (
          <Link to="/start" className="auth-btn sign-up-btn">
            Sign Up
          </Link>
        );
      } else if (location.pathname === "/start") {
        return (
          <Link to="/" className="auth-btn">
            Sign In
          </Link>
        );
      }
    }
  };

  // Helper function to get rank-specific CSS class
  const getRankClass = () => {
    switch (userRank) {
      case "Silver":
        return "rank-silver";
      case "Gold":
        return "rank-gold";
      case "Platinum":
        return "rank-platinum";
      case "Diamond":
        return "rank-diamond";
      default:
        return "";
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar">
        <Link to={getHomeLink()} className="logo-link">
          <h1 className="logo">Stop Crime.</h1>
        </Link>

        <nav className="nav-menu">
          <ul className="nav-links">{getNavLinks()}</ul>
        </nav>

        <div className="auth-links">{showAuthLinks()}</div>
      </div>

      {profileOpen && (
        <>
          <div
            className="profile-overlay"
            onClick={() => setProfileOpen(false)}
          ></div>
          <div
            className={`profile-popup ${
              user?.role === "admin"
                ? "admin-profile-popup"
                : user?.role === "police"
                ? "police-profile-popup"
                : ""
            }`}
            ref={popupRef}
          >
            <div
              className={`profile-header ${
                user?.role === "admin"
                  ? "admin-profile-header"
                  : user?.role === "police"
                  ? "police-profile-header"
                  : ""
              }`}
            >
              <div
                className={`profile-avatar ${
                  user?.role === "admin"
                    ? "admin-profile-avatar"
                    : user?.role === "police"
                    ? "police-profile-avatar"
                    : ""
                }`}
              >
                {user?.full_name?.charAt(0).toUpperCase() ||
                  user?.username?.charAt(0).toUpperCase() ||
                  "G"}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">
                  {user?.full_name || user?.username || "Guest User"}
                </h2>
                <span
                  className={`profile-role ${
                    user?.role === "admin"
                      ? "admin-profile-role"
                      : user?.role === "police"
                      ? "police-profile-role"
                      : ""
                  }`}
                >
                  {user?.role === "admin"
                    ? "ADMIN"
                    : user?.role === "police"
                    ? "POLICE OFFICER"
                    : user?.role || "Public"}
                </span>
              </div>
            </div>

            {user?.role === "public" && (
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    {userPoints.toLocaleString()}
                  </span>
                  <span className="stat-label">Points</span>
                </div>
                <div className="stat-item">
                  <span className={`stat-value ${getRankClass()}`}>
                    {userRank}
                  </span>
                  <span className="stat-label">Rank</span>
                </div>
              </div>
            )}

            {user?.role === "police" && (
              <div className="police-info">
                <div className="police-info-item">
                  <span className="police-info-label">Police ID</span>
                  <span className="police-info-value">
                    {user?.police_id || user?.badge_number || "N/A"}
                  </span>
                </div>
                <div className="police-info-item">
                  <span className="police-info-label">Rank</span>
                  <span className="police-info-value">
                    {user?.rank || "Officer"}
                  </span>
                </div>
                <div className="police-info-item">
                  <span className="police-info-label">Station</span>
                  <span className="police-info-value">
                    {user?.station || "N/A"}
                  </span>
                </div>
              </div>
            )}

            <div
              className={`profile-actions ${
                user?.role === "admin"
                  ? "admin-profile-actions"
                  : user?.role === "police"
                  ? "police-profile-actions"
                  : ""
              }`}
            >
              <Link
                to={
                  user?.role === "admin"
                    ? "/admin/settings"
                    : user?.role === "police"
                    ? "/police/settings"
                    : "/public/settings"
                }
                className={`action-btn ${
                  user?.role === "admin"
                    ? "admin-action-btn"
                    : user?.role === "police"
                    ? "police-action-btn"
                    : ""
                }`}
                onClick={() => setProfileOpen(false)}
              >
                Account Settings
              </Link>
              <button
                className={`logout-btn ${
                  user?.role === "admin"
                    ? "admin-logout-btn"
                    : user?.role === "police"
                    ? "police-logout-btn"
                    : ""
                }`}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
