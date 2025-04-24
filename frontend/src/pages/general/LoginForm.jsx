import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth"; // Assuming the context exists
import "./LoginForm.css"; // Ensure isolated styling

const LoginForm = () => {
  const { login } = useAuth(); // Extract login function from context to set user in state
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!credentials.email || !credentials.password || !credentials.role) {
      setError("All fields are required.");
      return;
    }

    try {
      console.log("Attempting login with:", {
        email: credentials.email.toLowerCase().trim(),
        role: credentials.role,
      });

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password,
          role: credentials.role,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        console.log("Login response data:", response.data);
        console.log("User data received:", user);
        login({ token, ...user }); // Update auth context
        setSuccess("Login successful! Redirecting...");

        // Role-based redirection
        setTimeout(() => {
          switch (user.role) {
            case "admin":
              navigate("/admin/dashboard");
              break;
            case "police":
              navigate("/police/dashboard");
              break;
            default:
              navigate("/home");
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Login error:", err);

      let errorMessage = "Login failed. Please check your credentials.";

      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error status:", err.response.status);

        const errorData = err.response.data;

        // Handle specific error codes
        if (errorData.errorCode) {
          switch (errorData.errorCode) {
            case "user_not_found":
              errorMessage =
                "No account found with this email address. Please check your email or register for a new account.";
              break;
            case "invalid_password":
              errorMessage = "Incorrect password. Please try again.";
              break;
            case "role_mismatch":
              errorMessage = `You've selected the wrong account type. You registered as a ${errorData.correctRole}. Please select the correct account type.`;

              // Auto-select the correct role if available
              if (errorData.correctRole) {
                setCredentials({
                  ...credentials,
                  role: errorData.correctRole,
                });
              }
              break;
            case "account_not_approved":
              if (errorData.status === "pending") {
                errorMessage =
                  "Your account is pending approval. Please wait for an administrator to approve your account.";
              } else if (errorData.status === "rejected") {
                errorMessage =
                  "Your account has been rejected. Please contact support.";
              } else {
                errorMessage =
                  "Your account is not active. Please contact support.";
              }
              break;
            default:
              errorMessage = errorData.message || errorMessage;
          }
        } else {
          // Fall back to basic status code handling
          if (err.response.status === 401) {
            errorMessage = "Invalid email or password. Please try again.";
          } else if (err.response.status === 403) {
            if (err.response.data.status === "pending") {
              errorMessage =
                "Your account is pending approval. Please wait for an administrator to approve your account.";
            } else if (err.response.data.status === "rejected") {
              errorMessage =
                "Your account has been rejected. Please contact support.";
            } else if (
              err.response.data.message &&
              err.response.data.message.includes("Access denied")
            ) {
              errorMessage =
                "You've selected the wrong role for your account. Please select the correct role.";
            } else {
              errorMessage =
                err.response.data.message ||
                "Access denied. Please check your account status.";
            }
          } else {
            errorMessage = err.response.data.message || errorMessage;
          }
        }
      }

      setError(errorMessage);
    }
  };

  return (
    <main className="auth-container">
      <section className="auth-box">
        <h2 className="auth-title">Sign in to Your Account</h2>

        {error && <p className="auth-error-message">{error}</p>}
        {success && <p className="auth-success-message">{success}</p>}

        <form onSubmit={handleLoginSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="auth-email" className="auth-label">
              Email
            </label>
            <input
              type="email"
              id="auth-email"
              name="email"
              className="auth-input"
              placeholder="Enter your email or username"
              value={credentials.email}
              onChange={handleInputChange}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="auth-password" className="auth-label">
              Password
            </label>
            <input
              type="password"
              id="auth-password"
              name="password"
              className="auth-input"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group auth-role-section">
            <label className="auth-label">Select Account Type</label>
            <div className="auth-role-options">
              <label
                className={credentials.role === "public" ? "selected-role" : ""}
              >
                <input
                  type="radio"
                  name="role"
                  value="public"
                  checked={credentials.role === "public"}
                  onChange={handleInputChange}
                />
                <span>👤 Civilian</span>
              </label>
              <label
                className={credentials.role === "police" ? "selected-role" : ""}
              >
                <input
                  type="radio"
                  name="role"
                  value="police"
                  checked={credentials.role === "police"}
                  onChange={handleInputChange}
                />
                <span>👮 Police</span>
              </label>
              <label
                className={credentials.role === "admin" ? "selected-role" : ""}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={credentials.role === "admin"}
                  onChange={handleInputChange}
                />
                <span>⚙️ Admin</span>
              </label>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <a href="/start" className="auth-link">
            Sign Up
          </a>
        </p>
      </section>
    </main>
  );
};

export default LoginForm;
