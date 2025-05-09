import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import styles from "./AdminDashboard.module.css";

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
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const statsResponse = await axios.get(
          "http://localhost:5000/api/reports/dashboard/stats",
          config
        );

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
    navigate(`/admin/report/${reportId}`);
  };

  if (loading)
    return (
      <div className={styles.loadingContainer}>Loading dashboard data...</div>
    );
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Total Reports</h3>
          <p className={styles.cardValue}>{stats.totalReports}</p>
        </div>
        <div className={`${styles.card} ${styles.cardPending}`}>
          <h3 className={styles.cardTitle}>Pending Reports</h3>
          <p className={styles.cardValue}>{stats.pendingReports}</p>
        </div>
        <div className={`${styles.card} ${styles.cardAlert}`}>
          <h3 className={styles.cardTitle}>Active Alerts</h3>
          <p className={styles.cardValue}>{stats.activeAlerts}</p>
          <small className={styles.alertNote}>Last 12 hours</small>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Crime Reports</h2>
          <button
            className={styles.viewAllButton}
            onClick={() => navigate("/admin/reports")}
          >
            View All Reports
          </button>
        </div>
        {recentReports.length === 0 ? (
          <div className={styles.emptyState}>No recent reports found</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {recentReports.map((report) => (
                  <tr key={report.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{report.id}</td>
                    <td className={styles.tableCell}>
                      {report.location || "Unknown"}
                    </td>
                    <td className={styles.tableCell}>
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td
                      className={`${styles.status} ${
                        styles[report.status.toLowerCase()]
                      }`}
                    >
                      {report.status || "Pending"}
                    </td>
                    <td className={styles.tableCell}>
                      <button
                        className={styles.button}
                        onClick={() => handleViewReport(report.id)}
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

export default AdminDashboard;
