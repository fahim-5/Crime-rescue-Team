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
  const [mode, setMode] = useState("reset"); // "reset" or "change"
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
    let modeValue = "reset";

    if (location.state) {
      if (location.state.email) emailValue = location.state.email;
      if (location.state.code) codeValue = location.state.code;
      if (location.state.mode === "change") modeValue = "change";
    }

    if (!emailValue || !codeValue) {
      const searchParams = new URLSearchParams(location.search);
      const urlEmail = searchParams.get("email");
      const urlCode = searchParams.get("code");
      const urlMode = searchParams.get("mode");

      if (urlEmail) emailValue = urlEmail;
      if (urlCode) codeValue = urlCode;
      if (urlMode === "change") modeValue = "change";
    }

    if (!emailValue || !codeValue) {
      const storedEmail = localStorage.getItem("resetPasswordEmail");
      const storedCode = localStorage.getItem("resetPasswordCode");
      const storedMode = localStorage.getItem("resetPasswordMode");

      if (storedEmail) emailValue = storedEmail;
      if (storedCode) codeValue = storedCode;
      if (storedMode === "change") modeValue = "change";
    }

    if (emailValue) setEmail(emailValue);
    if (codeValue) setCode(codeValue);
    setMode(modeValue);
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
          mode === "change"
            ? "Your password has been successfully changed. You can now login with your new password."
            : "Your password has been successfully reset. You can now login with your new password."
        );
        setIsError(false);
        setIsSubmitted(true);

        // Clear the stored reset data
        localStorage.removeItem("resetPasswordEmail");
        localStorage.removeItem("resetPasswordCode");
        localStorage.removeItem("resetPasswordMode");

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
            `Failed to ${
              mode === "change" ? "change" : "reset"
            } password. Please try again.`
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
      <div className="pwd-recovery-container">
        <div className="pwd-recovery-card">
          <div className="pwd-recovery-content">
            <h2 className="pwd-recovery-title">
              {mode === "change"
                ? "Change Your Password"
                : "Reset Your Password"}
            </h2>
            <div className="pwd-recovery-message pwd-recovery-error">
              Missing verification information. Please start the{" "}
              {mode === "change" ? "password change" : "password reset"} process
              again.
            </div>
            <div className="pwd-recovery-verification-actions">
              <Link
                to={`/forgot-password${
                  mode === "change" ? "?mode=change" : ""
                }`}
                className="pwd-recovery-button"
              >
                Start Over
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pwd-recovery-container">
      <div className="pwd-recovery-card reset-password-with-code">
        <div className="pwd-recovery-content">
          <h2 className="pwd-recovery-title">
            {mode === "change" ? "Change Password" : "Reset Password"}
          </h2>

          <p className="pwd-recovery-subtitle">
            Please create a new secure password for your account.
          </p>

          {message && (
            <div
              className={`pwd-recovery-message ${
                isError ? "pwd-recovery-error" : "pwd-recovery-success"
              }`}
            >
              {message}
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="pwd-recovery-form">
              <div className="pwd-recovery-form-group">
                <label htmlFor="new-password" className="pwd-recovery-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  name="newPassword"
                  className={`pwd-recovery-input ${
                    validationErrors.newPassword ? "input-error" : ""
                  }`}
                  placeholder="Enter your new password"
                  value={passwords.newPassword}
                  onChange={handleInputChange}
                  required
                  autoFocus
                />
                {validationErrors.newPassword && (
                  <p className="pwd-recovery-input-error">
                    {validationErrors.newPassword}
                  </p>
                )}

                {passwords.newPassword && (
                  <div className="pwd-recovery-strength-meter">
                    <div className="pwd-recovery-meter-bar">
                      <div
                        className={`pwd-recovery-meter-fill strength-${passwordStrength}`}
                      ></div>
                    </div>
                    <span className="pwd-recovery-meter-text">
                      Strength:{" "}
                      {
                        [
                          "Very weak",
                          "Weak",
                          "Fair",
                          "Good",
                          "Strong",
                          "Very strong",
                        ][passwordStrength]
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="pwd-recovery-form-group">
                <label
                  htmlFor="confirm-password"
                  className="pwd-recovery-label"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  className={`pwd-recovery-input ${
                    validationErrors.confirmPassword ? "input-error" : ""
                  }`}
                  placeholder="Confirm your new password"
                  value={passwords.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.confirmPassword && (
                  <p className="pwd-recovery-input-error">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pwd-recovery-requirements">
                <h4 className="pwd-recovery-requirements-title">
                  Password Requirements
                </h4>
                <ul className="pwd-recovery-requirements-list">
                  {Object.entries(criteriaState).map(
                    ([key, { met, requirement }]) => (
                      <li
                        key={key}
                        className={`pwd-recovery-requirement ${
                          met ? "pwd-recovery-requirement-met" : ""
                        }`}
                      >
                        {met ? "✓" : "•"} {requirement}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <button
                type="submit"
                className="pwd-recovery-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="pwd-recovery-spinner"></span>
                    {mode === "change"
                      ? "Changing Password..."
                      : "Resetting Password..."}
                  </>
                ) : mode === "change" ? (
                  "Change Password"
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          ) : (
            <div className="pwd-recovery-verification">
              <div className="pwd-recovery-success-icon">✓</div>
              <h3 className="pwd-recovery-success-title">
                {mode === "change"
                  ? "Password Changed Successfully!"
                  : "Password Reset Successful!"}
              </h3>
              <p className="pwd-recovery-verification-message">{message}</p>
              <p className="pwd-recovery-verification-message">
                You will be redirected to the login page shortly.
              </p>
            </div>
          )}

          <div className="pwd-recovery-footer">
            <p>
              Remember your password?{" "}
              <Link to="/login" className="pwd-recovery-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordWithCode;
