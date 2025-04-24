import React from 'react';
import './UserReports.css';

const UserReports = () => {
  // Dummy reports data
  const userReports = [
    {
      id: 'UR-2023-001',
      type: 'Burglary',
      date: '2023-06-15T09:30:00',
      location: 'Dhaka-Mirpur, Block D',
      status: 'Under Investigation',
      description: 'Reported break-in at my residence while I was away. Stolen items include jewelry and electronics.',
      officer: 'SI Mohammad Ali'
    },
    {
      id: 'UR-2023-002',
      type: 'Harassment',
      date: '2023-07-22T14:15:00',
      location: 'Dhaka-Gulshan, Road 45',
      status: 'Case Closed',
      description: 'Reported continuous harassment from neighbors regarding property boundaries.',
      officer: 'ASI Fatima Begum'
    },
    {
      id: 'UR-2023-003',
      type: 'Fraud',
      date: '2023-08-10T11:45:00',
      location: 'Online Transaction',
      status: 'In Court',
      description: 'Fell victim to an online shopping scam. Lost 15,000 BDT in fraudulent transaction.',
      officer: 'SI Rajib Hasan'
    },
    {
      id: 'UR-2023-004',
      type: 'Public Nuisance',
      date: '2023-09-05T20:30:00',
      location: 'Dhaka-Uttara, Sector 7',
      status: 'Warning Issued',
      description: 'Reported loud construction noise after permitted hours.',
      officer: 'Constable Arif Khan'
    }
  ];

  return (
    <div className="user-reports-container">
      <header className="reports-header">
        <h1>My Submitted Reports</h1>
        <p className="subtitle">View and track all reports you've submitted to authorities</p>
      </header>

      <div className="reports-list">
        {userReports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="report-meta">
                <span className="report-id">{report.id}</span>
                <span className={`status-badge ${report.status.replace(/\s+/g, '-').toLowerCase()}`}>
                  {report.status}
                </span>
              </div>
              <div className="report-type">{report.type}</div>
              <div className="report-date">
                {new Date(report.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className="report-body">
              <div className="location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {report.location}
              </div>
              <p className="description">{report.description}</p>
            </div>

            <div className="report-footer">
              <div className="assigned-officer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Assigned Officer: {report.officer}
              </div>
              <button className="view-details-btn">
                View Full Details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReports;