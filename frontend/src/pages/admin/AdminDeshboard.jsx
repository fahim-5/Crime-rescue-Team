import React from 'react';
import './AdminDashboard.css'; // Importing the CSS for the page

const AdminDashboard = () => {
  return (
      
      <div className="main-content">
        <header>
          <h1>Admin Dashboard</h1>
        </header>
        
        <div className="overview">
          <div className="summary-box">
            <h3>Total Reports</h3>
            <p>120</p>
          </div>
          <div className="summary-box">
            <h3>Pending Approvals</h3>
            <p>10</p>
          </div>
          <div className="summary-box">
            <h3>Active Alerts</h3>
            <p>5</p>
          </div>
        </div>
        
        <section className="recent-reports">
          <h2>Recent Crime Reports</h2>
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
              <tr>
                <td>001</td>
                <td>Dhaka</td>
                <td>2025-03-25</td>
                <td>Pending</td>
                <td><button className="btn approve-btn">Approve</button></td>
              </tr>
              <tr>
                <td>002</td>
                <td>Chittagong</td>
                <td>2025-03-24</td>
                <td>Validated</td>
                <td><button className="btn approve-btn">Validate</button></td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
        </section>

        <section className="user-management">
          <h2>User Registrations</h2>
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>U001</td>
                <td>John Doe</td>
                <td>john@example.com</td>
                <td><button className="btn approve-btn">Approve</button></td>
              </tr>
              <tr>
                <td>U002</td>
                <td>Jane Smith</td>
                <td>jane@example.com</td>
                <td><button className="btn approve-btn">Approve</button></td>
              </tr>
              {/* Add more user rows as needed */}
            </tbody>
          </table>
        </section>
      </div>
  );
};

export default AdminDashboard;
