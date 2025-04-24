import React, { createContext, useState, useEffect } from "react";

// Create the AuthContext
export const AuthContext = createContext();

// AuthContext Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Prevents UI flicker during data loading

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Once checked, remove loading state
  }, []);

  // Login function
  const login = (userData) => {
    console.log("Storing user in context:", userData); // Debugging
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Store user data
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Remove user from storage
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children} {/* Prevents rendering UI before user data is loaded */}
    </AuthContext.Provider>
  );
};

// src/context/useAuth.js
