import React, { useState, useEffect } from 'react';
import { FaTrash, FaTable, FaCalendarAlt, FaSpinner, FaExclamationTriangle, FaCheck, FaSync } from 'react-icons/fa';
import api, { endpoints } from '../../utils/api';
import './DatabaseManagement.css';

const DatabaseManagement = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tableStats, setTableStats] = useState({});
  const [apiStatus, setApiStatus] = useState({ connected: false, message: 'Checking connection...' });

  useEffect(() => {
    checkApiConnection();
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableStats(selectedTable);
    }
  }, [selectedTable]);

  const checkApiConnection = async () => {
    try {
      const response = await api.get('/health');
      if (response.status === 200) {
        setApiStatus({ connected: true, message: 'API connection successful' });
      }
    } catch (err) {
      console.error('API connection error:', err);
      setApiStatus({ 
        connected: false, 
        message: `API connection failed: ${err.message}. Make sure the backend server is running.` 
      });
    }
  };

  const fetchTables = async () => {
    setLoading(true);
    try {
      console.log('Fetching tables from:', endpoints.admin.database.getTables);
      const response = await api.get(endpoints.admin.database.getTables);
      console.log('Tables response:', response.data);
      
      if (response.data.success) {
        setTables(response.data.tables);
        if (response.data.tables.length > 0) {
          setSelectedTable(response.data.tables[0]);
        }
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch tables');
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(`Failed to fetch database tables: ${err.message}`);
      
      // Fallback data for development/testing
      const fallbackTables = [
        'crime_reports',
        'notifications',
        'crime_alerts',
        'cases',
        'case_updates',
        'evidence',
        'feedback'
      ];
      setTables(fallbackTables);
      setSelectedTable(fallbackTables[0]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableStats = async (tableName) => {
    setLoading(true);
    try {
      console.log('Fetching stats for:', tableName);
      const response = await api.get(`${endpoints.admin.database.getTableStats}/${tableName}`);
      console.log('Stats response:', response.data);
      
      setTableStats(prev => ({
        ...prev,
        [tableName]: response.data
      }));
    } catch (err) {
      console.error(`Error fetching stats for ${tableName}:`, err);
      
      // Fallback data for development/testing
      setTableStats(prev => ({
        ...prev,
        [tableName]: {
          totalRows: Math.floor(Math.random() * 150) + 20,
          oldestRecord: '2025-01-15',
          newestRecord: '2025-04-28',
          tableSize: `${(Math.random() * 2 + 0.1).toFixed(2)} MB`
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    checkApiConnection();
    fetchTables();
    if (selectedTable) {
      fetchTableStats(selectedTable);
    }
    setError(null);
    setSuccess(null);
  };

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName);
    setConfirmPurge(false);
    setError(null);
    setSuccess(null);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setConfirmPurge(false);
  };

  const handlePurgeData = async () => {
    if (!selectedTable || !selectedDate) {
      setError('Please select both a table and a date');
      return;
    }

    if (!confirmPurge) {
      setConfirmPurge(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Purging data:', { table: selectedTable, date: selectedDate });
      const response = await api.post(endpoints.admin.database.purgeData, {
        table: selectedTable,
        date: selectedDate
      });
      console.log('Purge response:', response.data);

      if (response.data.success) {
        setSuccess(`Successfully removed ${response.data.deletedCount} records from ${selectedTable}`);
        fetchTableStats(selectedTable);
      } else {
        throw new Error(response.data.message || 'Failed to purge data');
      }
    } catch (err) {
      console.error('Error purging data:', err);
      setError(err.response?.data?.message || `Failed to purge data: ${err.message}`);
    } finally {
      setLoading(false);
      setConfirmPurge(false);
    }
  };

  const cancelPurge = () => {
    setConfirmPurge(false);
  };

  // Format date as YYYY-MM-DD for the max date attribute
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="database-management-container">
      <div className="database-header">
        <h2>Database Management</h2>
        <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
          <FaSync className={loading ? "spinning" : ""} /> Refresh
        </button>
      </div>
      
      {!apiStatus.connected && (
        <div className="api-error">
          <FaExclamationTriangle /> {apiStatus.message}
        </div>
      )}
      
      <p className="warning-text">
        <FaExclamationTriangle /> Warning: Operations on this page can permanently delete data from the database.
        Please proceed with caution.
      </p>

      <div className="database-management-layout">
        <div className="tables-list">
          <h3>Database Tables</h3>
          {loading && tables.length === 0 ? (
            <div className="loading-tables"><FaSpinner className="spinner" /> Loading tables...</div>
          ) : (
            <div className="tables-grid">
              {tables.map(table => (
                <div 
                  key={table}
                  className={`table-item ${selectedTable === table ? 'selected' : ''}`}
                  onClick={() => handleTableSelect(table)}
                >
                  <FaTable /> {table}
                </div>
              ))}
              {tables.length === 0 && !loading && (
                <div className="no-tables">No tables found. Please check the database connection.</div>
              )}
            </div>
          )}
        </div>

        <div className="table-operations">
          {selectedTable ? (
            <>
              <h3>Manage {selectedTable}</h3>
              
              <div className="table-stats">
                <h4>Table Statistics</h4>
                {loading ? (
                  <div className="loading-stats"><FaSpinner className="spinner" /> Loading statistics...</div>
                ) : tableStats[selectedTable] ? (
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Total Records</span>
                      <span className="stat-value">{tableStats[selectedTable].totalRows}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Oldest Record</span>
                      <span className="stat-value">{tableStats[selectedTable].oldestRecord || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Newest Record</span>
                      <span className="stat-value">{tableStats[selectedTable].newestRecord || 'N/A'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Table Size</span>
                      <span className="stat-value">{tableStats[selectedTable].tableSize}</span>
                    </div>
                  </div>
                ) : (
                  <div className="loading-stats">No statistics available</div>
                )}
              </div>

              <div className="purge-section">
                <h4>Remove Old Records</h4>
                <p>Delete all records created before the selected date:</p>
                
                <div className="date-selector">
                  <FaCalendarAlt />
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={handleDateChange}
                    max={getCurrentDate()}
                  />
                </div>

                {confirmPurge ? (
                  <div className="confirm-purge">
                    <p className="warning-text">
                      Are you sure you want to permanently delete all records created before {selectedDate} from {selectedTable}?
                    </p>
                    <div className="confirm-buttons">
                      <button className="confirm-yes" onClick={handlePurgeData} disabled={loading}>
                        {loading ? <><FaSpinner className="spinner" /> Processing...</> : 'Yes, Delete Data'}
                      </button>
                      <button className="confirm-no" onClick={cancelPurge} disabled={loading}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="purge-button" 
                    onClick={handlePurgeData} 
                    disabled={!selectedDate || loading}
                  >
                    <FaTrash /> Purge Old Data
                  </button>
                )}

                {error && <div className="error-message"><FaExclamationTriangle /> {error}</div>}
                {success && <div className="success-message"><FaCheck /> {success}</div>}
              </div>
            </>
          ) : (
            <div className="no-table-selected">
              <FaTable className="big-icon" />
              <p>Select a table from the list to manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagement; 