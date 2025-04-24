import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const PrivateRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/" />;
  }

  // If the user doesn't have the required role, redirect to home page or another default route
  if (user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children; // If everything is fine, render the protected component
};

export default PrivateRoute;
