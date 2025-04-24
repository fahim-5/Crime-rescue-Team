import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./ResetPassword.css";

const ResetPasswordWithCode = () => {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [criteriaState, setCriteriaState] = useState({
    minLength: { met: false, requirement: "At least 8 characters" },
    hasUppercase: { met: false, requirement: "At least one uppercase letter" },
    hasLowercase: { met: false, requirement: "At least one lowercase letter" },
    hasNumber: { met: false, requirement: "At least one number" },
    hasSpecial: { met: false, requirement: "At least one special character" },
    passwordsMatch: { met: false, requirement: "Passwords match" },
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let emailValue = "";
    let codeValue = "";

    if (location.state) {
      if (location.state.email) emailValue = location.state.email;
      if (location.state.code) codeValue = location.state.code;
    }

    if (!emailValue || !codeValue) {
      const searchParams = new URLSearchParams(location.search);
      const urlEmail = searchParams.get("email");
      const urlCode = searchParams.get("code");
      if (urlEmail) emailValue = urlEmail;
      if (urlCode) codeValue = urlCode;
    }

    if (!emailValue || !codeValue) {
      const storedEmail = localStorage.getItem("resetPasswordEmail");
      const storedCode = localStorage.getItem("resetPasswordCode");
      if (storedEmail) emailValue = storedEmail;
      if (storedCode) codeValue = storedCode;
    }

    if (emailValue) setEmail(emailValue);
    if (codeValue) setCode(codeValue);
  }, [location]);

  const validatePassword = (password, confirmPassword) => {
    const newCriteria = {
      minLength: {
        met: password.length >= 8,
        requirement: "At least 8 characters",
      },
      hasUppercase: {
        met: /[A-Z]/.test(password),
        requirement: "At least one uppercase letter",
      },
      hasLowercase: {
        met: /[a-z]/.test(password),
        requirement: "At least one lowercase letter",
      },
      hasNumber: {
        met: /[0-9]/.test(password),
        requirement: "At least one number",
      },
      hasSpecial: {
        met: /[^A-Za-z0-9]/.test(password),
        requirement: "At least one special character",
      },
      passwordsMatch: {
        met: password === confirmPassword && password !== "",
        requirement: "Passwords match",
      },
    };

    const metCriteria = Object.values(newCriteria).filter(
      (criterion) => criterion.met
    ).length;
    const strengthScore =
      metCriteria > 0
        ? Math.min(
            5,
            Math.round(
              (metCriteria - (newCriteria.passwordsMatch.met ? 1 : 0)) * 1.25
            )
          )
        : 0;

    return {
      criteria: newCriteria,
      strength: strengthScore,
    };
  };

  useEffect(() => {
    const { criteria, strength } = validatePassword(
      passwords.newPassword,
      passwords.confirmPassword
    );
    setCriteriaState(criteria);
    setPasswordStrength(strength);
  }, [passwords.newPassword, passwords.confirmPassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !code) {
      setIsError(true);
      setMessage(
        "Missing email or verification code. Please go back to the verification page."
      );
      return;
    }

    const errors = {};
    const { criteria, strength } = validatePassword(
      passwords.newPassword,
      passwords.confirmPassword
    );

    if (!passwords.newPassword) {
      errors.newPassword = "New password is required";
    } else if (!criteria.minLength.met) {
      errors.newPassword = "Password must be at least 8 characters long";
    } else if (strength < 3) {
      errors.newPassword = "Password is too weak. Please make it stronger.";
    }

    if (!passwords.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password-with-code",
        {
          email,
          code,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        setMessage(
          "Your password has been successfully reset. You can now login with your new password."
        );
        setIsError(false);
        setIsSubmitted(true);
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else {
        setIsError(true);
        setMessage(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setIsError(true);

      if (error.response && error.response.data) {
        setMessage(
          error.response.data.message ||
            "Failed to reset password. Please try again."
        );
      } else if (error.request) {
        setMessage(
          "Unable to reach the server. Please check your internet connection and try again."
        );
      } else {
        setMessage("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !code) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <h2 className="reset-password-title">Reset Your Password</h2>
          <div className="error-container">
            <div className="error-icon">!</div>
            <p className="reset-error-message">
              Missing verification information. Please start the password reset
              process again.
            </p>
            <div className="reset-action-links">
              <Link to="/forgot-password" className="reset-button">
                Start Over
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-instructions">
        <h2>Password Reset</h2>
        <p>Please create a new secure password for your account.</p>
        
        <div className="password-tips">
          <h3>Password Tips:</h3>
          <ul>
            <li>Use a combination of letters, numbers, and symbols</li>
            <li>Avoid common words or personal information</li>
            <li>Make it at least 8 characters long</li>
            <li>Consider using a passphrase for better security</li>
          </ul>
        </div>
        
        <div className="security-info">
          <h3>Security Note:</h3>
          <p>Your password must meet the requirements shown to the right.</p>
          <p>After resetting, you'll be automatically logged out of all devices.</p>
        </div>
      </div>
      
      <div className="reset-form-container">
        {!isSubmitted ? (
          <>
            <h2 className="reset-form-title">Create New Password</h2>
            
            {message && (
              <p className={isError ? "reset-error-message" : "reset-success-message"}>
                {message}
              </p>
            )}
            
            <form onSubmit={handleSubmit} className="reset-form">
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  name="newPassword"
                  className={`form-input ${
                    validationErrors.newPassword ? "input-error" : ""
                  }`}
                  placeholder="Enter your new password"
                  value={passwords.newPassword}
                  onChange={handleInputChange}
                  required
                  autoFocus
                />
                {validationErrors.newPassword && (
                  <p className="error-message">{validationErrors.newPassword}</p>
                )}
                
                {passwords.newPassword && (
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div 
                        className={`strength-bar strength-${passwordStrength}`}
                      ></div>
                    </div>
                    <span className="strength-text">
                      Strength: {["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"][passwordStrength]}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  className={`form-input ${
                    validationErrors.confirmPassword ? "input-error" : ""
                  }`}
                  placeholder="Confirm your new password"
                  value={passwords.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.confirmPassword && (
                  <p className="error-message">{validationErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="requirements-box">
                <h4>Password Requirements</h4>
                <ul>
                  {Object.entries(criteriaState).map(([key, { met, requirement }]) => (
                    <li key={key} className={met ? "requirement-met" : ""}>
                      {met ? "✓" : "•"} {requirement}
                    </li>
                  ))}
                </ul>
              </div>
              
              <button 
                type="submit" 
                className="reset-button" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h3>Password Reset Successful!</h3>
            <p>{message}</p>
            <p>You will be redirected to the login page shortly.</p>
          </div>
        )}
        
        <div className="form-footer">
          <p>
            Remember your password?{" "}
            <Link to="/login" className="footer-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordWithCode;