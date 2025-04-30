import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaUserCog, FaFileAlt, FaSearch, FaDatabase, FaCheckCircle, FaChevronRight, FaBell, FaTrash } from "react-icons/fa";
import "./Management.css";

function Management() {
  const [activeItem, setActiveItem] = useState("Account Validation");
  const [criminals, setCriminals] = useState([]);
  const [newCriminal, setNewCriminal] = useState({ name: "", address: "", cases: "" });
  const navigate = useNavigate();

  const menuItems = [
    { name: "Account Validation", icon: <FaShieldAlt /> },
    { name: "User Management", icon: <FaUserCog /> },
    { name: "Case Reports", icon: <FaFileAlt /> },
    { name: "Criminal Database", icon: <FaDatabase /> },
    { name: "Analytics Dashboard", icon: <FaCheckCircle /> },
  ];

  const handleNavigation = (itemName) => {
    setActiveItem(itemName);
    if(itemName === "Analytics Dashboard") navigate("/admin/analytics");
  };

  const handleAddCriminal = (e) => {
    e.preventDefault();
    setCriminals([...criminals, newCriminal]);
    setNewCriminal({ name: "", address: "", cases: "" });
  };

  return (
    <div className="management-container">
      <aside className={`sidebar expanded`}>
      
        
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={activeItem === item.name ? "active" : ""}
              onClick={() => handleNavigation(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
              <FaChevronRight className="menu-arrow" />
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        {activeItem === "Account Validation" && (
          <div className="validation-container">
            <div className="validation-header">
              <h3>Officer Verification Protocol</h3>
              <span className="badge">Priority</span>
            </div>
            
            <ul className="instructions-list">
              <li>
                <div className="instruction-icon">
                  <FaShieldAlt />
                </div>
                <div>
                  <strong>Verify Official Police ID</strong>
                  <p>Check authenticity against government databases.</p>
                </div>
              </li>
              <li>
              <div className="instruction-icon">
                <FaDatabase />
              </div>
              <div>
                <strong>Backend Data Cross-Matching</strong>
                <p>Cross-reference officer details with our secure backend records for consistency.</p>
              </div>
            </li>

            <button className="view-request-btn">
            <FaFileAlt /> View Pending Requests
          </button>
            </ul>
          </div>
        )}

        {activeItem === "User Management" && (
          <div className="user-management-container">
            <h3>User Accounts</h3>
            <div className="user-list">
              <div className="user-item">
                <span>Officer John Doe (john.d@police.gov)</span>
                <button className="delete-btn">
                  <FaTrash /> Delete Account
                </button>
              </div>
              <div className="user-item">
                <span>Detective Jane Smith (jane.s@police.gov)</span>
                <button className="delete-btn">
                  <FaTrash /> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {activeItem === "Criminal Database" && (
          <div className="criminal-database-container">
            <h3>Criminal Records Management</h3>
            <form onSubmit={handleAddCriminal} className="criminal-form">
              <input
                type="text"
                placeholder="Criminal Name"
                value={newCriminal.name}
                onChange={(e) => setNewCriminal({...newCriminal, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={newCriminal.address}
                onChange={(e) => setNewCriminal({...newCriminal, address: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Number of Cases"
                value={newCriminal.cases}
                onChange={(e) => setNewCriminal({...newCriminal, cases: e.target.value})}
                required
              />
              <button type="submit">Add Criminal Record</button>
            </form>

            <div className="criminal-list">
              {criminals.map((criminal, index) => (
                <div key={index} className="criminal-card">
                  <h4>{criminal.name}</h4>
                  <p>Address: {criminal.address}</p>
                  <p>Active Cases: {criminal.cases}</p>
                  <button 
                    className="remove-btn"
                    onClick={() => setCriminals(criminals.filter((_, i) => i !== index))}
                  >
                    Remove Record
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Management;