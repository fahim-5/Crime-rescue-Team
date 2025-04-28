import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/useAuth";

/**
 * Custom hook for authenticated API requests
 */
export const useApi = () => {
  const { token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to make authenticated API requests
  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      try {
        setIsLoading(true);
        setError(null);

        // Add authentication header if token exists
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        };

        console.log(`Making authenticated request to ${url}`);
        console.log(`Using token: ${token ? "Yes" : "No"}`);

        const response = await fetch(url, {
          ...options,
          credentials: "include",
          headers,
        });

        // Handle 401 Unauthorized errors by logging out
        if (response.status === 401) {
          console.error("Authentication failed - logging out");
          logout();
          throw new Error("Your session has expired. Please log in again.");
        }

        // Parse JSON response
        const data = await response.json();

        // If the request was not successful, throw an error
        if (!response.ok) {
          throw new Error(
            data.message || `Error ${response.status}: ${response.statusText}`
          );
        }

        return data;
      } catch (err) {
        console.error("API request error:", err);
        setError(err.message || "An unexpected error occurred");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token, logout]
  );

  return {
    fetchWithAuth,
    isLoading,
    error,
    setError,
  };
};

export default useApi;
