import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../pages/general/EmailVerification.css";
import { AiOutlineMail, AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

const EmailVerification = ({ email, onVerified, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus on first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Timer for resend functionality
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  // Handle input changes with auto-focus
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input if value entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle keydown for backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle code pasting
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // If pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setVerificationCode(newCode);
      // Focus on last input
      inputRefs.current[5].focus();
    }
  };

  // Resend verification code
  const handleResend = async () => {
    try {
      setError("");
      setIsSubmitting(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/resend-verification",
        { email },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess("Verification code resent successfully");
        setTimeLeft(60);
        setCanResend(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to resend verification code"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit verification code
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if code is complete
    if (verificationCode.some((digit) => digit === "")) {
      setError("Please enter the full verification code");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const code = verificationCode.join("");

      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-email",
        { email, code },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess("Email verified successfully!");
        // Wait a bit to show success message
        setTimeout(() => {
          if (onVerified) onVerified();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid verification code");
      // Clear code on error
      setVerificationCode(["", "", "", "", "", ""]);
      // Focus first input
      inputRefs.current[0].focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verification-overlay">
      <div className="verification-popup">
        <button
          className="verification-popup-close"
          onClick={onCancel}
          type="button"
          aria-label="Close"
        >
          <AiOutlineClose />
        </button>

        <div className="verification-animation pulse-animation">
          <AiOutlineMail size={70} color="#9e192d" />
        </div>

        <h2 className="verification-title">Email Verification</h2>
        <p className="verification-subtitle">
          We've sent a verification code to <br />
          <span className="verification-email">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="verification-code-container">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                ref={(el) => (inputRefs.current[index] = el)}
                className="verification-code-input"
                required
                disabled={isSubmitting}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {error && <div className="verification-error">{error}</div>}
          {success && <div className="verification-success">{success}</div>}

          <button
            type="submit"
            className="verification-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="verification-timer">
          {!canResend && <span>Resend code in {timeLeft} seconds</span>}
        </div>

        {canResend && (
          <button
            type="button"
            className="verification-resend"
            onClick={handleResend}
            disabled={isSubmitting}
          >
            Resend verification code
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
