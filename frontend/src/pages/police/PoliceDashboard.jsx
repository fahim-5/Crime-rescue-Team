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

        // Get stats from our working endpoint
        let statsData = {
          pendingCases: 0,
          activeInvestigations: 0,
          solvedCases: 0,
          clearanceRate: 0,
        };
        let reportsData = [];

        try {
          const statsResponse = await axios.get(
            "http://localhost:5000/api/police/stats",
            config
          );
          console.log("Stats response:", statsResponse.data);

          // Handle response based on API structure
          if (statsResponse.data.success && statsResponse.data.data) {
            statsData = statsResponse.data.data;
            console.log("Successfully parsed stats data:", statsData);
          } else {
            statsData = statsResponse.data;
            console.log("Using raw stats data:", statsData);
          }
        } catch (statsError) {
          console.error("Error fetching stats:", statsError);
          // If stats endpoint fails, try the individual endpoints
          try {
            const [
              pendingResponse,
              activeResponse,
              solvedResponse,
              rateResponse,
            ] = await Promise.allSettled([
              axios.get(
                "http://localhost:5000/api/police/reports/pending-count",
                config
              ),
              axios.get(
                "http://localhost:5000/api/police/reports/active-count",
                config
              ),
              axios.get(
                "http://localhost:5000/api/police/reports/solved-count",
                config
              ),
              axios.get(
                "http://localhost:5000/api/police/reports/clearance-rate",
                config
              ),
            ]);

            console.log("Received individual stats responses:", {
              pending: pendingResponse,
              active: activeResponse,
              solved: solvedResponse,
              rate: rateResponse,
            });

            if (
              pendingResponse.status === "fulfilled" &&
              pendingResponse.value?.data?.success
            ) {
              statsData.pendingCases = pendingResponse.value.data.count || 0;
            }

            if (
              activeResponse.status === "fulfilled" &&
              activeResponse.value?.data?.success
            ) {
              statsData.activeInvestigations =
                activeResponse.value.data.count || 0;
            }

            if (
              solvedResponse.status === "fulfilled" &&
              solvedResponse.value?.data?.success
            ) {
              statsData.solvedCases = solvedResponse.value.data.count || 0;
            }

            if (
              rateResponse.status === "fulfilled" &&
              rateResponse.value?.data?.success
            ) {
              statsData.clearanceRate =
                rateResponse.value.data.data?.clearanceRate || 0;
            }
          } catch (individualError) {
            console.error("Error fetching individual stats:", individualError);
          }
        }

        // Fetch recent reports
        try {
          const reportsResponse = await axios.get(
            "http://localhost:5000/api/police/recent-reports",
            config
          );
          console.log("Reports response:", reportsResponse.data);
          reportsData =
            reportsResponse.data.success && reportsResponse.data.data
              ? reportsResponse.data.data
              : reportsResponse.data;
        } catch (reportsError) {
          console.error("Error fetching reports:", reportsError);
        }

        // Set dashboard data with fetched stats and reports
        setDashboardData({
          stats: {
            pendingCases: Number(statsData?.pendingCases) || 0,
            solvedCases: Number(statsData?.solvedCases) || 0,
            activeInvestigations: Number(statsData?.activeInvestigations) || 0,
            clearanceRate: Number(statsData?.clearanceRate) || 0,
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
        <div className="section-header">
          <h2 className="section-title">Recent Crime Reports</h2>
          <button
            className="view-all-button"
            onClick={() => navigate("/police/reports")}
          >
            View All Reports
          </button>
        </div>
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
