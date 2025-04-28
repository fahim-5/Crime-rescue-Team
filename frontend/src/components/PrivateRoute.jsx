import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const PrivateRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  useEffect(() => {
    console.log("PrivateRoute check:", {
      isAuthenticated: !!user,
      userRole: user?.role,
      requiredRole: allowedRole,
      hasAccess: user?.role === allowedRole,
    });
  }, [user, allowedRole]);

  // If no user is logged in, redirect to login page
  if (!user) {
    console.log("PrivateRoute: No authenticated user, redirecting to login");
    return <Navigate to="/" />;
  }

  // If the user doesn't have the required role, redirect to appropriate dashboard
  if (user.role !== allowedRole) {
    console.log(
      `PrivateRoute: User role ${user.role} doesn't match required role ${allowedRole}`
    );

    // Redirect based on user's actual role
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else if (user.role === "police") {
      return <Navigate to="/police/dashboard" />;
    } else if (user.role === "public") {
      return <Navigate to="/home" />;
    }

    return <Navigate to="/" />;
  }

  return children; // If everything is fine, render the protected component
};

export default PrivateRoute;
