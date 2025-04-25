import React, { createContext, useState, useEffect } from "react";

// Create the AuthContext
export const AuthContext = createContext();

// AuthContext Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Prevents UI flicker during data loading

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user");
      }
    }

    if (storedToken) {
      setToken(storedToken);
    }

    setLoading(false); // Once checked, remove loading state
  }, []);

  // Login function
  const login = (userData, authToken) => {
    console.log("Storing user in context:", userData); // Debugging
    setUser(userData);

    // If authToken is provided directly, use it
    // Otherwise check if token is in userData
    if (authToken) {
      setToken(authToken);
      localStorage.setItem("token", authToken);
    } else if (userData && userData.token) {
      setToken(userData.token);
      localStorage.setItem("token", userData.token);

      // Remove token from user object before storing to avoid duplication
      const { token: _, ...userWithoutToken } = userData;
      setUser(userWithoutToken);
      localStorage.setItem("user", JSON.stringify(userWithoutToken));
      return;
    }

    // Store user data
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user"); // Remove user from storage
    localStorage.removeItem("token"); // Remove token from storage
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}{" "}
      {/* Prevents rendering UI before user data is loaded */}
    </AuthContext.Provider>
  );
};

// src/context/useAuth.js
