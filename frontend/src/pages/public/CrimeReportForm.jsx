import React, { useState } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import styles from "./CrimeReportForm.module.css";
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
        token ? `${token.substring(0, 15)}...` : "No token"
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
    <div className={styles.crimeReportContainer}>
      {alert && (
        <div className={styles.alertContainer}>
          <div className={`${styles.alertBox} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}>
            {alert.type === "success" ? (
              <div className={styles.alertSuccessContent}>
                <div className={styles.alertMessageRow}>
                  <FaCheck className={styles.alertIcon} />
                  <span className={styles.alertMessage}>{alert.message}</span>
                </div>
                <div className={styles.alertButtonsRow}>
                  <button
                    onClick={() => setAlert(null)}
                    className={`${styles.alertBtn} ${styles.alertBtnCancel}`}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => navigate("/reports")}
                    className={`${styles.alertBtn} ${styles.alertBtnView}`}
                  >
                    View Reports
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.alertContent}>
                <FaTimes className={styles.alertIcon} />
                <span className={styles.alertMessage}>{alert.message}</span>
                <button
                  onClick={() => setAlert(null)}
                  className={styles.alertClose}
                  aria-label="Close alert"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.crimeReportWrapper}>
        <div className={styles.crimeReportHeader}>
          <h1>
            <FaUserShield className={styles.headerIcon} /> Crime Report Portal
          </h1>
          <p>Help make your community safer by reporting crimes</p>
        </div>

        <div className={styles.crimeReportContent}>
          <div className={styles.reportFormContainer}>
            <form onSubmit={handleSubmit} className={styles.elegantForm}>
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.titleIcon}>1</span>
                  Incident Details
                </h3>

                <div className={styles.formGroup}>
                  <label htmlFor="location" className={styles.formLabel}>
                    <FaMapMarkerAlt className={styles.inputIcon} />
                    Crime Location
                  </label>
                  <div className={styles.locationInputContainer}>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      placeholder="Enter exact location or address"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className={`${styles.formInput} ${
                        errors.location ? styles.formInputError : ""
                      }`}
                    />
                    <button
                      type="button"
                      className={styles.mapButton}
                      onClick={handleMapButtonClick}
                      disabled={!location.trim()}
                    >
                      <FaMapMarkerAlt />
                    </button>
                  </div>
                  {errors.location && (
                    <div className={styles.errorMessage}>{errors.location}</div>
                  )}
                  <div className={styles.inputGuideline}>
                    <FaInfoCircle className={styles.guidelineIcon} />
                    <span>
                      Be as specific as possible (e.g., 'Near the fountain at
                      Central Park')
                    </span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="time" className={styles.formLabel}>
                    <FaCalendarAlt className={styles.inputIcon} />
                    Time of Crime
                  </label>
                  <div className={styles.datepickerContainer}>
                    <DatePicker
                      selected={time}
                      onChange={(date) => setTime(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      className={`${styles.formInput} ${styles.datepickerInput} ${
                        errors.time ? styles.formInputError : ""
                      }`}
                      required
                      placeholderText="Select date and time"
                      maxDate={new Date()}
                    />
                  </div>
                  {errors.time && (
                    <div className={styles.errorMessage}>{errors.time}</div>
                  )}
                  <div className={styles.inputGuideline}>
                    <FaInfoCircle className={styles.guidelineIcon} />
                    <span>
                      If exact time is unknown, provide your best estimate
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.titleIcon}>2</span>
                  Crime Information
                </h3>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="crime-type" className={styles.formLabel}>
                      Type of Crime
                    </label>
                    <select
                      id="crime-type"
                      name="crime-type"
                      value={crimeType}
                      onChange={(e) => setCrimeType(e.target.value)}
                      required
                      className={styles.formInput}
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
                    <div className={styles.inputGuideline}>
                      <FaInfoCircle className={styles.guidelineIcon} />
                      <span>
                        Select the category that best describes the incident
                      </span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="num-criminals" className={styles.formLabel}>
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
                      className={`${styles.formInput} ${
                        errors.numCriminals ? styles.formInputError : ""
                      }`}
                    />
                    {errors.numCriminals && (
                      <div className={styles.errorMessage}>{errors.numCriminals}</div>
                    )}
                    <div className={styles.inputGuideline}>
                      <FaInfoCircle className={styles.guidelineIcon} />
                      <span>Estimate if exact number is unknown</span>
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="victim-gender" className={styles.formLabel}>
                      Victim's Gender
                    </label>
                    <select
                      id="victim-gender"
                      name="victim-gender"
                      value={victimGender}
                      onChange={(e) => setVictimGender(e.target.value)}
                      required
                      className={styles.formInput}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="unknown">Prefer not to say</option>
                    </select>
                    <div className={styles.inputGuideline}>
                      <FaInfoCircle className={styles.guidelineIcon} />
                      <span>Helps authorities identify potential patterns</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Are the criminals armed?
                    </label>
                    <div className={styles.radioGroup}>
                      {["yes", "no", "unknown"].map((value) => (
                        <label key={value} className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="armed"
                            value={value}
                            checked={armed === value}
                            onChange={() => setArmed(value)}
                            required
                          />
                          <span className={styles.radioCustom}></span>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </label>
                      ))}
                    </div>
                    <div className={styles.inputGuideline}>
                      <FaInfoCircle className={styles.guidelineIcon} />
                      <span>
                        Select 'unknown' if weapon status wasn't visible
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.titleIcon}>3</span>
                  Media Evidence
                </h3>

                <div className={styles.formGroup}>
                  <label htmlFor="crime-photos" className={styles.fileUploadLabel}>
                    <FaUpload className={styles.uploadIcon} />
                    Upload Photos (Optional)
                    <span className={styles.fileUploadHint}>
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
                    className={styles.fileInput}
                  />
                  <div className={styles.inputGuideline}>
                    <FaInfoCircle className={styles.guidelineIcon} />
                    <span>
                      Upload clear images showing suspects, vehicles, or crime
                      scene
                    </span>
                  </div>
                  <div className={styles.previewContainer}>
                    {photos.map((photo, index) => (
                      <div key={index} className={styles.previewItem}>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt="Crime Scene"
                          className={styles.previewImage}
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className={styles.removeBtn}
                          title="Remove photo"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="crime-video" className={styles.fileUploadLabel}>
                    <FaUpload className={styles.uploadIcon} />
                    Upload Video (Optional)
                    <span className={styles.fileUploadHint}>
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
                    className={styles.fileInput}
                  />
                  <div className={styles.inputGuideline}>
                    <FaInfoCircle className={styles.guidelineIcon} />
                    <span>
                      Short clips showing suspect activity are most helpful
                    </span>
                  </div>
                  <div className={styles.previewContainer}>
                    {videos.map((video, index) => (
                      <div key={index} className={styles.previewItem}>
                        <video controls className={styles.previewVideo}>
                          <source
                            src={URL.createObjectURL(video)}
                            type={video.type}
                          />
                        </video>
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className={styles.removeBtn}
                          title="Remove video"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.resetBtn} onClick={resetForm}>
                  Clear Form
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className={styles.spinnerIcon} /> Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.reportGuidelines}>
            <h3>
              <FaInfoCircle className={styles.guidelineHeaderIcon} /> Reporting
              Guidelines
            </h3>
            <div className={styles.guidelineSection}>
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

            <div className={styles.guidelineSection}>
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

            <div className={styles.guidelineSection}>
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

            <div className={styles.guidelineSection}>
              <h4>Media Evidence</h4>
              <ul>
                <li>Ensure photos/videos are clear and well-lit</li>
                <li>Do not alter or edit media files before submission</li>
                <li>Include multiple angles when possible</li>
                <li>Never put yourself in danger to capture evidence</li>
              </ul>
            </div>

            <div className={styles.confidentialityNotice}>
              <h4>
                <FaUserShield className={styles.privacyIcon} /> Confidentiality Notice
              </h4>
              <p>
                Your report and personal information are protected under our
                strict privacy policy. All data is encrypted and shared only
                with authorized law enforcement personnel.
              </p>
              <p className={styles.emergencyNote}>
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