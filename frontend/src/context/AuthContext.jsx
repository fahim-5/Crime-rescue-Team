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
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setToken(userData.token); // Extract token from user data
    }
    setLoading(false); // Once checked, remove loading state
  }, []);

  // Login function
  const login = (userData) => {
    console.log("Storing user in context:", userData); // Debugging
    setUser(userData);
    setToken(userData.token); // Store token in state
    localStorage.setItem("user", JSON.stringify(userData)); // Store user data
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user"); // Remove user from storage
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}{" "}
      {/* Prevents rendering UI before user data is loaded */}
    </AuthContext.Provider>
  );
};

// src/context/useAuth.js
