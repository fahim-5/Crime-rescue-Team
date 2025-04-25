import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PoliceStationFinder.css";

const API_URL = "http://localhost:5000";

const PoliceStationFinder = ({ onClose, location }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [policeStations, setPoliceStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);

  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPoliceStations();
  }, []);

  useEffect(() => {
    // Extract location info from the passed location string
    if (location) {
      const locationParts = location.split(",").map((part) => part.trim());

      // Try to identify if any part matches known districts or thanas
      if (locationParts.length > 0 && districts.length > 0) {
        const districtMatch = districts.find((district) =>
          locationParts.some((part) =>
            district.toLowerCase().includes(part.toLowerCase())
          )
        );

        if (districtMatch) {
          setSelectedDistrict(districtMatch);
        }
      }
    }
  }, [location, districts]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    filterStations();
  }, [selectedDistrict, selectedThana, searchTerm, policeStations]);

  const fetchPoliceStations = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/police-stations`);

      if (response.data && response.data.success) {
        setPoliceStations(response.data.data);
        setFilteredStations(response.data.data);

        // Extract unique districts and thanas
        const uniqueDistricts = [
          ...new Set(response.data.data.map((station) => station.district)),
        ];
        setDistricts(uniqueDistricts.sort());
      } else {
        setError("Failed to load police stations");
      }
    } catch (err) {
      console.error("Error fetching police stations:", err);
      setError("Failed to load police stations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterStations = () => {
    let results = [...policeStations];

    // Filter by district
    if (selectedDistrict) {
      results = results.filter(
        (station) =>
          station.district.toLowerCase() === selectedDistrict.toLowerCase()
      );

      // Update thanas based on selected district
      const districtThanas = [
        ...new Set(results.map((station) => station.thana)),
      ];
      setThanas(districtThanas.sort());
    } else {
      setThanas([]);
    }

    // Filter by thana
    if (selectedThana) {
      results = results.filter(
        (station) => station.thana.toLowerCase() === selectedThana.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      results = results.filter(
        (station) =>
          station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.thana.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStations(results);
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedThana(""); // Reset thana when district changes
  };

  const handleThanaChange = (e) => {
    setSelectedThana(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setSelectedDistrict("");
    setSelectedThana("");
    setSearchTerm("");
  };

  return (
    <div className="police-station-modal">
      <div className="police-station-content">
        <button className="close-modal" onClick={onClose}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>

        <div className="police-station-header">
          <h2>Find Nearby Police Stations</h2>
          <p className="subtitle">Contact law enforcement in your area</p>
        </div>

        <div className="filter-section">
          <div className="search-bar">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search police stations..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>District</label>
              <select value={selectedDistrict} onChange={handleDistrictChange}>
                <option value="">All Districts</option>
                {districts.map((district, index) => (
                  <option key={index} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Thana</label>
              <select
                value={selectedThana}
                onChange={handleThanaChange}
                disabled={!selectedDistrict}
              >
                <option value="">All Thanas</option>
                {thanas.map((thana, index) => (
                  <option key={index} value={thana}>
                    {thana}
                  </option>
                ))}
              </select>
            </div>

            <button className="reset-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>

        <div className="station-list">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading police stations...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          ) : filteredStations.length > 0 ? (
            filteredStations.map((station, index) => (
              <div key={index} className="station-card">
                <div className="station-header">
                  <h3>{station.name}</h3>
                  <span className="station-type">
                    {station.type || "Police Station"}
                  </span>
                </div>
                <div className="station-details">
                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>
                      {station.district}, {station.thana}
                    </span>
                  </div>
                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{station.phone_number || "N/A"}</span>
                  </div>
                  {station.email && (
                    <div className="detail-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <span>{station.email}</span>
                    </div>
                  )}
                </div>
                <div className="station-actions">
                  <a href={`tel:${station.phone_number}`} className="call-btn">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Call
                  </a>
                  {station.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        station.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-btn"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                        <line x1="8" y1="2" x2="8" y2="18"></line>
                        <line x1="16" y1="6" x2="16" y2="22"></line>
                      </svg>
                      View Map
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-stations">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <h3>No police stations found</h3>
              <p>Try adjusting your filters or search criteria</p>
              <button className="reset-btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoliceStationFinder;
