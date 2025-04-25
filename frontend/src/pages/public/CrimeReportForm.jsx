import React, { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import "./CrimeReportForm.css";
import {
  FaMapMarkerAlt,
  FaTimes,
  FaCheck,
  FaUpload,
  FaCalendarAlt,
  FaUserShield,
  FaInfoCircle,
  FaSpinner,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";

const CrimeReportForm = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [location, setLocation] = useState("");
  const [time, setTime] = useState(new Date());
  const [crimeType, setCrimeType] = useState("theft");
  const [numCriminals, setNumCriminals] = useState("1");
  const [victimGender, setVictimGender] = useState("male");
  const [armed, setArmed] = useState("yes");
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const photoInputRef = React.useRef(null);
  const videoInputRef = React.useRef(null);

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files);

    // Validate file size (max 5MB per file)
    const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      showAlert(
        "Some photos exceed the 5MB size limit and were not included.",
        "error"
      );
    }

    setPhotos((prev) => [...prev, ...validFiles]);
  };

  const handleVideoChange = (event) => {
    const files = Array.from(event.target.files);

    // Validate file size (max 25MB per file)
    const validFiles = files.filter((file) => file.size <= 25 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      showAlert(
        "Some videos exceed the 25MB size limit and were not included.",
        "error"
      );
    }

    setVideos((prev) => [...prev, ...validFiles]);
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    if (type !== "success") {
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const resetForm = () => {
    setLocation("");
    setTime(new Date());
    setCrimeType("theft");
    setNumCriminals("1");
    setVictimGender("male");
    setArmed("yes");
    setPhotos([]);
    setVideos([]);
    setErrors({});

    if (photoInputRef.current) photoInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!time) {
      newErrors.time = "Time is required";
    }

    if (
      !numCriminals ||
      isNaN(parseInt(numCriminals)) ||
      parseInt(numCriminals) < 1
    ) {
      newErrors.numCriminals = "Please enter a valid number (min: 1)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showAlert("Please correct the errors in the form.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("location", location);
      formData.append("time", time.toISOString());
      formData.append("crimeType", crimeType);
      formData.append("numCriminals", numCriminals);
      formData.append("victimGender", victimGender);
      formData.append("armed", armed);

      photos.forEach((photo) => formData.append("photos", photo));
      videos.forEach((video) => formData.append("videos", video));

      console.log(
        "Submitting report with user:",
        user ? `ID: ${user.id}` : "No user"
      );
      console.log(
        "Submitting report with token:",
        token ? token.substring(0, 15) + "..." : "No token"
      );

      // For debugging - show all form data
      for (let [key, value] of formData.entries()) {
        if (key !== "photos" && key !== "videos") {
          console.log(`Form data - ${key}:`, value);
        } else {
          console.log(`Form data - ${key}: [${value.name || "file"}]`);
        }
      }

      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Get response as text first to log it
      const responseText = await response.text();
      console.log("Raw API response:", responseText);

      // Then parse it as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid server response format");
      }

      console.log("Report submission response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit report");
      }

      resetForm();
      showAlert(
        "Report submitted successfully! Law enforcement has been notified.",
        "success"
      );
    } catch (error) {
      console.error("Submission error:", error);
      showAlert(
        error.message || "Failed to submit report. Please try again later.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMapButtonClick = () => {
    if (location.trim()) {
      window.open(
        `https://www.google.com/maps?q=${encodeURIComponent(location)}`,
        "_blank"
      );
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="crime-report-container">
      {alert && (
        <div className="alert-container">
          <div className={`alert-box alert-${alert.type}`}>
            {alert.type === "success" ? (
              <div className="alert-success-content">
                <div className="alert-message-row">
                  <FaCheck className="alert-icon" />
                  <span className="alert-message">{alert.message}</span>
                </div>
                <div className="alert-buttons-row">
                  <button
                    onClick={() => setAlert(null)}
                    className="alert-btn alert-btn-cancel"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => navigate("/reports")}
                    className="alert-btn alert-btn-view"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            ) : (
              <div className="alert-content">
                <FaTimes className="alert-icon" />
                <span className="alert-message">{alert.message}</span>
                <button
                  onClick={() => setAlert(null)}
                  className="alert-close"
                  aria-label="Close alert"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="crime-report-wrapper">
        <div className="crime-report-header">
          <h1>
            <FaUserShield className="header-icon" /> Crime Report Portal
          </h1>
          <p>Help make your community safer by reporting crimes</p>
        </div>

        <div className="crime-report-content">
          <div className="report-form-container">
            <form onSubmit={handleSubmit} className="elegant-form">
              <div className="form-section">
                <h3 className="section-title">
                  <span className="title-icon">1</span>
                  Incident Details
                </h3>

                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    <FaMapMarkerAlt className="input-icon" />
                    Crime Location
                  </label>
                  <div className="location-input-container">
                    <input
                      type="text"
                      id="location"
                      name="location"
                      placeholder="Enter exact location or address"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className={`form-input ${
                        errors.location ? "form-input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="map-button"
                      onClick={handleMapButtonClick}
                      disabled={!location.trim()}
                    >
                      <FaMapMarkerAlt />
                    </button>
                  </div>
                  {errors.location && (
                    <div className="error-message">{errors.location}</div>
                  )}
                  <div className="input-guideline">
                    <FaInfoCircle className="guideline-icon" />
                    <span>
                      Be as specific as possible (e.g., 'Near the fountain at
                      Central Park')
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="time" className="form-label">
                    <FaCalendarAlt className="input-icon" />
                    Time of Crime
                  </label>
                  <div className="datepicker-container">
                    <DatePicker
                      selected={time}
                      onChange={(date) => setTime(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      className={`form-input datepicker-input ${
                        errors.time ? "form-input-error" : ""
                      }`}
                      required
                      placeholderText="Select date and time"
                      maxDate={new Date()}
                    />
                  </div>
                  {errors.time && (
                    <div className="error-message">{errors.time}</div>
                  )}
                  <div className="input-guideline">
                    <FaInfoCircle className="guideline-icon" />
                    <span>
                      If exact time is unknown, provide your best estimate
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">
                  <span className="title-icon">2</span>
                  Crime Information
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="crime-type" className="form-label">
                      Type of Crime
                    </label>
                    <select
                      id="crime-type"
                      name="crime-type"
                      value={crimeType}
                      onChange={(e) => setCrimeType(e.target.value)}
                      required
                      className="form-input"
                    >
                      <option value="theft">Theft</option>
                      <option value="assault">Assault</option>
                      <option value="robbery">Robbery</option>
                      <option value="homicide">Homicide</option>
                      <option value="vandalism">Vandalism</option>
                      <option value="burglary">Burglary</option>
                      <option value="fraud">Fraud</option>
                      <option value="cybercrime">Cybercrime</option>
                      <option value="drug">Drug-related</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="input-guideline">
                      <FaInfoCircle className="guideline-icon" />
                      <span>
                        Select the category that best describes the incident
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="num-criminals" className="form-label">
                      Number of Criminals
                    </label>
                    <input
                      type="number"
                      id="num-criminals"
                      name="num-criminals"
                      min="1"
                      value={numCriminals}
                      onChange={(e) => setNumCriminals(e.target.value)}
                      placeholder="Enter number"
                      required
                      className={`form-input ${
                        errors.numCriminals ? "form-input-error" : ""
                      }`}
                    />
                    {errors.numCriminals && (
                      <div className="error-message">{errors.numCriminals}</div>
                    )}
                    <div className="input-guideline">
                      <FaInfoCircle className="guideline-icon" />
                      <span>Estimate if exact number is unknown</span>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="victim-gender" className="form-label">
                      Victim's Gender
                    </label>
                    <select
                      id="victim-gender"
                      name="victim-gender"
                      value={victimGender}
                      onChange={(e) => setVictimGender(e.target.value)}
                      required
                      className="form-input"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="unknown">Prefer not to say</option>
                    </select>
                    <div className="input-guideline">
                      <FaInfoCircle className="guideline-icon" />
                      <span>Helps authorities identify potential patterns</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Are the criminals armed?
                    </label>
                    <div className="radio-group">
                      {["yes", "no", "unknown"].map((value) => (
                        <label key={value} className="radio-label">
                          <input
                            type="radio"
                            name="armed"
                            value={value}
                            checked={armed === value}
                            onChange={() => setArmed(value)}
                            required
                          />
                          <span className="radio-custom"></span>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </label>
                      ))}
                    </div>
                    <div className="input-guideline">
                      <FaInfoCircle className="guideline-icon" />
                      <span>
                        Select 'unknown' if weapon status wasn't visible
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">
                  <span className="title-icon">3</span>
                  Media Evidence
                </h3>

                <div className="form-group">
                  <label htmlFor="crime-photos" className="file-upload-label">
                    <FaUpload className="upload-icon" />
                    Upload Photos (Optional)
                    <span className="file-upload-hint">
                      JPEG, PNG (Max 5MB each)
                    </span>
                  </label>
                  <input
                    type="file"
                    id="crime-photos"
                    name="crime-photos"
                    accept="image/jpeg,image/png,image/jpg"
                    multiple
                    onChange={handlePhotoChange}
                    ref={photoInputRef}
                    className="file-input"
                  />
                  <div className="input-guideline">
                    <FaInfoCircle className="guideline-icon" />
                    <span>
                      Upload clear images showing suspects, vehicles, or crime
                      scene
                    </span>
                  </div>
                  <div className="preview-container">
                    {photos.map((photo, index) => (
                      <div key={index} className="preview-item">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt="Crime Scene"
                          className="preview-image"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="remove-btn"
                          title="Remove photo"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="crime-video" className="file-upload-label">
                    <FaUpload className="upload-icon" />
                    Upload Video (Optional)
                    <span className="file-upload-hint">
                      MP4, MOV (Max 25MB)
                    </span>
                  </label>
                  <input
                    type="file"
                    id="crime-video"
                    name="crime-video"
                    accept="video/mp4,video/quicktime"
                    multiple
                    onChange={handleVideoChange}
                    ref={videoInputRef}
                    className="file-input"
                  />
                  <div className="input-guideline">
                    <FaInfoCircle className="guideline-icon" />
                    <span>
                      Short clips showing suspect activity are most helpful
                    </span>
                  </div>
                  <div className="preview-container">
                    {videos.map((video, index) => (
                      <div key={index} className="preview-item">
                        <video controls className="preview-video">
                          <source
                            src={URL.createObjectURL(video)}
                            type={video.type}
                          />
                        </video>
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="remove-btn"
                          title="Remove video"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="reset-btn" onClick={resetForm}>
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spinner-icon" /> Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="report-guidelines">
            <h3>
              <FaInfoCircle className="guideline-header-icon" /> Reporting
              Guidelines
            </h3>
            <div className="guideline-section">
              <h4>General Information</h4>
              <ul>
                <li>
                  Provide accurate, detailed information to help authorities
                  respond effectively
                </li>
                <li>
                  All reports are reviewed by law enforcement within 24 hours
                </li>
                <li>
                  For emergencies or crimes in progress, call 911 immediately
                </li>
              </ul>
            </div>

            <div className="guideline-section">
              <h4>Location Details</h4>
              <ul>
                <li>
                  Include street names, landmarks, or GPS coordinates when
                  possible
                </li>
                <li>Note the direction suspects were heading when last seen</li>
                <li>
                  Mention if the location is residential, commercial, or public
                  space
                </li>
              </ul>
            </div>

            <div className="guideline-section">
              <h4>Suspect Information</h4>
              <ul>
                <li>
                  Describe physical characteristics (height, build, hair color,
                  tattoos)
                </li>
                <li>Note clothing details (color, style, logos)</li>
                <li>
                  Record any distinctive features (accent, scars, limping)
                </li>
                <li>
                  Mention vehicle details if applicable (make, model, color,
                  license plate)
                </li>
              </ul>
            </div>

            <div className="guideline-section">
              <h4>Media Evidence</h4>
              <ul>
                <li>Ensure photos/videos are clear and well-lit</li>
                <li>Do not alter or edit media files before submission</li>
                <li>Include multiple angles when possible</li>
                <li>Never put yourself in danger to capture evidence</li>
              </ul>
            </div>

            <div className="confidentiality-notice">
              <h4>
                <FaUserShield className="privacy-icon" /> Confidentiality Notice
              </h4>
              <p>
                Your report and personal information are protected under our
                strict privacy policy. All data is encrypted and shared only
                with authorized law enforcement personnel.
              </p>
              <p className="emergency-note">
                If this is an emergency situation requiring immediate police
                response, please call your local emergency number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrimeReportForm;
