import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./NotificationBadge.css";

const API_URL = "http://localhost:5000";

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (!user || !token) return;

    const fetchUnreadCount = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/notifications/unread`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.success) {
          setUnreadCount(response.data.data.unreadCount);
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Poll for new notifications every minute
    const intervalId = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(intervalId);
  }, [user, token]);

  if (loading || unreadCount === 0) return null;

  return <span className="notification-badge">{unreadCount}</span>;
};

export default NotificationBadge;
