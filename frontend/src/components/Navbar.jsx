import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import NotificationBadge from "./NotificationBadge";
import "./Navbar.css";
import "./profile_popup.css";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const { user, logout: authLogout } = useAuth();

  const toggleProfilePopup = () => setProfileOpen((prev) => !prev);

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

  // Role-based navigation links
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
          <li>
            <Link to="/admin/validations">Validations</Link>
          </li>
          <li className="notification-link-container">
            <Link to="/notifications">Notifications</Link>
            <NotificationBadge />
          </li>
          <li>
            <Link to="/admin/analytics">Analytics</Link>
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
            <Link to="/police/reports">All Reports</Link>
          </li>
          <li>
            <Link to="/police/pending">Pending Cases</Link>
          </li>
          <li className="notification-link-container">
            <Link to="/notifications">Notifications</Link>
            <NotificationBadge />
          </li>
          <li>
            <Link to="/police/resolved">Resolved Cases</Link>
          </li>
          <li>
            <Link to="/police/analytics">Analytics</Link>
          </li>
          <li>
            <Link to="/police/settings">Console</Link>
          </li>
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
              <li>
                <Link to="/alert">Alert</Link>
              </li>
              <li>
                <Link to="/public/settings">Account</Link>
              </li>
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
      // When not on signin/signup pages, show both buttons
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
        // On signin page, show only signup
        return (
          <Link to="/start" className="auth-btn sign-up-btn">
            Sign Up
          </Link>
        );
      } else if (location.pathname === "/start") {
        // On signup page, show only signin
        return (
          <Link to="/" className="auth-btn">
            Sign In
          </Link>
        );
      }
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
          <div className="profile-popup" ref={popupRef}>
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.full_name?.charAt(0).toUpperCase() ||
                  user?.username?.charAt(0).toUpperCase() ||
                  "G"}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">
                  {user?.full_name || user?.username || "Guest User"}
                </h2>
                <span className="profile-role">{user?.role || "Public"}</span>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">1,200</span>
                <span className="stat-label">Points</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">Gold</span>
                <span className="stat-label">Rank</span>
              </div>
            </div>

            <div className="profile-actions">
              <Link
                to={
                  user?.role === "admin"
                    ? "/admin/settings"
                    : "/public/settings"
                }
                className="action-btn"
                onClick={() => setProfileOpen(false)}
              >
                Account Settings
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
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
