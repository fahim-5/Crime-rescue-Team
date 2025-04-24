import React, { useState } from "react";
import styles from "./Settings.module.css";
import axios from "axios";

const PoliceSettings = () => {
  // Sample user data - in a real app, this would come from your backend/context
  const [userData, setUserData] = useState({
    id: "USR-2023-001",
    username: "crimefighter123",
    email: "user@crime-rescue-bd.com",
    fullName: "Abdul Rahman",
    phone: "+8801712345678",
    nid: "1990123456789",
    address: "123 Mirpur Road, Dhaka",
    joinDate: "15 Jan 2022",
    lastLogin: "2 hours ago",
  });

  const [editMode, setEditMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempUserData, setTempUserData] = useState({ ...userData });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUserData({
      ...tempUserData,
      [name]: value,
    });
  };

  const handleSaveChanges = () => {
    setUserData(tempUserData);
    setEditMode(false);
    // Here you would typically make an API call to update the user data
  };

  const handleCancelEdit = () => {
    setTempUserData({ ...userData });
    setEditMode(false);
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Authentication error. Please log in again.");
          return;
        }

        const response = await axios.delete(
          "http://localhost:5000/api/auth/account",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Clear local storage and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          alert(
            "Your account has been successfully deleted. You will now be redirected."
          );
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Account deletion error:", error);
        alert(
          error.response?.data?.message ||
            "Failed to delete account. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.settingsHeader}>Account Settings</h1>

      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Profile Overview</h2>

        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            <span className={styles.avatarInitial}>
              {userData.fullName.charAt(0)}
            </span>
          </div>

          <div className={styles.profileInfo}>
            <h3>{userData.fullName}</h3>
            <p>Username: {userData.username}</p>
            <p>Member since: {userData.joinDate}</p>
            <p>Last active: {userData.lastLogin}</p>

            <button
              className={styles.button}
              onClick={() => setShowProfileModal(true)}
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>

      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Account Security</h2>

        <div className={styles.securityCard}>
          <div className={styles.securityItem}>
            <h3>Password</h3>
            <p>Last changed 3 months ago</p>
            <button className={styles.button}>Change Password</button>
          </div>

          <div className={styles.securityItem}>
            <h3>Two-Factor Authentication</h3>
            <p>Currently disabled</p>
            <button className={styles.button}>Enable 2FA</button>
          </div>
        </div>
      </div>

      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>Danger Zone</h2>
        <button
          className={`${styles.button} ${styles.dangerButton}`}
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>User Profile</h2>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowProfileModal(false);
                  setEditMode(false);
                }}
              >
                &times;
              </button>
            </div>

            <div className={styles.modalBody}>
              {editMode ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={tempUserData.fullName}
                      onChange={handleInputChange}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={tempUserData.email}
                      onChange={handleInputChange}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={tempUserData.phone}
                      onChange={handleInputChange}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Address</label>
                    <textarea
                      name="address"
                      value={tempUserData.address}
                      onChange={handleInputChange}
                      className={styles.textareaField}
                      rows="3"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Full Name:</span>
                    <span className={styles.fieldValue}>
                      {userData.fullName}
                    </span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Username:</span>
                    <span className={styles.fieldValue}>
                      {userData.username}
                    </span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Email:</span>
                    <span className={styles.fieldValue}>{userData.email}</span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Phone:</span>
                    <span className={styles.fieldValue}>{userData.phone}</span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>NID:</span>
                    <span className={styles.fieldValue}>{userData.nid}</span>
                  </div>

                  <div className={styles.profileField}>
                    <span className={styles.fieldLabel}>Address:</span>
                    <span className={styles.fieldValue}>
                      {userData.address}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              {editMode ? (
                <>
                  <button
                    className={`${styles.button} ${styles.saveButton}`}
                    onClick={handleSaveChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles.button} ${styles.cancelButton}`}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.button}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => setShowProfileModal(false)}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceSettings;
