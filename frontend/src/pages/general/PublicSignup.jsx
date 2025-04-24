import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const PublicSignup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    national_id: "",
    passport: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "password" || name === "confirmPassword"
          ? value
          : value.trim(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    const requiredFields = [
      "full_name",
      "username",
      "email",
      "national_id",
      "mobile",
      "password",
      "confirmPassword",
      "address",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/^[a-zA-Z\s]+-[a-zA-Z\s]+$/.test(formData.address)) {
      setError(
        "Address must be in format: District-Thana (e.g., Dhaka-Mirpur)"
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          ...formData,
          mobile_no: formData.mobile, // Map to backend field name
          role: "public",
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data);

      // Handle different types of error responses
      const errorResponse = err.response?.data;

      if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
        // If we have validation errors as an array, show the first one
        setError(errorResponse.errors[0]?.message || "Validation failed");
      } else if (errorResponse?.message) {
        // If there's an error message directly on the response
        setError(errorResponse.message);
      } else {
        // Default error message
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <main className="auth-signup-container">
      <section className="auth-signup-box">
        <h2 className="auth-signup-title">Create Your Account</h2>
        <h3 className="auth-signup-indication">As a Civilian</h3>
        {error && <p className="auth-error-message">{error}</p>}
        {success && <p className="auth-success-message">{success}</p>}

        <form onSubmit={handleSubmit} className="auth-signup-form">
          <div className="auth-left">
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="auth-input"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            <label className="auth-label">Username</label>
            <input
              type="text"
              name="username"
              className="auth-input"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <label className="auth-label">Email</label>
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label className="auth-label">National ID</label>
            <input
              type="text"
              name="national_id"
              className="auth-input"
              placeholder="Enter your National ID"
              value={formData.national_id}
              onChange={handleChange}
              required
            />

            <label className="auth-label">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              className="auth-input"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-right">
            <label className="auth-label">Address (District-Thana)</label>
            <input
              type="text"
              name="address"
              className="auth-input"
              placeholder="Enter your address (e.g., Dhaka-Mirpur)"
              value={formData.address}
              onChange={handleChange}
              required
            />

            <label className="auth-label">Passport (Optional)</label>
            <input
              type="text"
              name="passport"
              className="auth-input"
              placeholder="Enter your passport number (if applicable)"
              value={formData.passport}
              onChange={handleChange}
            />

            <label className="auth-label">Password</label>
            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label className="auth-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="auth-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-signup-button">
            Sign Up
          </button>
        </form>

        <p className="auth-signup-footer">
          Already have an account?{" "}
          <span className="auth-signup-link" onClick={() => navigate("/")}>
            Log in
          </span>
        </p>
      </section>
    </main>
  );
};

export default PublicSignup;
