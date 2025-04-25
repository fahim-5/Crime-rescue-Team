import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import VerificationCodeInput from "../../components/VerificationCodeInput";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const location = useLocation();
  const [mode, setMode] = useState("forgot"); // "forgot" or "change"
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const navigate = useNavigate();

  // Auto-detect if code is pasted in URL or stored in localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    const modeParam = params.get("mode");

    if (modeParam === "change") {
      setMode("change");
    }

    if (codeParam && codeParam.length === 6) {
      setVerificationCode(codeParam);
    }

    // Check if we have email in localStorage from a previous attempt
    const savedEmail = localStorage.getItem("resetPasswordEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }

    // If user navigated from Settings with state, use that
    if (location.state && location.state.mode === "change") {
      setMode("change");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setIsSubmitted(true);
        // Store the email in localStorage for convenience
        localStorage.setItem("resetPasswordEmail", email);

        // If in development mode and the API returned a code
        if (response.data.dev_reset_code) {
          setMessage(
            `${response.data.message}. DEV MODE: Your verification code is: ${response.data.dev_reset_code}`
          );
          // Auto-fill the code in development mode
          setVerificationCode(response.data.dev_reset_code);
        }
      } else {
        setIsError(true);
        setMessage(response.data.message || "Failed to send reset email");
      }
    } catch (error) {
      setIsError(true);
      if (error.response && error.response.data) {
        setMessage(error.response.data.message || "Failed to send reset email");
      } else {
        setMessage("An error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setIsError(true);
      setMessage("Please enter a valid 6-digit verification code.");
      return;
    }

    setIsVerifyingCode(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-reset-code",
        { email, code: verificationCode },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setIsCodeVerified(true);
        setMessage("Code verified successfully!");

        console.log("Code verified successfully, preparing to navigate...");

        // Store verified data in localStorage as a fallback
        localStorage.setItem("resetPasswordEmail", email);
        localStorage.setItem("resetPasswordCode", verificationCode);
        localStorage.setItem("resetPasswordMode", mode);

        // Navigate to reset password page with email and code
        // Use a shorter timeout and catch any navigation errors
        setTimeout(() => {
          try {
            console.log("Navigating to reset password page...");
            navigate("/reset-password-with-code", {
              state: { email, code: verificationCode, mode },
            });
          } catch (error) {
            console.error("Navigation error:", error);
            // Fallback to direct URL with parameters
            window.location.href = `/reset-password-with-code?email=${encodeURIComponent(
              email
            )}&code=${encodeURIComponent(verificationCode)}&mode=${mode}`;
          }
        }, 500);
      } else {
        setIsError(true);
        setMessage(response.data.message || "Invalid verification code");
      }
    } catch (error) {
      setIsError(true);
      if (error.response && error.response.data) {
        setMessage(error.response.data.message || "Failed to verify code");
      } else {
        setMessage("An error occurred. Please try again later.");
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setMessage("A new verification code has been sent to your email.");
        // If in development mode and the API returned a code
        if (response.data.dev_reset_code) {
          setMessage(
            `A new code has been sent. DEV MODE: Your verification code is: ${response.data.dev_reset_code}`
          );
          setVerificationCode(response.data.dev_reset_code);
        }
      } else {
        setIsError(true);
        setMessage(response.data.message || "Failed to send a new code");
      }
    } catch (error) {
      setIsError(true);
      if (error.response && error.response.data) {
        setMessage(error.response.data.message || "Failed to send a new code");
      } else {
        setMessage("An error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pwd-recovery-container">
      <div className="pwd-recovery-card">
        <div className="pwd-recovery-content">
          <h2 className="pwd-recovery-title">
            {!isSubmitted
              ? mode === "change"
                ? "Change Password"
                : "Forgot Password"
              : "Verify Your Email"}
          </h2>

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
                <label htmlFor="email" className="pwd-recovery-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="pwd-recovery-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                className="pwd-recovery-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : `Send Verification Code`}
              </button>

              <div className="pwd-recovery-links">
                <p>
                  Remember your password?{" "}
                  <Link to="/login" className="pwd-recovery-link">
                    Log In
                  </Link>
                </p>
                {mode === "change" && (
                  <p>
                    <Link to="/settings" className="pwd-recovery-link">
                      Back to Settings
                    </Link>
                  </p>
                )}
              </div>
            </form>
          ) : !isCodeVerified ? (
            <div className="pwd-recovery-verification">
              <p className="pwd-recovery-verification-message">
                {mode === "change"
                  ? "We've sent a verification code to your email to confirm your password change request."
                  : "We've sent a verification code to your email. Please enter it below to continue."}
              </p>

              <VerificationCodeInput
                value={verificationCode}
                onChange={setVerificationCode}
              />

              <div className="pwd-recovery-verification-actions">
                <button
                  className="pwd-recovery-button"
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || verificationCode.length !== 6}
                >
                  {isVerifyingCode ? "Verifying..." : "Verify Code"}
                </button>

                <button
                  className="pwd-recovery-text-button"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Resend Code"}
                </button>
              </div>
            </div>
          ) : (
            <div className="pwd-recovery-verification">
              <div className="pwd-recovery-success-icon">✓</div>
              <p className="pwd-recovery-verification-message">
                {mode === "change"
                  ? "Your identity has been verified! Redirecting to change your password..."
                  : "Code verified successfully! Redirecting to reset your password..."}
              </p>

              <div className="pwd-recovery-verification-actions">
                <Link
                  to="/reset-password-with-code"
                  state={{ email, code: verificationCode, mode }}
                  className="pwd-recovery-button"
                >
                  {mode === "change"
                    ? "Continue to Change Password"
                    : "Continue to Reset Password"}
                </Link>
              </div>
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

export default ForgotPassword;
