import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import VerificationCodeInput from "../../components/VerificationCodeInput";
import "./ForgotPassword.css";

const ForgotPassword = () => {
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

    if (codeParam && codeParam.length === 6) {
      setVerificationCode(codeParam);
    }

    // Check if we have email in localStorage from a previous attempt
    const savedEmail = localStorage.getItem("resetPasswordEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

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

        // Navigate to reset password page with email and code
        // Use a shorter timeout and catch any navigation errors
        setTimeout(() => {
          try {
            console.log("Navigating to reset password page...");
            navigate("/reset-password-with-code", {
              state: { email, code: verificationCode },
            });
          } catch (error) {
            console.error("Navigation error:", error);
            // Fallback to direct URL with parameters
            window.location.href = `/reset-password-with-code?email=${encodeURIComponent(
              email
            )}&code=${encodeURIComponent(verificationCode)}`;
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
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">
          {!isSubmitted ? "Forgot Password" : "Verify Your Email"}
        </h2>

        {message && (
          <p
            className={isError ? "auth-error-message" : "auth-success-message"}
          >
            {message}
          </p>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="auth-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="button-with-loader">
                  <span className="button-loader"></span>
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>
        ) : !isCodeVerified ? (
          <div className="verification-container">
            <p className="auth-description">
              Enter the 6-digit verification code sent to:
              <strong> {email}</strong>
            </p>

            <VerificationCodeInput
              length={6}
              onChange={setVerificationCode}
              autoFocus={true}
            />

            <button
              onClick={handleVerifyCode}
              className="auth-button"
              disabled={isVerifyingCode || verificationCode.length !== 6}
            >
              {isVerifyingCode ? (
                <div className="button-with-loader">
                  <span className="button-loader"></span>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="auth-action-links">
              <button
                onClick={handleResendCode}
                className="text-button"
                disabled={isSubmitting}
              >
                Didn't receive a code? Resend
              </button>
            </div>
          </div>
        ) : (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <p className="success-message">
              Code verified successfully! Redirecting to reset password...
            </p>

            {/* Fallback button in case automatic navigation fails */}
            <div className="auth-action-links" style={{ marginTop: "20px" }}>
              <Link
                to="/reset-password-with-code"
                state={{ email, code: verificationCode }}
                className="auth-button"
              >
                Continue to Reset Password
              </Link>

              <button
                onClick={() => {
                  window.location.href = `/reset-password-with-code?email=${encodeURIComponent(
                    email
                  )}&code=${encodeURIComponent(verificationCode)}`;
                }}
                className="text-button"
                style={{ marginTop: "10px" }}
              >
                If redirection fails, click here
              </button>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
