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

        login({ token, ...user });
        setSuccess("Login successful! Redirecting...");

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
              placeholder="Enter your email"
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
              <label className={credentials.role === "public" ? "selected-role" : ""}>
                <input
                  type="radio"
                  name="role"
                  value="public"
                  checked={credentials.role === "public"}
                  onChange={handleInputChange}
                />
                <span>👤 Civilian</span>
              </label>
              <label className={credentials.role === "police" ? "selected-role" : ""}>
                <input
                  type="radio"
                  name="role"
                  value="police"
                  checked={credentials.role === "police"}
                  onChange={handleInputChange}
                />
                <span>👮 Police</span>
              </label>
              <label className={credentials.role === "admin" ? "selected-role" : ""}>
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

          <div className="auth-options-container">
            <div className="remember-me-container">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleCheckboxChange}
                  className="remember-me-checkbox"
                />
                <span className="remember-me-text">Remember me</span>
              </label>
            </div>
            <div className="forgot-password-container">
              <a href="/forgot-password" className="forgot-password-link">
                Forgot password?
              </a>
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