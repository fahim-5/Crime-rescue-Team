import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./NotificationBadge.css"; // Reuse the same styling

const API_URL = "http://localhost:5000";

const CrimeAlertBadge = () => {
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (!user || !token) return;

    const fetchAlertCount = async () => {
      try {
        setLoading(true);

        // Check for crime alerts in user's area if address is available
        if (user.address) {
          // Extract the first part of the address (usually district)
          const district = user.address.split("-")[0]?.trim() || user.address;

          console.log("Fetching alerts for district:", district);

          const alertsResponse = await axios.get(
            `${API_URL}/api/crime-alerts/location?location=${encodeURIComponent(
              district
            )}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (alertsResponse.data && alertsResponse.data.success) {
            const alerts = alertsResponse.data.data;
            console.log("Found alerts:", alerts.length, alerts);
            setAlertCount(alerts.length);
          }
        }
      } catch (error) {
        console.error("Error fetching area crime alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertCount();

    // Poll for new alerts every 30 seconds
    const intervalId = setInterval(fetchAlertCount, 30000);

    return () => clearInterval(intervalId);
  }, [user, token]);

  // For debugging - display alert count in console
  console.log("Alert count:", alertCount);

  // Hide badge if count is 0 or still loading
  if (loading || alertCount === 0) return null;

  return <span className="notification-badge alert-badge">{alertCount}</span>;
};

export default CrimeAlertBadge;
