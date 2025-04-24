import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Start.module.css";

const Start = () => {
  const [role, setRole] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [popup, setPopup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const showAlert = (message, duration = 3000) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(""), duration);
  };

  const navigateToRolePage = () => {
    const routes = {
      general: "/public-signup",
      police: "/police-signup",
      admin: "/admin-signup",
    };
    navigate(routes[role]);
  };

  const handleNext = () => {
    if (!role) return showAlert("Please select a role to proceed.");
    if (role === "admin") return setPopup("admin-auth");
    navigateToRolePage();
  };

  const handleAdminSubmit = async () => {
    if (!adminPassword) return showAlert("Password is required");
    if (!adminEmail.includes("@")) return showAlert("Enter a valid email address");
    
    if (adminPassword !== "1234") {
      return showAlert("Incorrect password. Try again.");
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/verification/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail }),
      });
      const data = await response.json();
      if (data.success) {
        setPopup("verification");
        showAlert("Verification code sent to your email", 5000);
      } else {
        showAlert("Failed to send verification code");
      }
    } catch (error) {
      showAlert("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleVerificationSubmit = async () => {
    if (!verificationCode) return showAlert("Verification code is required");
    
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/verification/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, code: verificationCode }),
      });
      const data = await response.json();
      if (data.success) {
        navigateToRolePage();
      } else {
        showAlert("Incorrect verification code");
      }
    } catch (error) {
      showAlert("Verification error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/verification/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("New verification code sent", 5000);
      } else {
        showAlert("Failed to resend code");
      }
    } catch (error) {
      showAlert("Error resending code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.startContainer} onClick={() => setAlertMessage("")}>
      {alertMessage && <div className={styles.alertBox}>{alertMessage}</div>}
      
      <div className={styles.startBox} onClick={(e) => e.stopPropagation()}>
        <h1 className={styles.startHeading}>Guardians of a Secure Future</h1>
        <h3 className={styles.startSubheading}>Are You Ready? 🛡️🔐🚨</h3>
        <p className={styles.startText}>Select Your Role to Continue the Registration</p>
        
        <div className={styles.roleOptions}>
          {["general", "police", "admin"].map((type) => (
            <label key={type} className={styles.roleLabel}>
              <input
                type="radio"
                name="role"
                value={type}
                checked={role === type}
                onChange={(e) => setRole(e.target.value)}
              />
              <span className={styles.roleText}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </label>
          ))}
        </div>
        
        <button className={styles.nextButton} onClick={handleNext}>
          Next
        </button>
      </div>

      {/* Combined Admin Authentication Popup */}
      {popup === "admin-auth" && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <button 
              className={styles.closeButton}
              onClick={() => setPopup(null)}
              aria-label="Close popup"
            >
              &times;
            </button>
            <h3 className={styles.popupTitle}>Admin Verification</h3>
            
            <div className={styles.inputGroup}>
              <label className={styles.popupleavel}>Email</label>
              <input
                type="email"
                className={styles.popupInput}
                placeholder="Your admin email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.popupleavel}>Password</label>
              <input
                type="password"
                className={styles.popupInput}
                placeholder="Admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
            
            <button 
              className={styles.popupConfirm} 
              onClick={handleAdminSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Verify"}
            </button>
          </div>
        </div>
      )}

      {/* Verification Code Popup */}
      {popup === "verification" && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <button 
              className={styles.closeButton}
              onClick={() => setPopup(null)}
              aria-label="Close popup"
            >
              &times;
            </button>
            <h3 className={styles.popupTitle}>Email Verification</h3>
            <p className={styles.verificationText}>
              We sent a 6-digit code to <strong>{adminEmail}</strong>
            </p>
            
            <div className={styles.inputGroup}>
              <label className={styles.verfications}>Verification Code</label>
              <input
                type="text"
                className={styles.popupInput}
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
            
            <div className={styles.popupButtons}>
              <button 
                className={styles.popupConfirm} 
                onClick={handleVerificationSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Submit"}
              </button>
              <button 
                className={styles.popupCancel} 
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Start;