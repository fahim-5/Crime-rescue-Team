import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import "./LoginForm.css";

const LoginForm = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      try {
        const parsedCredentials = JSON.parse(savedCredentials);
        setCredentials({
          email: parsedCredentials.email || "",
          password: parsedCredentials.password || "",
          role: parsedCredentials.role || "",
        });
        setRememberMe(true);
      } catch (e) {
        console.error("Error parsing saved credentials:", e);
        localStorage.removeItem("savedCredentials");
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
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

        if (rememberMe) {
          localStorage.setItem(
            "savedCredentials",
            JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              role: credentials.role,
            })
          );
        } else {
          localStorage.removeItem("savedCredentials");
        }

        // Store token separately from user data
        localStorage.setItem("token", token);

        // Call login with user data and token separately
        login(user, token);

        setSuccess("Login successful! Redirecting...");

        // Add console logs to debug user data
        console.log("Login successful with user ID:", user.id);
        console.log("User role:", user.role);
        console.log("Token received:", token.substring(0, 20) + "...");

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
        const errorData = err.response.data;
        if (errorData.errorCode) {
          switch (errorData.errorCode) {
            case "user_not_found":
              errorMessage = "No account found with this email address.";
              break;
            case "invalid_password":
              errorMessage = "Incorrect password. Please try again.";
              break;
            case "role_mismatch":
              errorMessage = `You've selected the wrong account type. You registered as a ${errorData.correctRole}.`;
              if (errorData.correctRole) {
                setCredentials({
                  ...credentials,
                  role: errorData.correctRole,
                });
              }
              break;
            case "account_not_approved":
              if (errorData.status === "pending") {
                errorMessage = "Your account is pending approval.";
              } else if (errorData.status === "rejected") {
                errorMessage = "Your account has been rejected.";
              }
              break;
            default:
              errorMessage = errorData.message || errorMessage;
          }
        } else {
          if (err.response.status === 401) {
            errorMessage = "Invalid email or password.";
          } else if (err.response.status === 403) {
            errorMessage = "Access denied. Please check your account status.";
          }
        }
      }
      setError(errorMessage);
    }
  };

  return (
    <main className="pro-auth-container">
      <div className="pro-auth-box">
        <div className="pro-auth-header">
          <h2 className="pro-auth-title">Secure Login</h2>
          <p className="pro-auth-subtitle">Access your account dashboard</p>
        </div>
        
        {error && <p className="pro-auth-error-message">{error}</p>}
        {success && <p className="pro-auth-success-message">{success}</p>}

        <form onSubmit={handleLoginSubmit} className="pro-auth-form">
          <div className="pro-input-group">
            <input
              type="email"
              name="email"
              className="pro-auth-input"
              placeholder="Email address"
              value={credentials.email}
              onChange={handleInputChange}
              required
              autoFocus
            />
          </div>

          <div className="pro-input-group">
            <input
              type="password"
              name="password"
              className="pro-auth-input"
              placeholder="Password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="pro-input-group pro-auth-role-section">
            <label className="pro-auth-label">Account Type</label>
            <div className="pro-auth-role-options">
              <label
                className={credentials.role === "public" ? "pro-selected-role" : ""}
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
                className={credentials.role === "police" ? "pro-selected-role" : ""}
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
                className={credentials.role === "admin" ? "pro-selected-role" : ""}
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

          <div className="pro-auth-options-container">
            <label className="pro-remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleCheckboxChange}
                className="pro-remember-me-checkbox"
              />
              <span className="pro-remember-me-text">Remember me</span>
            </label>
            <a href="/forgot-password" className="pro-forgot-password-link">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="pro-auth-button">
            Sign In
          </button>
        </form>

        <p className="pro-auth-footer">
          Don't have an account?{" "}
          <a href="/start" className="pro-auth-link">
            Create Account
          </a>
        </p>
      </div>
    </main>
  );
};

export default LoginForm;