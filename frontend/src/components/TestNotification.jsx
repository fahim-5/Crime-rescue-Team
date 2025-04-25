import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API_URL = "http://localhost:5000";

const TestNotification = () => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const { token } = useContext(AuthContext);

  const createTestNotification = async () => {
    try {
      setStatus("loading");

      // Get user ID from token
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenData.userId;

      const response = await axios.post(
        `${API_URL}/api/notifications`,
        {
          user_id: userId,
          type: "info",
          title: "Test Notification",
          message: message || "This is a test notification",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Notification created:", response.data);
      setStatus("success");
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error("Failed to create notification:", error);
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div
      style={{
        margin: "20px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3>Test Notification</h3>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Notification message"
          style={{ padding: "8px", width: "300px", marginRight: "10px" }}
        />
        <button
          onClick={createTestNotification}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Create Test Notification
        </button>
      </div>

      {status === "loading" && <p>Creating notification...</p>}
      {status === "success" && (
        <p style={{ color: "green" }}>Notification created successfully!</p>
      )}
      {status === "error" && (
        <p style={{ color: "red" }}>
          Failed to create notification. Check console for details.
        </p>
      )}
    </div>
  );
};

export default TestNotification;
