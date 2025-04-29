import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRegClock,
  FaUsers,
  FaExclamationTriangle,
  FaMale,
  FaFemale,
  FaCheck,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaUserCircle,
  FaShieldAlt,
  FaFileAlt,
  FaImages,
  FaVideo
} from "react-icons/fa";
import "./AdminReportDetail.css";

const AdminReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:5000/api/reports/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.success) {
          setReport(response.data.data);
        } else {
          setError("Failed to load report details");
        }
      } catch (err) {
        console.error("Error fetching report details:", err);
        setError("Error loading report. Please try again later.");
        
        // Enhanced mock data with all required fields
        setReport({
          id: id,
          crimeId: `CR-2025-${id}`,
          crime_type: "robbery",
          location: "Dhaka, Bangladesh",
          time: new Date().toISOString(),
          created_at: new Date().toISOString(),
          description: "Armed robbery at local convenience store. Two masked individuals entered the store with firearms and demanded cash from the register. They fled the scene in a black sedan heading north on Main Street.",
          num_criminals: 2,
          victim_gender: "male",
          armed: "yes",
          status: "pending",
          reporter: {  // Ensure reporter object exists
            id: "user123",
            name: "John Doe",
            phone: "+1234567890",
            email: "john@example.com",
          },
          photos: [
            { url: "https://via.placeholder.com/600x400?text=Crime+Scene+1" },
            { url: "https://via.placeholder.com/600x400?text=Crime+Scene+2" }
          ],
          videos: [
            { url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4" }
          ],
          valid_count: 3,
          invalid_count: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchReportDetails();
    }
  }, [id, token]);

  const getStatusBadge = (status) => {
    if (!status) return null;
    const statusClass = status.toLowerCase();
    
    // Add appropriate icon based on status
    let statusIcon;
    switch (statusClass) {
      case 'pending':
        
        break;
      case 'verified':
        
        break;
      case 'rejected':
        
        break;
      case 'investigating':
        
        break;
      default:
        statusIcon = <FaFileAlt />;
    }
    
    return (
      <span className={`status-badge ${statusClass}`}>
        {statusIcon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getGenderIcon = (gender) => {
    if (!gender) return <FaUserCircle className="gender-icon unknown" />;
    if (gender.toLowerCase() === "male") {
      return <FaMale className="gender-icon male" />;
    } else if (gender.toLowerCase() === "female") {
      return <FaFemale className="gender-icon female" />;
    }
    return <FaUserCircle className="gender-icon unknown" />;
  };

  const handleContactReporter = () => {
    if (!report?.reporter) {
      alert("No reporter information available");
      return;
    }
    alert(`Contacting reporter: ${report.reporter.name}\nPhone: ${report.reporter.phone}\nEmail: ${report.reporter.email}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading report details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="error-container">
        <h2>Report Not Found</h2>
        <p>{error || "The requested report could not be loaded."}</p>
        <div className="back-button-container">
          <button onClick={() => navigate("/admin/reports")} className="back-button">
            <FaArrowLeft /> Back to Reports
          </button>
        </div>
      </div>
    );
  }

  // Calculate validation percentage
  const totalVotes = (report.valid_count || 0) + (report.invalid_count || 0);
  const validPercentage = totalVotes ? ((report.valid_count || 0) / totalVotes) * 100 : 0;

  return (
    <div className="admin-report-container">
      <div className="report-header">
        <div className="header-content">
          
          <div className="header-title">
            <h1>
              {report.crime_type?.charAt(0).toUpperCase() + report.crime_type?.slice(1)} Report
              <span className="crime-id">{report.crimeId}</span>
            </h1>
            <div className="header-meta">
              {getStatusBadge(report.status)}
              <span>Reported {report.created_at && formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
            </div>
          </div>
          <div className="back-button-wrapper">
            {/* <button className="contact-button" onClick={handleContactReporter}>
              <FaPhoneAlt /> Contact Reporter
            </button> */}
          </div>
        </div>
      </div>

      <div className="report-content">
        <div className="report-main">
          <section className="report-section incident-section">
            <h2 className="section-title">Incident Details</h2>
            <div className="detail-grid">
              <div className="detail-card">
                <FaMapMarkerAlt className="detail-icon" />
                <div>
                  <h3>Location</h3>
                  <p>{report.location || "Location not specified"}</p>
                </div>
              </div>
              
              <div className="detail-card">
                <FaCalendarAlt className="detail-icon" />
                <div>
                  <h3>Date & Time</h3>
                  <p>
                    {report.time ? format(new Date(report.time), "MMM d, yyyy 'at' h:mm a") : "Not specified"}
                    {report.time && (
                      <span className="time-ago">
                        ({formatDistanceToNow(new Date(report.time), { addSuffix: true })})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="detail-card">
                <FaUsers className="detail-icon" />
                <div>
                  <h3>Suspects</h3>
                  <p>{report.num_criminals || 0} {report.num_criminals === 1 ? "person" : "people"}</p>
                </div>
              </div>
              
              <div className="detail-card">
                <FaExclamationTriangle className="detail-icon" />
                <div>
                  <h3>Armed</h3>
                  <p>{report.armed === "yes" ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
            
            
          </section>

          {(report.photos?.length > 0 || report.videos?.length > 0) && (
            <section className="report-section evidence-section">
              <h2 className="section-title">Evidence</h2>
              
              {report.photos?.length > 0 && (
                <div className="evidence-group">
                  <h3><FaImages /> Photos ({report.photos.length})</h3>
                  <div className="media-grid">
                    {report.photos.map((photo, index) => (
                      <div key={`photo-${index}`} className="media-item">
                        <img src={photo.url} alt={`Evidence ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {report.videos?.length > 0 && (
                <div className="evidence-group">
                  <h3><FaVideo /> Videos ({report.videos.length})</h3>
                  <div className="media-grid">
                    {report.videos.map((video, index) => (
                      <div key={`video-${index}`} className="media-item">
                        <video controls>
                          <source src={video.url} type="video/mp4" />
                          Your browser does not support videos.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="report-sidebar">
          

          <div className="validation-card">
            <h2>Community Validation</h2>
            <div className="validation-metrics">
              <div className="metric valid">
                <FaCheck className="metric-icon" />
                <div>
                  <span className="metric-value">{report.valid_count || 0}</span>
                  <span className="metric-label">Valid</span>
                </div>
              </div>
              <div className="metric invalid">
                <FaTimes className="metric-icon" />
                <div>
                  <span className="metric-value">{report.invalid_count || 0}</span>
                  <span className="metric-label">Invalid</span>
                </div>
              </div>
            </div>
            <div className="validation-progress">
              <div 
                className="progress-bar"
                style={{
                  width: `${validPercentage}%`
                }}
              ></div>
            </div>
          </div>

          <div className="victim-card">
            <h2>Victim Information</h2>
            <div className="victim-details">
              <div className="gender-display">
                {getGenderIcon(report.victim_gender)}
                <span>
                  {report.victim_gender ? 
                    report.victim_gender.charAt(0).toUpperCase() + report.victim_gender.slice(1) : 
                    "Not specified"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="back-button-container">
        <button onClick={() => navigate("/admin/reports")} className="back-button">
          <FaArrowLeft /> Back to Reports
        </button>
      </div>
    </div>
  );
};

export default AdminReportDetail;