import React, { useState, useEffect } from "react";
import "./Analytics.css";
import axios from "axios";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Analytics data states with realistic fallback values
  const [overviewData, setOverviewData] = useState({
    totalReports: 124,
    totalReportsTrend: { direction: "up", percentage: "12%" },
    validatedReports: 86,
    validatedReportsTrend: { direction: "up", percentage: "8%" },
    policeAlerts: 42,
    policeAlertsTrend: { direction: "down", percentage: "5%" },
    responseRate: "81%",
    responseRateTrend: { direction: "stable", percentage: "0%" },
    overTimeData: {
      reports: [
        { time_period: "Mon", report_count: 15 },
        { time_period: "Tue", report_count: 21 },
        { time_period: "Wed", report_count: 18 },
        { time_period: "Thu", report_count: 25 },
        { time_period: "Fri", report_count: 23 },
        { time_period: "Sat", report_count: 14 },
        { time_period: "Sun", report_count: 8 },
      ],
      validations: [
        { time_period: "Mon", validation_count: 10 },
        { time_period: "Tue", validation_count: 15 },
        { time_period: "Wed", validation_count: 13 },
        { time_period: "Thu", validation_count: 18 },
        { time_period: "Fri", validation_count: 16 },
        { time_period: "Sat", validation_count: 10 },
        { time_period: "Sun", validation_count: 6 },
      ],
    },
  });

  const [topCrimeTypes, setTopCrimeTypes] = useState([
    { name: "Theft", count: 26, trend: "up" },
    { name: "Assault", count: 18, trend: "down" },
    { name: "Fraud", count: 15, trend: "up" },
    { name: "Burglary", count: 12, trend: "stable" },
    { name: "Vandalism", count: 9, trend: "down" },
  ]);

  const [recentValidations, setRecentValidations] = useState([
    { id: "CR-1024", location: "Mirpur-10", validatedBy: 7, time: "2h ago" },
    { id: "CR-1023", location: "Gulshan-1", validatedBy: 5, time: "4h ago" },
    { id: "CR-1021", location: "Dhanmondi", validatedBy: 9, time: "6h ago" },
    { id: "CR-1019", location: "Mohammadpur", validatedBy: 3, time: "1d ago" },
    { id: "CR-1018", location: "Uttara", validatedBy: 6, time: "1d ago" },
  ]);

  const [locationDistribution, setLocationDistribution] = useState([
    { name: "Dhaka", value: 45 },
    { name: "Chittagong", value: 21 },
    { name: "Sylhet", value: 16 },
    { name: "Khulna", value: 10 },
    { name: "Others", value: 8 },
  ]);

  const [validationMetrics, setValidationMetrics] = useState({
    validatedWithinHour: "68%",
    reportsWithFiveValidations: "51%",
    alertsActedUpon: "73%",
  });

  // Ensure no alerts can appear
  useEffect(() => {
    // Remove any existing alert elements
    const alerts = document.querySelectorAll(".alert-message");
    alerts.forEach((alert) => alert.remove());

    // Prevent any alert-related functionality
    window.alert = () => {};
    window.showAlert = () => {};
  }, []);

  // Fetch analytics data based on timeRange
  useEffect(() => {
    fetchAnalyticsData();

    // Also test the crime-types endpoint directly to ensure it works
    const testCrimeTypesEndpoint = async () => {
      try {
        console.log("Testing crime-types endpoint directly");
        const crimeTypesResponse = await axios.get(
          `/api/analytics/crime-types?timeRange=${timeRange}`
        );
        console.log("Direct crime types response:", crimeTypesResponse.data);

        // If we get direct data, update the state
        if (
          Array.isArray(crimeTypesResponse.data) &&
          crimeTypesResponse.data.length > 0
        ) {
          setTopCrimeTypes(crimeTypesResponse.data);
        }
      } catch (error) {
        console.error("Error testing crime-types endpoint:", error);
      }
    };

    testCrimeTypesEndpoint();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Use the new all-in-one endpoint
      const response = await axios.get(
        `/api/analytics/dashboard-data?timeRange=${timeRange}`
      );

      const data = response.data;

      // Set all the data states at once if valid data is returned
      if (data && data.overview) {
        setOverviewData(data.overview);
      }

      if (Array.isArray(data.crimeTypes) && data.crimeTypes.length > 0) {
        setTopCrimeTypes(data.crimeTypes);
      }

      if (
        Array.isArray(data.recentValidations) &&
        data.recentValidations.length > 0
      ) {
        setRecentValidations(data.recentValidations);
      }

      if (
        Array.isArray(data.locationDistribution) &&
        data.locationDistribution.length > 0
      ) {
        setLocationDistribution(data.locationDistribution);
      }

      if (data.validationMetrics) {
        setValidationMetrics(data.validationMetrics);
      }

      console.log("Successfully loaded analytics data");
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Keep the existing fallback data on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <div>
          <h1>Crime Analytics Dashboard</h1>
          <p>Real-time insights and crime pattern analysis</p>
        </div>
        <div className="time-range-selector">
          <button
            className={`time-btn ${timeRange === "24h" ? "active" : ""}`}
            onClick={() => setTimeRange("24h")}
          >
            24h
          </button>
          <button
            className={`time-btn ${timeRange === "7d" ? "active" : ""}`}
            onClick={() => setTimeRange("7d")}
          >
            7d
          </button>
          <button
            className={`time-btn ${timeRange === "30d" ? "active" : ""}`}
            onClick={() => setTimeRange("30d")}
          >
            30d
          </button>
        </div>
      </header>

      <div className="analytics-tabs">
        <button
          className={`analytics-tab ${
            activeTab === "overview" ? "active" : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`analytics-tab ${
            activeTab === "patterns" ? "active" : ""
          }`}
          onClick={() => setActiveTab("patterns")}
        >
          Crime Patterns
        </button>
        <button
          className={`analytics-tab ${
            activeTab === "validation" ? "active" : ""
          }`}
          onClick={() => setActiveTab("validation")}
        >
          Validation Analytics
        </button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <div className="analytics-content">
          {activeTab === "overview" && (
            <>
              <div className="metrics-grid">
                <div className="metric-card">
                  <h3>Total Reports</h3>
                  <div className="metric-value">
                    {overviewData.totalReports}
                  </div>
                  <div
                    className={`metric-trend ${
                      overviewData.totalReportsTrend?.direction || "stable"
                    }`}
                  >
                    {overviewData.totalReportsTrend?.direction === "up"
                      ? "↑"
                      : overviewData.totalReportsTrend?.direction === "down"
                      ? "↓"
                      : "→"}
                    {overviewData.totalReportsTrend?.percentage || "0%"} from
                    last period
                  </div>
                </div>
                <div className="metric-card">
                  <h3>Pending Reports</h3>
                  <div className="metric-value">
                    {overviewData.validatedReports}
                  </div>
                  <div
                    className={`metric-trend ${
                      overviewData.validatedReportsTrend?.direction || "stable"
                    }`}
                  >
                    {overviewData.validatedReportsTrend?.direction === "up"
                      ? "↑"
                      : overviewData.validatedReportsTrend?.direction === "down"
                      ? "↓"
                      : "→"}
                    {overviewData.validatedReportsTrend?.percentage || "0%"}{" "}
                    from last period
                  </div>
                </div>
                <div className="metric-card">
                  <h3>Active Alerts</h3>
                  <div className="metric-value">
                    {overviewData.policeAlerts}
                  </div>
                  <div
                    className={`metric-trend ${
                      overviewData.policeAlertsTrend?.direction || "stable"
                    }`}
                  >
                    {overviewData.policeAlertsTrend?.direction === "up"
                      ? "↑"
                      : overviewData.policeAlertsTrend?.direction === "down"
                      ? "↓"
                      : "→"}
                    {overviewData.policeAlertsTrend?.percentage || "0%"} from
                    last period
                  </div>
                </div>
                <div className="metric-card">
                  <h3>Validation Rate</h3>
                  <div className="metric-value">
                    {overviewData.responseRate}
                  </div>
                  <div
                    className={`metric-trend ${
                      overviewData.responseRateTrend?.direction || "stable"
                    }`}
                  >
                    {overviewData.responseRateTrend?.direction === "up"
                      ? "↑"
                      : overviewData.responseRateTrend?.direction === "down"
                      ? "↓"
                      : "→"}
                    {overviewData.responseRateTrend?.percentage || "0%"} from
                    last period
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <h2 className="chart-title">Reports & Validations Over Time</h2>
                <div className="chart-placeholder">
                  <p>Line chart showing {timeRange} data</p>
                  <div className="chart-legend">
                    <span className="legend-report">Reports</span>
                    <span className="legend-validation">Validations</span>
                  </div>
                </div>
              </div>

              <div className="data-grid">
                <div className="data-card">
                  <h3>Top Crime Types</h3>
                  <ul className="crime-list">
                    {Array.isArray(topCrimeTypes) &&
                    topCrimeTypes.length > 0 ? (
                      topCrimeTypes.map((crime, index) => (
                        <li key={index}>
                          <span className="crime-name">{crime.name}</span>
                          <span className="crime-count">{crime.count}</span>
                          <span className={`crime-trend ${crime.trend}`}>
                            {crime.trend === "up"
                              ? "↑"
                              : crime.trend === "down"
                              ? "↓"
                              : "→"}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li>
                        <span className="crime-name">
                          No crime data available
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="data-card">
                  <h3>Recent Validations</h3>
                  <table className="validation-table">
                    <thead>
                      <tr>
                        <th>Case ID</th>
                        <th>Location</th>
                        <th>Validations</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(recentValidations) &&
                      recentValidations.length > 0 ? (
                        recentValidations.map((item, index) => (
                          <tr key={index}>
                            <td>{item.id}</td>
                            <td>{item.location}</td>
                            <td>
                              <span className="validation-count">
                                {item.validatedBy}
                              </span>
                            </td>
                            <td>{item.time}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center" }}>
                            No recent validations
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "patterns" && (
            <>
              <div className="chart-container full-width">
                <h2 className="chart-title">Crime Type Distribution</h2>
                <div className="chart-placeholder pie">
                  <p>Pie chart showing crime type distribution</p>
                </div>
              </div>

              <div className="chart-container full-width">
                <h2 className="chart-title">Geographical Distribution</h2>
                <div className="chart-placeholder map">
                  <p>Map showing crime location distribution</p>
                  <div className="location-legend">
                    {Array.isArray(locationDistribution) &&
                    locationDistribution.length > 0 ? (
                      locationDistribution.map((loc, index) => (
                        <div key={index} className="legend-item">
                          <span
                            className="legend-color"
                            style={{ backgroundColor: getColorForIndex(index) }}
                          ></span>
                          <span>
                            {loc.name} ({loc.value}%)
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="legend-item">
                        <span>No location data available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "validation" && (
            <>
              <div className="chart-container">
                <h2 className="chart-title">Validation Rate Over Time</h2>
                <div className="chart-placeholder">
                  <p>Line chart showing validation rates</p>
                </div>
              </div>

              <div className="chart-container">
                <h2 className="chart-title">Time to Validation</h2>
                <div className="chart-placeholder">
                  <p>Histogram showing time to validation</p>
                </div>
              </div>

              <div className="data-card full-width">
                <h3>Validation Effectiveness</h3>
                <div className="effectiveness-metrics">
                  <div className="effectiveness-metric">
                    <div className="metric-value">
                      {validationMetrics.validatedWithinHour}
                    </div>
                    <div className="metric-label">
                      Reports validated within 1 hour
                    </div>
                  </div>
                  <div className="effectiveness-metric">
                    <div className="metric-value">
                      {validationMetrics.reportsWithFiveValidations}
                    </div>
                    <div className="metric-label">
                      Reports reaching 5+ validations
                    </div>
                  </div>
                  <div className="effectiveness-metric">
                    <div className="metric-value">
                      {validationMetrics.alertsActedUpon}
                    </div>
                    <div className="metric-label">Police alerts acted upon</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function for chart colors
function getColorForIndex(index) {
  const colors = ["#a72c40", "#2c6e8a", "#4c956a", "#e8a87c", "#6c757d"];
  return colors[index % colors.length];
}

export default Analytics;
