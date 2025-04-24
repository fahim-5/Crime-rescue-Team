import React from 'react';
import "./ReportedCrimes.css";


const ReportedCrimes = () => {
  // Sample crime data
  const crimes = [
    {
      id: 'CR-2023-001',
      location: 'Mirpur Road, Dhaka',
      time: '2023-05-15 14:30',
      victim: 'Abdul Rahman',
      gender: 'Male',
      criminalsCount: 3,
      hasArms: true,
      status: 'Pending'
    },
    {
      id: 'CR-2023-002',
      location: 'Gulshan Avenue, Dhaka',
      time: '2023-05-16 21:15',
      victim: 'Fatima Begum',
      gender: 'Female',
      criminalsCount: 2,
      hasArms: false,
      status: 'Under Investigation'
    },
    {
      id: 'CR-2023-003',
      location: 'Chittagong Port Area',
      time: '2023-05-17 08:45',
      victim: 'Rajesh Chowdhury',
      gender: 'Male',
      criminalsCount: 5,
      hasArms: true,
      status: 'Solved'
    },
    {
      id: 'CR-2023-004',
      location: 'Sylhet Central Market',
      time: '2023-05-18 17:20',
      victim: 'Anika Islam',
      gender: 'Female',
      criminalsCount: 1,
      hasArms: false,
      status: 'Pending'
    }
  ];

  return (
    <div className="reported-crimes-container">
      <h2 className="reported-crimes-header">All Reported Crimes</h2>
      
      <div className="crime-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select id="status-filter" className="filter-select">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="investigation">Under Investigation</option>
            <option value="solved">Solved</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="arms-filter">Armed Criminals:</label>
          <select id="arms-filter" className="filter-select">
            <option value="all">All</option>
            <option value="armed">Armed</option>
            <option value="unarmed">Unarmed</option>
          </select>
        </div>
      </div>

      <div className="crimes-table-container">
        <table className="crimes-table">
          <thead>
            <tr>
              <th>Crime ID</th>
              <th>Location</th>
              <th>Time</th>
              <th>Victim</th>
              <th>Gender</th>
              <th>Criminals</th>
              <th>Armed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {crimes.map((crime) => (
              <tr key={crime.id}>
                <td>{crime.id}</td>
                <td>{crime.location}</td>
                <td>{crime.time}</td>
                <td>{crime.victim}</td>
                <td>{crime.gender}</td>
                <td>{crime.criminalsCount}</td>
                <td>
                  <span className={`arms-indicator ${crime.hasArms ? 'armed' : 'unarmed'}`}>
                    {crime.hasArms ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${crime.status.toLowerCase().replace(' ', '-')}`}>
                    {crime.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn view-btn">View</button>
                  <button className="action-btn update-btn">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls">
        <button className="pagination-btn">Previous</button>
        <span className="page-numbers">1 of 4</span>
        <button className="pagination-btn">Next</button>
      </div>
    </div>
  );
};

export default ReportedCrimes;