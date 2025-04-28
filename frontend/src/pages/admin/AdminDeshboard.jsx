import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import "./AdminDashboard.css"; // Importing the CSS for the page

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    activeAlerts: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Configure headers with the auth token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch dashboard stats
        const statsResponse = await axios.get(
          "http://localhost:5000/api/reports/dashboard/stats",
          config
        );

        // Fetch recent reports
        const recentResponse = await axios.get(
          "http://localhost:5000/api/reports/dashboard/recent",
          config
        );

        if (statsResponse.data.success && recentResponse.data.success) {
          setStats(statsResponse.data.data);
          setRecentReports(recentResponse.data.data);
        } else {
          throw new Error("Failed to fetch dashboard data");
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleViewReport = (reportId) => {
    console.log("Navigating to report detail page:", reportId);
    navigate(`/admin/report/${reportId}`);
  };

  if (loading)
    return <div className="loading-container">Loading dashboard data...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="main-content">
      <header>
        <h1>Admin Dashboard</h1>
      </header>

      <div className="overview">
        <div className="summary-box">
          <h3>Total Reports</h3>
          <p>{stats.totalReports}</p>
        </div>
        <div className="summary-box">
          <h3>Pending Approvals</h3>
          <p>{stats.pendingReports}</p>
        </div>
        <div className="summary-box">
          <h3>Active Alerts</h3>
          <p>{stats.activeAlerts}</p>
          <small className="alert-note">Last 12 hours</small>
        </div>
      </div>

      <section className="recent-reports">
        <h2>Recent Crime Reports</h2>
        {recentReports.length === 0 ? (
          <div className="no-reports">No recent reports found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.location || "Unknown"}</td>
                  <td>{new Date(report.created_at).toLocaleDateString()}</td>
                  <td>{report.status || "Pending"}</td>
                  <td>
                    <button
                      className="btn view-btn"
                      onClick={() => handleViewReport(report.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
