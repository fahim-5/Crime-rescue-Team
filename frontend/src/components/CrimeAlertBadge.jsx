import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./NotificationBadge.css"; // Reuse the same styling

const API_URL = "http://localhost:5000";
const ALERT_VISIBILITY_HOURS = 12; // Alerts will be visible for 12 hours

const CrimeAlertBadge = () => {
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasActiveAlerts, setHasActiveAlerts] = useState(false);
  const [hasActiveTimers, setHasActiveTimers] = useState(false);
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

            // Filter alerts that still have time remaining
            const now = new Date();
            const validAlerts = alerts.filter((alert) => {
              const createdTime = new Date(alert.created_at || alert.timestamp);
              const expiryTime = new Date(
                createdTime.getTime() + ALERT_VISIBILITY_HOURS * 60 * 60 * 1000
              );
              return now < expiryTime;
            });

            setAlertCount(validAlerts.length);

            // Check if there are any active alerts by status
            const activeStatusAlerts = alerts.filter(
              (alert) => alert.status === "active"
            );
            setHasActiveAlerts(activeStatusAlerts.length > 0);

            // Set active timers if any alerts have time remaining
            setHasActiveTimers(validAlerts.length > 0);
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

  // Export alert status to global window object so it can be accessed by Navbar
  useEffect(() => {
    // If there are active alerts by status OR active countdown timers, set active state to true
    const isActive = hasActiveAlerts || hasActiveTimers;
    window.hasActiveAlerts = isActive;

    // Dispatch a custom event that the Navbar can listen for
    const event = new CustomEvent("alertsStatusChanged", {
      detail: { hasActiveAlerts: isActive },
    });
    window.dispatchEvent(event);
  }, [hasActiveAlerts, hasActiveTimers]);

  // Always return null - no badge will be displayed
  return null;
};

export default CrimeAlertBadge;
