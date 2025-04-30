import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useApi } from "../../utils/useApi";
import "./ReportedCrimes.css";

const ReportedCrimes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchWithAuth, isLoading, error: apiError, setError } = useApi();
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorMessage] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Update component error state when API error changes
  useEffect(() => {
    if (apiError) {
      setErrorMessage(apiError);
    }
  }, [apiError]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await fetchWithAuth(
        "http://localhost:5000/api/reports/admin"
      );

      if (data && data.success) {
        setCrimes(data.data || []);
        setErrorMessage(null);
      } else {
        throw new Error("Failed to fetch crime reports");
      }
    } catch (err) {
      console.error("Error fetching crime reports:", err);
      setErrorMessage(err.message || "Failed to load crime reports");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const handleViewFullDetails = (reportId) => {
    closeModal();
    navigate(`/admin/report/${reportId}`);
  };

  // Filter crimes based on search term
  const filteredCrimes = crimes.filter((crime) =>
    crime.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="reported-crimes-container">
      <h2 className="reported-crimes-header">All Reported Crimes</h2>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-message">Loading crime reports...</div>
      ) : (
        <div className="crimes-table-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Crime ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {filteredCrimes.length === 0 ? (
            <div className="no-crimes-message">
              {searchTerm ? "No matching crime reports found." : "No crime reports found."}
            </div>
          ) : (
            <table className="crimes-table">
              <thead>
                <tr>
                  <th>Crime ID</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrimes.map((crime) => (
                  <tr key={crime.id}>
                    <td>{crime.id}</td>
                    <td>{crime.location || "Unknown"}</td>
                    <td>
                      {crime.time
                        ? new Date(crime.time).toLocaleString()
                        : "Unknown"}
                    </td>
                    <td>{crime.status || "Pending"}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewReport(crime)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Reporter Details Modal */}
      {showModal && selectedReport && (
        <div className="modal-overlay">
          <div className="reporter-info">
            <div className="modal-header-h1">
              <h3>Reporter Details</h3>
        
            </div>
            <div className="modal-body">
              <div className="report-detail">
                <span className="detail-label">Report ID:</span>
                <span className="detail-value">{selectedReport.id}</span>
              </div>
              <div className="report-detail">
                <span className="detail-label">Reporter Name:</span>
                <span className="detail-value">
                  {selectedReport.reporter?.name ||
                    selectedReport.reporter?.full_name ||
                    "Anonymous"}
                </span>
              </div>
              <div className="report-detail">
                <span className="detail-label">Reporter ID:</span>
                <span className="detail-value">
                  {selectedReport.reporter?.id || "Not available"}
                </span>
              </div>
              <div className="report-detail">
                <span className="detail-label">Reporter Email:</span>
                <span className="detail-value">
                  {selectedReport.reporter?.email || "Not available"}
                </span>
              </div>
              <div className="report-detail">
                <span className="detail-label">Reporter Address:</span>
                <span className="detail-value">
                  {selectedReport.reporter?.address || "Not available"}
                </span>
              </div>
              <div className="report-detail">
                <span className="detail-label">Report Location:</span>
                <span className="detail-value">
                  {selectedReport.location || "Unknown"}
                </span>
              </div>
              <div className="report-detail">
                <span className="detail-label">Report Time:</span>
                <span className="detail-value">
                  {selectedReport.time
                    ? new Date(selectedReport.time).toLocaleString()
                    : "Unknown"}
                </span>
              </div>
              <div className="report-detail">
                <span className="detail-label">Report Status:</span>
                <span className="detail-value">
                  {selectedReport.status || "Pending"}
                </span>
              </div>
              
           
            </div>
            <div className="modal-footer">
              <button
                className="more-details-btn"
                onClick={() => handleViewFullDetails(selectedReport.id)}
              >
                Report Details
              </button>
              <button className="close-btn-b" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportedCrimes;
