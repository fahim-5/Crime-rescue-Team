import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import "./PoliceDashboard.css";

const PoliceDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      pendingCases: 0,
      solvedCases: 0,
      activeInvestigations: 0,
      clearanceRate: 0,
    },
    recentReports: [],
    trends: {
      pendingChange: 0,
      solvedChange: 0,
      activeChange: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Check if user is logged in and is a police officer
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user && user.role !== "police") {
      navigate("/unauthorized");
      return;
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [statsResponse, reportsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/police/stats", config),
          axios.get("http://localhost:5000/api/police/recent-reports", config),
        ]);

        console.log("Stats response:", statsResponse.data);
        console.log("Reports response:", reportsResponse.data);

        // Handle response based on API structure
        const statsData = statsResponse.data.success
          ? statsResponse.data.data
          : statsResponse.data;
        const reportsData = reportsResponse.data.success
          ? reportsResponse.data.data
          : reportsResponse.data;

        // Calculate clearance rate
        const pending = Number(statsData?.pendingCases) || 0;
        const solved = Number(statsData?.solvedCases) || 0;
        const totalCases = pending + solved;
        const clearanceRate =
          totalCases > 0 ? Math.round((solved / totalCases) * 100) : 0;

        setDashboardData({
          stats: {
            pendingCases: pending,
            solvedCases: solved,
            activeInvestigations: Number(statsData?.activeInvestigations) || 0,
            clearanceRate: clearanceRate,
          },
          recentReports: Array.isArray(reportsData)
            ? reportsData.map((report) => ({
                id: report.id || 0,
                crime_id: report.crime_id || "",
                type: report.type || "Unknown",
                location: report.location || "Unknown",
                status: report.status || "pending",
                reportedAt:
                  report.reportedAt ||
                  report.created_at ||
                  new Date().toISOString(),
              }))
            : [],
          trends: {
            pendingChange: Number(statsData.trends?.pendingChange) || 0,
            solvedChange: Number(statsData.trends?.solvedChange) || 0,
            activeChange: Number(statsData.trends?.activeChange) || 0,
          },
        });
      } catch (err) {
        console.error("Dashboard data error:", err);
        if (err.response) {
          console.error("Error response:", err.response.data);
          console.error("Error status:", err.response.status);
          console.error("Error headers:", err.response.headers);
        } else if (err.request) {
          console.error("No response received:", err.request);
        } else {
          console.error("Error message:", err.message);
        }
        setError("Failed to load dashboard data. Please try again later.");

        // If unauthorized, redirect to login
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleReportClick = (reportId) => {
    navigate(`/police/report/${reportId}`);
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Police Command Center</h1>
      </header>

      <div className="grid">
        <div className="card">
          <h3 className="card-title">Pending Cases</h3>
          <p className="card-value">{dashboardData.stats.pendingCases}</p>
        </div>
        <div className="card card-active">
          <h3 className="card-title">Active Investigations</h3>
          <p className="card-value">
            {dashboardData.stats.activeInvestigations}
          </p>
        </div>
        <div className="card card-solved">
          <h3 className="card-title">Solved Cases</h3>
          <p className="card-value">{dashboardData.stats.solvedCases}</p>
        </div>
        <div className="card card-clearance">
          <h3 className="card-title">Clearance Rate</h3>
          <p className="card-value">{dashboardData.stats.clearanceRate}%</p>
          <small className="card-note">Cases solved vs reported</small>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">Recent Crime Reports</h2>
        {dashboardData.recentReports.length === 0 ? (
          <div className="empty-state">No recent reports found</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Case ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date Reported</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {dashboardData.recentReports.map((report) => (
                  <tr key={report.id} className="table-row">
                    <td className="table-cell">
                      {report.crime_id ||
                        `CR-${report.id.toString().padStart(4, "0")}`}
                    </td>
                    <td className="table-cell">{report.type}</td>
                    <td className="table-cell">{report.location}</td>
                    <td className="table-cell">
                      <span className={`status ${report.status.toLowerCase()}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {new Date(report.reportedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="table-cell">
                      <button
                        className="button"
                        onClick={() => handleReportClick(report.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default PoliceDashboard;
