import React, { useState, useEffect } from 'react';
import './Analytics.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Ensure no alerts can appear
  useEffect(() => {
    // Remove any existing alert elements
    const alerts = document.querySelectorAll('.alert-message');
    alerts.forEach(alert => alert.remove());
    
    // Prevent any alert-related functionality
    window.alert = () => {};
    window.showAlert = () => {};
  }, []);

  // Sample analytics data without any alert references
  const analyticsData = {
    totalReports: 1245,
    validatedReports: 892,
    policeAlerts: 178,
    responseRate: '72%',
    topCrimeTypes: [
      { name: 'Theft', count: 342, trend: 'up' },
      { name: 'Harassment', count: 278, trend: 'down' },
      { name: 'Vandalism', count: 195, trend: 'up' },
      { name: 'Assault', count: 132, trend: 'stable' },
      { name: 'Fraud', count: 98, trend: 'up' },
    ],
    recentValidations: [
      { id: 'CR-1024', location: 'Mirpur-10', validatedBy: 7, time: '2h ago' },
      { id: 'CR-1023', location: 'Gulshan-1', validatedBy: 5, time: '4h ago' },
      { id: 'CR-1021', location: 'Dhanmondi', validatedBy: 9, time: '6h ago' },
    ],
    locationDistribution: [
      { name: 'Dhaka', value: 65 },
      { name: 'Chittagong', value: 15 },
      { name: 'Sylhet', value: 8 },
      { name: 'Khulna', value: 7 },
      { name: 'Others', value: 5 },
    ]
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
            className={`time-btn ${timeRange === '24h' ? 'active' : ''}`}
            onClick={() => setTimeRange('24h')}
          >
            24h
          </button>
          <button 
            className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            7d
          </button>
          <button 
            className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            30d
          </button>
        </div>
      </header>

      <div className="analytics-tabs">
        <button 
          className={`analytics-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`analytics-tab ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          Crime Patterns
        </button>
        <button 
          className={`analytics-tab ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Validation Analytics
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && (
          <>
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Total Reports</h3>
                <div className="metric-value">{analyticsData.totalReports}</div>
                <div className="metric-trend up">↑ 12% from last period</div>
              </div>
              <div className="metric-card">
                <h3>Validated Reports</h3>
                <div className="metric-value">{analyticsData.validatedReports}</div>
                <div className="metric-trend up">↑ 8% from last period</div>
              </div>
              <div className="metric-card">
                <h3>Police Alerts</h3>
                <div className="metric-value">{analyticsData.policeAlerts}</div>
                <div className="metric-trend down">↓ 5% from last period</div>
              </div>
              <div className="metric-card">
                <h3>Response Rate</h3>
                <div className="metric-value">{analyticsData.responseRate}</div>
                <div className="metric-trend stable">→ No change</div>
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
                  {analyticsData.topCrimeTypes.map((crime, index) => (
                    <li key={index}>
                      <span className="crime-name">{crime.name}</span>
                      <span className="crime-count">{crime.count}</span>
                      <span className={`crime-trend ${crime.trend}`}>
                        {crime.trend === 'up' ? '↑' : crime.trend === 'down' ? '↓' : '→'}
                      </span>
                    </li>
                  ))}
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
                    {analyticsData.recentValidations.map((item, index) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'patterns' && (
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
                  {analyticsData.locationDistribution.map((loc, index) => (
                    <div key={index} className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: getColorForIndex(index) }}></span>
                      <span>{loc.name} ({loc.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'validation' && (
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
                  <div className="metric-value">87%</div>
                  <div className="metric-label">Reports validated within 1 hour</div>
                </div>
                <div className="effectiveness-metric">
                  <div className="metric-value">63%</div>
                  <div className="metric-label">Reports reaching 5+ validations</div>
                </div>
                <div className="effectiveness-metric">
                  <div className="metric-value">92%</div>
                  <div className="metric-label">Police alerts acted upon</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function for chart colors
function getColorForIndex(index) {
  const colors = ['#a72c40', '#2c6e8a', '#4c956a', '#e8a87c', '#6c757d'];
  return colors[index % colors.length];
}

export default Analytics;