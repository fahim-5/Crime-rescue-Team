import React, { useState, useEffect } from "react";
import axios from "axios";
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
          "http://localhost:5000/police/requests"
        );
        setRequests(response.data);
      } catch (err) {
        setError("Failed to fetch requests");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (policeId) => {
    try {
      await axios.put(`http://localhost:5000/police/requests/approve/${policeId}`);
      setSuccess("Request approved successfully");
      setRequests(requests.filter(request => request.police_id !== policeId));
      setSelectedRequest(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to approve request");
      console.error(err);
    }
  };

  const handleReject = async (policeId) => {
    try {
      await axios.delete(`http://localhost:5000/police/requests/reject/${policeId}`);
      setSuccess("Request rejected successfully");
      setRequests(requests.filter(request => request.police_id !== policeId));
      setSelectedRequest(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to reject request");
      console.error(err);
    }
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
  };

  if (loading) return <div className="loading">Loading requests...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="validation-container">
      <h1>Police Registration Requests</h1>
      {success && <div className="success-message">{success}</div>}

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
              <tr key={request.id}>
                <td>{request.full_name}</td>
                <td>{request.police_id}</td>
                <td>{request.station}</td>
                <td>{request.rank}</td>
                <td>{request.status}</td>
                <td className="actions">
                  <button
                    className="view-btn"
                    onClick={() => viewDetails(request)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setSelectedRequest(null)}
            >
              &times;
            </button>
            <h2>Officer Details</h2>
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
                  <strong>Badge Number:</strong> {selectedRequest.badge_number}
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
                  {new Date(selectedRequest.joining_date).toLocaleDateString()}
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
            <div className="modal-actions">
              <button 
                className="approve-btn" 
                onClick={() => handleApprove(selectedRequest.police_id)}
              >
                Approve
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(selectedRequest.police_id)}
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