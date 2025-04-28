import React, { useState, useEffect } from "react";

const TestApi = () => {
  const [status, setStatus] = useState("idle");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Get the API URL dynamically - will work in development and production
  const getApiUrl = () => {
    const apiPort = 5000;
    const host = window.location.hostname;
    return `http://${host}:${apiPort}/api`;
  };

  // Health check function
  const checkHealthEndpoint = async () => {
    try {
      setStatus("loading");
      setError(null);

      const response = await fetch(`${getApiUrl()}/health`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      setResponse(data);
      setStatus("success");
    } catch (err) {
      console.error("Health check failed:", err);
      setError(err.toString());
      setStatus("error");
    }
  };

  // Direct API test without credentials
  const testDirectApi = async () => {
    try {
      setStatus("loading");
      setError(null);

      const response = await fetch(`${getApiUrl()}/reports`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Server responded with ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      setResponse(data);
      setStatus("success");
    } catch (err) {
      console.error("API test failed:", err);
      setError(err.toString());
      setStatus("error");
    }
  };

  // Admin API test
  const testAdminApi = async () => {
    try {
      setStatus("loading");
      setError(null);

      const response = await fetch(`${getApiUrl()}/reports/admin`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Server responded with ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      setResponse(data);
      setStatus("success");
    } catch (err) {
      console.error("Admin API test failed:", err);
      setError(err.toString());
      setStatus("error");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>API Connection Test</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Backend Connection Tests</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={checkHealthEndpoint}
            style={{
              padding: "8px 16px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Test Health Endpoint
          </button>

          <button
            onClick={testDirectApi}
            style={{
              padding: "8px 16px",
              background: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Test Public Reports API
          </button>

          <button
            onClick={testAdminApi}
            style={{
              padding: "8px 16px",
              background: "#F44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Test Admin Reports API
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Status: {status}</h2>
        {status === "loading" && <p>Loading...</p>}
        {status === "error" && (
          <div
            style={{
              background: "#FFEBEE",
              padding: "15px",
              borderRadius: "4px",
            }}
          >
            <h3>Error</h3>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {error}
            </pre>
          </div>
        )}
        {status === "success" && (
          <div
            style={{
              background: "#E8F5E9",
              padding: "15px",
              borderRadius: "4px",
            }}
          >
            <h3>Success</h3>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#f5f5f5",
          padding: "15px",
          borderRadius: "4px",
        }}
      >
        <h2>Network Troubleshooting</h2>
        <ol style={{ lineHeight: "1.6" }}>
          <li>
            <strong>Check if backend server is running</strong>
            <p>Make sure your Express server is running on port 3000.</p>
          </li>
          <li>
            <strong>Check browser console for CORS errors</strong>
            <p>Look for specific error messages about cross-origin requests.</p>
          </li>
          <li>
            <strong>Check authentication</strong>
            <p>
              If you get a 401/403 response, you may not be properly
              authenticated as an admin.
            </p>
          </li>
          <li>
            <strong>Check network firewall</strong>
            <p>
              Make sure your firewall isn't blocking connections to
              localhost:3000.
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default TestApi;
