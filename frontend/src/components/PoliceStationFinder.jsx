import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./PoliceStationFinder.module.css";

const API_URL = "http://localhost:5000";

const PoliceStationFinder = ({ onClose, location }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [policeStations, setPoliceStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingThanas, setLoadingThanas] = useState(false);

  // Memoize the fetch function to prevent recreating it on every render
  const fetchPoliceStations = useCallback(async () => {
    if (policeStations.length > 0) {
      // Skip fetching if we already have data
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const apiUrl = `${API_URL}/api/police-stations`;
      
      const controller = new AbortController();
      const signal = controller.signal;

      const response = await axios.get(apiUrl, {
        timeout: 15000,
        signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response && response.data && response.data.success) {
        setPoliceStations(response.data.data);
        setFilteredStations(response.data.data);

        // Extract unique districts
        const uniqueDistricts = [
          ...new Set(response.data.data.map((station) => station.district)),
        ];
        setDistricts(uniqueDistricts.sort());
      } else {
        setError("Failed to load police stations - server returned an error");
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        // Request was cancelled, don't update state
        return;
      }
      
      if (err.response) {
        setError(
          `Failed to load police stations: Server returned ${err.response.status}`
        );
      } else if (err.request) {
        setError("Failed to load police stations: No response from server");
      } else {
        setError(`Failed to load police stations: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [policeStations.length]);

  // Memoize the fetchThanas function
  const fetchThanasByDistrict = useCallback(async (district) => {
    if (!district) return;
    
    const controller = new AbortController();
    
    try {
      setLoadingThanas(true);
      const response = await axios.get(`${API_URL}/api/police-stations/thanas/${district}`, {
        timeout: 5000,
        signal: controller.signal
      });
      
      if (response && response.data && response.data.success) {
        setThanas(response.data.data);
        
        // If we only have one thana, auto-select it
        if (response.data.data.length === 1) {
          setSelectedThana(response.data.data[0]);
        }
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        // Only set error if it's not a cancellation
        setError("Failed to fetch thanas");
      }
    } finally {
      setLoadingThanas(false);
    }
    
    return () => controller.abort();
  }, []);

  // Initial data fetch and setup click handler
  useEffect(() => {
    const controller = new AbortController();
    
    fetchPoliceStations();
    
    // Add backdrop click handler
    const handleBackdropClick = (e) => {
      if (e.target.classList.contains('police-station-modal')) {
        onClose();
      }
    };
    
    document.addEventListener('click', handleBackdropClick);
    
    return () => {
      document.removeEventListener('click', handleBackdropClick);
      controller.abort(); // Cancel any in-flight requests
    };
  }, [onClose, fetchPoliceStations]);

  // Process location once districts are loaded
  useEffect(() => {
    // Extract location info from the passed location string
    if (location && districts.length > 0) {
      // Split by comma, dash or space for flexible matching
      const locationParts = location.split(/[,\-\s]+/).map(part => part.trim().toLowerCase()).filter(Boolean);
      
      // Try to identify district match
      const districtMatch = districts.find(district => 
        locationParts.some(part => 
          district.toLowerCase().includes(part) || part.includes(district.toLowerCase())
        )
      );
      
      if (districtMatch) {
        setSelectedDistrict(districtMatch);
        fetchThanasByDistrict(districtMatch);
      }
    }
  }, [location, districts, fetchThanasByDistrict]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    filterStations();
  }, [selectedDistrict, selectedThana, searchTerm, policeStations]);

  const filterStations = () => {
    let results = [...policeStations];

    // Filter by district
    if (selectedDistrict) {
      results = results.filter(
        (station) =>
          station.district.toLowerCase() === selectedDistrict.toLowerCase()
      );
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
          station.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.officer_in_charge?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStations(results);
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setSelectedThana(""); // Reset thana when district changes
    
    if (district) {
      fetchThanasByDistrict(district);
    } else {
      setThanas([]);
    }
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
    setThanas([]);
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className={styles["police-station-modal"]} data-testid="police-station-modal">
      <div className={styles["police-station-content"]}>
        <div className={styles["modal-controls"]}>
          <button className={styles["help-button"]} title="Show Help" onClick={toggleHelp}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
          <button className={styles["close-modal"]} onClick={onClose}>
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
        </div>

        {showHelp && (
          <div className={styles["help-box"]}>
            <h4>How to use this finder:</h4>
            <ol>
              <li>Select a district to narrow down police stations</li>
              <li>Further filter by selecting a specific thana</li>
              <li>Use the search box to find stations by name or address</li>
              <li>Press the phone number to call the police station directly</li>
            </ol>
          </div>
        )}

        <div className={styles["modal-header"]}>
          <h2>Find Nearby Police Stations</h2>
          <p className={styles.subtitle}>Contact the nearest police station for assistance</p>
        </div>

        <div className={styles["filter-section"]}>
          <div className={styles["filter-row"]}>
            <div className={styles["filter-group"]}>
              <label>District:</label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={loading}
              >
                <option value="">All Districts</option>
                {districts.map((district, index) => (
                  <option key={index} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles["filter-group"]}>
              <label>Thana/Upazila:</label>
              <select
                value={selectedThana}
                onChange={handleThanaChange}
                disabled={loading || loadingThanas || !selectedDistrict}
              >
                <option value="">All Thanas</option>
                {thanas.map((thana, index) => (
                  <option key={index} value={thana}>
                    {thana}
                  </option>
                ))}
              </select>
              {loadingThanas && <span className={styles["loading-indicator"]}>Loading...</span>}
            </div>
          </div>

          <div className={styles["filter-row"]}>
            <div className={styles["search-group"]}>
              <input
                type="text"
                placeholder="Search by station name, address or officer..."
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={loading}
              />
              <button
                className={styles["search-button"]}
                disabled={loading}
                onClick={filterStations}
                aria-label="Search"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>

            <button
              className={styles["reset-filters-btn"]}
              onClick={resetFilters}
              disabled={loading}
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className={styles["station-list"]}>
          {loading ? (
            <div className={styles["loading-container"]}>
              <div className={styles["loading-spinner"]}></div>
              <p>Loading police stations...</p>
            </div>
          ) : error ? (
            <div className={styles["error-container"]}>
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
              <button 
                className={styles["retry-btn"]}
                onClick={() => {
                  setError(null);
                  fetchPoliceStations();
                }}
              >
                Retry
              </button>
            </div>
          ) : filteredStations.length > 0 ? (
            filteredStations.map((station, index) => (
              <div key={index} className={styles["station-card"]}>
                <div className={styles["station-header"]}>
                  <h3>{station.name}</h3>
                  <span className={styles["station-type"]}>
                    {station.type || "Police Station"}
                  </span>
                </div>
                <div className={styles["station-details"]}>
                  <div className={styles["detail-item"]}>
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
                      {station.address || `${station.district}, ${station.thana}`}
                    </span>
                  </div>
                  <div className={styles["detail-item"]}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{station.phone || station.phone_number || "N/A"}</span>
                  </div>
                  {station.officer_in_charge && (
                    <div className={styles["detail-item"]}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>{station.officer_in_charge}</span>
                    </div>
                  )}
                </div>
                <div className={styles["station-actions"]}>
                  <a
                    href={`tel:${station.phone || station.phone_number}`}
                    className={styles["call-btn"]}
                    disabled={!station.phone && !station.phone_number}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Call Station
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${station.name}, ${station.address || station.district}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles["map-btn"]}
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
                    View on Map
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className={styles["no-stations"]}>
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
              <button className={styles["reset-btn"]} onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          )}
        </div>

        <div className={styles["modal-footer"]}>
          <button className={styles["cancel-btn"]} onClick={onClose}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
            Cancel & Close
          </button>
          <div className={styles["modal-footer-note"]}>
            <p>For emergencies, always call the national emergency number: <strong>999</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceStationFinder;
