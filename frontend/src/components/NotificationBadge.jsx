import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./NotificationBadge.css";

const API_URL = "http://localhost:5000";

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [areaAlertCount, setAreaAlertCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (!user || !token) return;

    const fetchUnreadCount = async () => {
      try {
        setLoading(true);
        const notificationsResponse = await axios.get(
          `${API_URL}/api/notifications/unread`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Check for crime alerts in user's area if address is available
        let alertCount = 0;
        if (user.address) {
          try {
            const alertsResponse = await axios.get(
              `${API_URL}/api/crime-alerts/location?location=${encodeURIComponent(
                user.address
              )}&status=active`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (alertsResponse.data && alertsResponse.data.success) {
              alertCount = alertsResponse.data.data.length;
              setAreaAlertCount(alertCount);
            }
          } catch (alertError) {
            console.error("Error fetching area crime alerts:", alertError);
          }
        }

        if (notificationsResponse.data && notificationsResponse.data.success) {
          // Get notification count
          const notificationCount = notificationsResponse.data.data.unreadCount;
          setUnreadCount(notificationCount);
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(intervalId);
  }, [user, token]);

  // Hide badge if count is 0 or still loading
  if (loading || unreadCount === 0) return null;

  return <span className="notification-badge">{unreadCount}</span>;
};

export default NotificationBadge;
