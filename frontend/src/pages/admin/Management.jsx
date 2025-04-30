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

            <button className="view-request-btn" onClick={() => navigate("/admin/validations")}>
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

        
      </main>
    </div>
  );
}

export default Management;