import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const PoliceSignup = () => {
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
    police_id: "",
    badge_number: "",
    rank: "",
    station: "",
    joining_date: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'password' || name === 'confirmPassword' ? value : value.trim()
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'full_name', 'username', 'email', 'national_id', 
      'mobile', 'password', 'confirmPassword', 'address',
      'police_id', 'badge_number', 'rank', 'station', 'joining_date'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (!/^[a-zA-Z\s]+-[a-zA-Z\s]+$/.test(formData.address)) {
      setError("Address must be in format: District-Thana (e.g., Dhaka-Mirpur).");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        mobile_no: formData.mobile,
        joining_date: new Date(formData.joining_date).toISOString(),
        role: "police"
      };

      const response = await axios.post(
        "http://localhost:5000/police/signup",
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setSuccess("Registration submitted successfully! Pending approval.");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).map(e => e.msg || e.message).join(', ')
        : err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-signup-container">
    <section className="auth-signup-box">
      <h2 className="auth-signup-title">Create Your Account</h2>
      <h3 className="auth-signup-indication">As a Law Enforcement Officer</h3>
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
        </div>

        <div className="auth-right">

        <label className="auth-label">Enter Police ID</label>
          <input
            type="text"
            name="police_id"
            className="auth-input"
            placeholder="Enter your poilce ID"
            value={formData.police_id}
            onChange={handleChange}
            required
          />
          <label className="auth-label">Badge Number</label>
          <input
            type="text"
            name="badge_number"
            className="auth-input"
            placeholder="Enter your badge number"
            value={formData.badge_number}
            onChange={handleChange}
            required
          />

          <label className="auth-label">Rank</label>
          <input
            type="text"
            name="rank"
            className="auth-input"
            placeholder="Enter your rank"
            value={formData.rank}
            onChange={handleChange}
            required
          />

          <label className="auth-label">Station</label>
          <input
            type="text"
            name="station"
            className="auth-input"
            placeholder="Enter your police station"
            value={formData.station}
            onChange={handleChange}
            required
          />

          <label className="auth-label">Joining Date</label>
          <input
            type="date"
            name="joining_date"
            className="auth-input"
            value={formData.joining_date}
            onChange={handleChange}
            required
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
        Apply for Registration
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

export default PoliceSignup;