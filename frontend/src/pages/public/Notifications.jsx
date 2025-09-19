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

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    fetchNotifications();
  }, [user, token, navigate]);

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
        return "Just now";
      } else if (diffMin < 60) {
        return `${diffMin} min ago`;
      } else if (diffHour < 24) {
        return `${diffHour} hr ago`;
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

  const markAllAsRead = async () => {
    try {
      const hasUnreadNotifications = notifications.some(
        (notification) => !notification.read
      );

      if (!hasUnreadNotifications) {
        setError("No unread notifications to mark as read");
        setTimeout(() => setError(null), 3000);
        return;
      }

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
      setTimeout(() => setError(null), 3000);
    }
  };

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

  const viewDetails = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.related_id) {
      let route = `/report/${notification.related_id}`;

      if (
        notification.title.includes("Report") ||
        notification.message.includes("report") ||
        notification.message.includes("case")
      ) {
        if (user?.role === "police") {
          navigate(`/police/reports/detail/${notification.related_id}`);
          return;
        } else if (user?.role === "admin") {
          navigate(`/admin/reports/detail/${notification.related_id}`);
          return;
        }
      }

      navigate(route);
    } else {
      if (notification.title.includes("Report")) {
        navigate("/reports");
      } else if (notification.title.includes("Alert")) {
        navigate("/alert");
      } else {
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

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinnerIcon} />
          <p>Loading your notifications...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>
            Stay updated with important alerts and community updates
          </p>
        </div>
        
        {notifications.length > 0 && (
          <button
            className={styles.markAllReadButton}
            onClick={markAllAsRead}
          >
            <FiCheck /> Mark All as Read
          </button>
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
              
              <div className={styles.iconContainer}>
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className={styles.content}>
                <h3 className={styles.notificationTitle}>
                  {notification.title}
                </h3>
                <p className={styles.message}>{notification.message}</p>
                
                {notification.related_id && (
                  <div className={styles.crimeId}>
                    Case ID: {notification.related_id}
                  </div>
                )}
                
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
                    className={`${styles.actionButton} ${styles.primary}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      viewDetails(notification);
                    }}
                  >
                    <FiEye /> View Details
                  </button>
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
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FiBell className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No notifications yet</h3>
          <p className={styles.emptyMessage}>
            You're all caught up! When new alerts or updates arrive, they'll appear here.
          </p>
          <button
            className={styles.refreshButton}
            onClick={fetchNotifications}
          >
            <FiLoader /> Refresh
          </button>
        </div>
      )}
    </main>
  );
};

export default Notifications;