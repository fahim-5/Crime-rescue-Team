import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";

const API_URL = "http://localhost:5000";

const TestAlert = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const createTestAlert = async () => {
    try {
      setLoading(true);
      setStatus("Creating test alert...");

      // Create test alert for Dhaka-Mirpur
      const response = await axios.post(
        `${API_URL}/api/crime-alerts`,
        {
          report_id: 2, // Use existing report ID
          type: "Theft",
          location: "Dhaka-Mirpur",
          description: "Test alert for Dhaka-Mirpur area",
          status: "active",
          details: {
            peopleInvolved: 2,
            victimDescription: "Male victim",
            weapons: "No weapons reported",
            dangerLevel: "Medium",
            policeResponse: "Report under review",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        setStatus("Alert created successfully!");
        console.log("Created alert:", response.data);
      } else {
        setStatus(
          "Failed to create alert: " +
            (response.data?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error creating test alert:", error);
      setStatus(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Test Alert Creation</h2>
      <button
        onClick={createTestAlert}
        disabled={loading}
        style={{
          padding: "10px 15px",
          background: "#3498db",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Test Alert for Dhaka-Mirpur"}
      </button>

      {status && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            background: status.includes("Error") ? "#ffeeee" : "#eeffee",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default TestAlert;
