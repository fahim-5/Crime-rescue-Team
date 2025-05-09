import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useApi } from "../../utils/useApi";
import "./ReportedCrimes.css";

const ReportedCrimes = ({ isPoliceView = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { fetchWithAuth, isLoading, error: apiError, setError } = useApi();
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorMessage] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Determine if this is a police view based on prop or URL
  const isPolicePage = isPoliceView || location.pathname.includes("/police/");

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [isPolicePage]);

  // Update component error state when API error changes
  useEffect(() => {
    if (apiError) {
      setErrorMessage(apiError);
    }
  }, [apiError]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Determine the appropriate endpoint based on user role
      let endpoint;

      if (isPolicePage) {
        endpoint = "http://localhost:5000/api/reports/police";
        console.log(
          `Attempting to fetch crime reports from: ${endpoint} as police user`
        );
      } else {
        endpoint = "http://localhost:5000/api/reports/admin";
        console.log(`Fetching crime reports from: ${endpoint} as admin user`);
      }

      let data;
      try {
        data = await fetchWithAuth(endpoint);
      } catch (err) {
        // If police endpoint fails, try the admin endpoint as fallback
        if (isPolicePage) {
          console.log(
            "Police endpoint failed, trying admin endpoint as fallback"
          );
          const adminEndpoint = "http://localhost:5000/api/reports/admin";
          data = await fetchWithAuth(adminEndpoint);
        } else {
          throw err;
        }
      }

      if (data && (data.success || Array.isArray(data))) {
        // Handle both response formats:
        // 1. {success: true, data: [...]} (admin format)
        // 2. {cases: [...], pagination: {...}} (police format)
        // 3. Direct array (fallback)

        let crimesList = [];

        if (data.success && Array.isArray(data.data)) {
          crimesList = data.data;
        } else if (data.cases && Array.isArray(data.cases)) {
          crimesList = data.cases;
        } else if (Array.isArray(data)) {
          crimesList = data;
        }

        console.log("Processed crime reports:", crimesList.length);
        setCrimes(crimesList);
        setErrorMessage(null);
      } else {
        throw new Error("Failed to fetch crime reports");
      }
    } catch (err) {
      console.error("Error fetching crime reports:", err);

      // Only set error message for admin view, use empty state for police
      if (!isPolicePage) {
        setErrorMessage(err.message || "Failed to load crime reports");
      } else {
        console.log("Suppressing error message for police view");
        setErrorMessage(null);
      }

      setCrimes([]);
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
    // Navigate to the appropriate details page based on user role
    if (isPolicePage) {
      navigate(`/police/report/${reportId}`);
    } else {
      navigate(`/admin/report/${reportId}`);
    }
  };

  // Filter crimes based on search term
  const filteredCrimes = crimes.filter((crime) =>
    crime.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Determine the title based on the user role
  const pageTitle = isPolicePage ? "All Crime Reports" : "All Reported Crimes";

  return (
    <div className="reported-crimes-container">
      <h2 className="reported-crimes-header">{pageTitle}</h2>

      {!user && (
        <div className="error-message">
          <span>⚠️ Access denied. Please log in to view this page.</span>
        </div>
      )}

      {/* Only show admin role required message if we're on admin route and user is not admin */}
      {user && !isPolicePage && user.role !== "admin" && (
        <div className="error-message">
          <span>⚠️ Access denied. Admin role required.</span>
        </div>
      )}

      {/* Only show police role required message if we're on police route and user is not police */}
      {user && isPolicePage && user.role !== "police" && (
        <div className="error-message">
          <span>⚠️ Access denied. Police role required.</span>
        </div>
      )}

      {/* Only show error messages for admin users */}
      {error && !isPolicePage && <div className="error-message">{error}</div>}

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
              {searchTerm
                ? "No matching crime reports found."
                : "No crime reports found."}
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
                        ? new Date(crime.time).toLocaleString("en-US", {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            second: "numeric",
                            hour12: true,
                          })
                        : "Unknown"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          crime.status?.toLowerCase() || "pending"
                        }`}
                      >
                        {crime.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewFullDetails(crime.id)}
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
