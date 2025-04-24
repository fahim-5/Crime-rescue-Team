import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiActivity, 
  FiEye, 
  FiList,
  FiClock,
  FiMapPin,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw
} from 'react-icons/fi';
import './PoliceDashboard.css';

const PoliceDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      pendingCases: 0,
      solvedCases: 0,
      activeInvestigations: 0,
      clearanceRate: 0
    },
    recentReports: [],
    trends: {
      pendingChange: 0,
      solvedChange: 0,
      activeChange: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsResponse, reportsResponse] = await Promise.all([
          axios.get('/api/police/stats'),
          axios.get('/api/police/recent-reports')
        ]);

        // Calculate clearance rate
        const pending = Number(statsResponse.data?.pendingCases) || 0;
        const solved = Number(statsResponse.data?.solvedCases) || 0;
        const totalCases = pending + solved;
        const clearanceRate = totalCases > 0 ? Math.round((solved / totalCases) * 100) : 0;

        setDashboardData({
          stats: {
            pendingCases: pending,
            solvedCases: solved,
            activeInvestigations: Number(statsResponse.data?.activeInvestigations) || 0,
            clearanceRate: clearanceRate
          },
          recentReports: Array.isArray(reportsResponse.data) 
            ? reportsResponse.data.map(report => ({
                id: report.id || 0,
                type: report.type || 'Unknown',
                location: report.location || 'Unknown',
                status: report.status || 'pending',
                reportedAt: report.reportedAt || new Date().toISOString()
              }))
            : [],
          trends: {
            pendingChange: 2,  // Mock data - would normally come from API
            solvedChange: 5,   // Mock data
            activeChange: 0    // Mock data
          }
        });
      } catch (err) {
        console.error('Dashboard data error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleReportClick = (reportId) => {
    navigate(`/police/reports/${reportId}`);
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <FiTrendingUp className="trend-icon up" />;
    if (value < 0) return <FiTrendingDown className="trend-icon down" />;
    return <FiRefreshCw className="trend-icon neutral" />;
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-overlay">
        <div className="error-card">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="police-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Law Enforcement Command Center</h1>
          <p className="welcome-message">
            <FiClock className="icon" /> Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <FiAlertCircle className="stat-icon pending" />
            <div>
              <span className="stat-value">{dashboardData.stats.pendingCases}</span>
              <span className="stat-label">Pending Cases</span>
            </div>
          </div>
          <div className="header-stat">
            <FiActivity className="stat-icon active" />
            <div>
              <span className="stat-value">{dashboardData.stats.activeInvestigations}</span>
              <span className="stat-label">Active Investigations</span>
            </div>
          </div>
          <div className="header-stat">
            <FiCheckCircle className="stat-icon resolved" />
            <div>
              <span className="stat-value">{dashboardData.stats.solvedCases}</span>
              <span className="stat-label">Cases Solved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Key Metrics Section */}
        <section className="metrics-section">
          <div className="metrics-grid">
            <div className="metric-card priority">
              <div className="metric-header">
                <h3>Priority Cases</h3>
                <div className="metric-trend">
                  {getTrendIcon(dashboardData.trends.pendingChange)}
                  <span>{Math.abs(dashboardData.trends.pendingChange)} this week</span>
                </div>
              </div>
              <div className="metric-value">{dashboardData.stats.pendingCases}</div>
              <div className="metric-description">Require immediate attention</div>
            </div>

            <div className="metric-card investigations">
              <div className="metric-header">
                <h3>Active Investigations</h3>
                <div className="metric-trend">
                  {getTrendIcon(dashboardData.trends.activeChange)}
                  <span>{Math.abs(dashboardData.trends.activeChange)} this week</span>
                </div>
              </div>
              <div className="metric-value">{dashboardData.stats.activeInvestigations}</div>
              <div className="metric-description">Currently in progress</div>
            </div>

            <div className="metric-card solved">
              <div className="metric-header">
                <h3>Solved Cases</h3>
                <div className="metric-trend">
                  {getTrendIcon(dashboardData.trends.solvedChange)}
                  <span>{Math.abs(dashboardData.trends.solvedChange)} this week</span>
                </div>
              </div>
              <div className="metric-value">{dashboardData.stats.solvedCases}</div>
              <div className="metric-description">Successful resolutions</div>
            </div>

            <div className="metric-card efficiency">
              <div className="metric-header">
                <h3>Clearance Rate</h3>
                <div className="metric-trend">
                  {dashboardData.stats.clearanceRate > 50 ? 
                    <FiTrendingUp className="trend-icon up" /> : 
                    <FiTrendingDown className="trend-icon down" />}
                  <span>{dashboardData.stats.clearanceRate > 50 ? 'Good' : 'Needs improvement'}</span>
                </div>
              </div>
              <div className="metric-value">{dashboardData.stats.clearanceRate}%</div>
              <div className="metric-description">Cases solved vs reported</div>
            </div>
          </div>
        </section>

        {/* Recent Reports Section */}
        <section className="reports-section">
          <div className="section-header">
            <h2>
              <FiList className="section-icon" />
              Recent Crime Reports
            </h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/police/reports')}
            >
              View All Reports
            </button>
          </div>

          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date Reported</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentReports.length > 0 ? (
                  dashboardData.recentReports.map(report => (
                    <tr key={report.id}>
                      <td className="case-id">CR-{report.id.toString().padStart(4, '0')}</td>
                      <td className="case-type">{report.type}</td>
                      <td className="case-location">
                        <FiMapPin className="location-icon" /> {report.location}
                      </td>
                      <td>
                        <span className={`status-badge ${report.status.toLowerCase()}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="case-date">
                        {new Date(report.reportedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td>
                        <button 
                          className="view-btn"
                          onClick={() => handleReportClick(report.id)}
                        >
                          <FiEye className="btn-icon" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-reports-row">
                    <td colSpan="6">
                      <div className="no-reports-message">
                        No recent reports found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PoliceDashboard;