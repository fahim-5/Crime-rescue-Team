import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // Correctly import the AuthContext

// Custom hook for accessing the authentication data
export const useAuth = () => {
  return useContext(AuthContext); // Access and return the context value (user, login, logout)
};