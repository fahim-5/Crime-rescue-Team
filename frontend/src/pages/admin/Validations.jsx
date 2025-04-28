import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertMessage from "../../components/AlertMessage";
import "./Validations.css";

const Validations = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/police/requests"
        );
        if (response.data && response.data.length > 0) {
          setRequests(response.data);
        } else {
          setError("No pending requests found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch requests");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (policeId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/police/requests/approve/${policeId}`
      );
      setSuccess("Request approved successfully");
      setRequests(requests.filter((request) => request.police_id !== policeId));
      setSelectedRequest(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve request");
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (policeId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/police/requests/reject/${policeId}`
      );
      setSuccess("Request rejected successfully");
      setRequests(requests.filter((request) => request.police_id !== policeId));
      setSelectedRequest(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject request");
      console.error("Reject error:", err);
    }
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
  };

  // Clear any alerts when opening modal
  const clearAlerts = () => {
    if (error) setError("");
    if (success) setSuccess("");
  };

  if (loading)
    return (
      <div className="validation-container">
        <h1>Police Registration Requests</h1>
        <div className="loading">Loading requests...</div>
      </div>
    );

  return (
    <div className="validation-container">
      <h1>Police Registration Requests</h1>

      {success && (
        <AlertMessage
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      <div className="validation-content">
        {requests.length === 0 ? (
          <div className="no-requests">No pending requests found</div>
        ) : (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Police ID</th>
                  <th>Station</th>
                  <th>Rank</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.police_id}>
                    <td>{request.full_name}</td>
                    <td>{request.police_id}</td>
                    <td>{request.station}</td>
                    <td>{request.rank}</td>
                    <td>{request.status}</td>
                    <td className="actions">
                      <button
                        className="view-btn"
                        onClick={() => {
                          viewDetails(request);
                          clearAlerts();
                        }}
                        aria-label={`View details for ${request.full_name}`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Officer Details</h2>
              <button
                className="close-modal"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close details"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-group">
                  <h3>Identification</h3>
                  <p>
                    <strong>Full Name:</strong> {selectedRequest.full_name}
                  </p>
                  <p>
                    <strong>Police ID:</strong> {selectedRequest.police_id}
                  </p>
                  <p>
                    <strong>Badge Number:</strong>{" "}
                    {selectedRequest.badge_number}
                  </p>
                  <p>
                    <strong>National ID:</strong> {selectedRequest.national_id}
                  </p>
                </div>
                <div className="detail-group">
                  <h3>Assignment</h3>
                  <p>
                    <strong>Station:</strong> {selectedRequest.station}
                  </p>
                  <p>
                    <strong>Rank:</strong> {selectedRequest.rank}
                  </p>
                  <p>
                    <strong>Joining Date:</strong>{" "}
                    {new Date(
                      selectedRequest.joining_date
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="detail-group">
                  <h3>Contact</h3>
                  <p>
                    <strong>Email:</strong> {selectedRequest.email}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {selectedRequest.mobile}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedRequest.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="approve-btn"
                onClick={() => handleApprove(selectedRequest.police_id)}
                aria-label="Approve request"
              >
                Approve
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(selectedRequest.police_id)}
                aria-label="Reject request"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validations;
