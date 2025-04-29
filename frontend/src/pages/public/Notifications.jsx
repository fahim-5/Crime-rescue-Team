import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import styles from "./Notifications.module.css";
import {
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBell,
  FiEye,
  FiArchive,
  FiLoader,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";

const API_URL = "http://localhost:5000";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch notifications when component mounts
  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    fetchNotifications();
  }, [user, token, navigate]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.success) {
        // Format the timestamp to a more readable format
        const formattedNotifications = response.data.data.notifications.map(
          (notification) => ({
            ...notification,
            timestamp: formatTimestamp(notification.created_at),
            read: notification.is_read,
          })
        );

        setNotifications(formattedNotifications);
      } else {
        setError("Failed to load notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err.response?.data?.message ||
          "Error loading notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp to relative time (e.g., "2 hours ago")
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.round(diffMs / 1000);
      const diffMin = Math.round(diffSec / 60);
      const diffHour = Math.round(diffMin / 60);
      const diffDay = Math.round(diffHour / 24);

      if (diffSec < 60) {
        return `${diffSec} seconds ago`;
      } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
      } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
      } else if (diffDay < 7) {
        return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Unknown date";
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Update the local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(
        err.response?.data?.message || "Failed to mark notification as read"
      );
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Check if there are any unread notifications
      const hasUnreadNotifications = notifications.some(
        (notification) => !notification.read
      );

      if (!hasUnreadNotifications) {
        // Show alert message if there are no unread notifications
        setError("No unread notifications to mark as read");

        // Clear the error message after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);

        return;
      }

      // Correct endpoint for marking all notifications as read
      const response = await axios.put(
        `${API_URL}/api/notifications/all/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Update the local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            read: true,
          }))
        );
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError(
        err.response?.data?.message ||
          "Failed to mark all notifications as read"
      );

      // Clear the error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Remove from local state
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification.id !== notificationId
          )
        );
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError(err.response?.data?.message || "Failed to delete notification");
    }
  };

  // View notification details (for example, navigate to related content)
  const viewDetails = (notification) => {
    // If not read, mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type and related_id
    if (notification.related_id) {
      // Determine the correct route based on notification type/title
      let route = `/report/${notification.related_id}`;

      // For report-related notifications
      if (
        notification.title.includes("Report") ||
        notification.message.includes("report") ||
        notification.message.includes("case")
      ) {
        // Base route is /report/:id for regular users
        if (user?.role === "police") {
          // For police users, they should see the police version of the report
          navigate(`/police/reports/detail/${notification.related_id}`);
          return;
        } else if (user?.role === "admin") {
          // For admin users, they should see the admin version of the report
          navigate(`/admin/reports/detail/${notification.related_id}`);
          return;
        }
      }

      // Default navigation to report detail
      navigate(route);
    } else {
      // If no related_id, just navigate to the appropriate section
      if (notification.title.includes("Report")) {
        navigate("/reports");
      } else if (notification.title.includes("Alert")) {
        navigate("/alert");
      } else {
        // Generic fallback
        navigate("/notifications");
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return <FiAlertCircle className={styles.notificationIcon} />;
      case "warning":
        return <FiAlertTriangle className={styles.notificationIcon} />;
      case "info":
        return <FiInfo className={styles.notificationIcon} />;
      case "success":
        return <FiCheckCircle className={styles.notificationIcon} />;
      default:
        return <FiBell className={styles.notificationIcon} />;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinnerIcon} />
          <p>Loading notifications...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Notifications Center</h1>
        <p className={styles.subtitle}>
          Important alerts and community updates
        </p>
        {notifications.length > 0 && (
          <div className={styles.headerActions}>
            <button
              className={`${styles.actionButton} ${styles.secondary}`}
              onClick={markAllAsRead}
            >
              <FiCheck /> Mark All as Read
            </button>
          </div>
        )}
      </header>

      {error && (
        <div className={styles.alertNotification}>
          <FiAlertTriangle />
          {error}
        </div>
      )}

      {notifications.length > 0 ? (
        <div className={styles.list}>
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`${styles.notification} ${styles[notification.type]}`}
              onClick={() => viewDetails(notification)}
            >
              {!notification.read && <div className={styles.unreadIndicator} />}

              <div className={styles.content}>
                <h3 className={styles.notificationTitle}>
                  {getNotificationIcon(notification.type)}
                  {notification.title}
                </h3>
                <p className={styles.message}>{notification.message}</p>

                {notification.related_id && (
                  <div className={styles.crimeId}>
                    Crime ID: {notification.related_id}
                  </div>
                )}
              </div>

              <div className={styles.meta}>
                <span className={styles.timestamp}>
                  <FiClock />
                  {notification.timestamp}
                </span>
                {!notification.read && (
                  <span className={styles.unreadBadge}>New</span>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  className={`${styles.actionButton} ${styles.secondary} ${styles.tooltip}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                >
                  <FiArchive /> Archive
                  <span className={styles.tooltipText}>
                    Remove this notification
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FiBell className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No notifications</h3>
          <p className={styles.emptyMessage}>
            You're all caught up! When new alerts or updates arrive, they'll
            appear here.
          </p>
          <button
            className={`${styles.actionButton} ${styles.primary} ${styles.refreshButton}`}
            onClick={() => window.location.reload()}
          >
            <FiLoader /> Refresh
          </button>
        </div>
      )}
    </main>
  );
};

export default Notifications;
