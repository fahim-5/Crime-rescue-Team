const { pool } = require("../config/db");

/**
 * Crime Alert Data Model
 * Handles all database operations related to crime alerts
 */
const CrimeAlertModel = {
  /**
   * Create a new crime alert
   * @param {Object} data Alert data
   * @returns {Promise<Object>} Created alert
   */
  createAlert: async (data) => {
    const connection = await pool.getConnection();
    try {
      const query = `
        INSERT INTO crime_alerts (
          report_id, 
          type, 
          location, 
          description, 
          status,
          created_at
          -- details -- Comment out the details column for now
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const values = [
        data.report_id,
        data.type,
        data.location,
        data.description,
        data.status || "active",
        // JSON.stringify(data.details || {}), -- Comment out until column exists
      ];

      const [result] = await connection.execute(query, values);

      if (!result.insertId) {
        throw new Error("Failed to create crime alert");
      }

      return {
        id: result.insertId,
        ...data,
        details: {}, // Use empty object
        created_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error(`Database error in createAlert: ${err.message}`);
      throw new Error("Failed to create crime alert. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get crime alerts by location
   * @param {string} location Location string (District-Thana format)
   * @returns {Promise<Array>} Array of crime alerts
   */
  getAlertsByLocation: async (location) => {
    const connection = await pool.getConnection();
    try {
      console.log(
        `DB Query - searching for alerts with location like: %${location}%`
      );

      // Use a more flexible query to match locations
      const query = `
        SELECT 
          ca.id,
          ca.report_id,
          ca.type,
          ca.location,
          ca.description,
          ca.status,
          ca.created_at,
          -- ca.details, -- Comment out the details column for now
          cr.time as timestamp
        FROM 
          crime_alerts ca
        LEFT JOIN 
          crime_reports cr ON ca.report_id = cr.id
        WHERE 
          ca.location LIKE ? AND ca.status = 'active'
        ORDER BY 
          ca.created_at DESC
      `;

      // Use % to match any characters before or after the location
      const searchPattern = `%${location}%`;
      console.log("Search pattern:", searchPattern);

      const [alerts] = await connection.execute(query, [searchPattern]);

      console.log(`DB found ${alerts.length} matching alerts`);

      if (alerts.length > 0) {
        console.log("First alert location:", alerts[0].location);
      }

      return alerts.map((alert) => ({
        ...alert,
        details: {}, // Use empty object instead of parsing
        created_at: alert.created_at.toISOString(),
        timestamp: alert.timestamp
          ? new Date(alert.timestamp).toISOString()
          : null,
      }));
    } catch (err) {
      console.error(`Database error in getAlertsByLocation: ${err.message}`);
      throw new Error("Failed to fetch crime alerts. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get all crime alerts
   * @param {Object} options Query options (limit, offset, status)
   * @returns {Promise<Array>} Array of crime alerts
   */
  getAllAlerts: async (options = {}) => {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT 
          ca.id,
          ca.report_id,
          ca.type,
          ca.location,
          ca.description,
          ca.status,
          ca.created_at,
          -- ca.details, -- Comment out the details column for now
          cr.time as timestamp
        FROM 
          crime_alerts ca
        LEFT JOIN 
          crime_reports cr ON ca.report_id = cr.id
      `;

      const values = [];

      // Filter by status if specified
      if (options.status && options.status !== "all") {
        query += " WHERE ca.status = ?";
        values.push(options.status);
      }

      // Order by creation date
      query += " ORDER BY ca.created_at DESC";

      // Apply limit and offset
      if (options.limit) {
        query += " LIMIT ?";
        values.push(parseInt(options.limit));

        if (options.offset) {
          query += " OFFSET ?";
          values.push(parseInt(options.offset));
        }
      }

      const [alerts] = await connection.execute(query, values);

      return alerts.map((alert) => ({
        ...alert,
        // Set details to empty object if the column doesn't exist in the result
        details: {},
        created_at: alert.created_at.toISOString(),
        timestamp: alert.timestamp
          ? new Date(alert.timestamp).toISOString()
          : null,
      }));
    } catch (err) {
      console.error(`Database error in getAllAlerts: ${err.message}`);
      throw new Error("Failed to fetch crime alerts. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Update alert status
   * @param {number} alertId Alert ID
   * @param {string} status New status
   * @returns {Promise<boolean>} Success indicator
   */
  updateAlertStatus: async (alertId, status) => {
    const connection = await pool.getConnection();
    try {
      const query = `
        UPDATE crime_alerts
        SET status = ?
        WHERE id = ?
      `;

      const [result] = await connection.execute(query, [status, alertId]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Database error in updateAlertStatus: ${err.message}`);
      throw new Error("Failed to update alert status. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get a specific alert by ID
   * @param {number} alertId Alert ID
   * @returns {Promise<Object|null>} Alert object or null if not found
   */
  getAlertById: async (alertId) => {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT 
          ca.id,
          ca.report_id,
          ca.type,
          ca.location,
          ca.description,
          ca.status,
          ca.created_at,
          -- ca.details, -- Comment out the details column for now
          cr.time as timestamp
        FROM 
          crime_alerts ca
        LEFT JOIN 
          crime_reports cr ON ca.report_id = cr.id
        WHERE
          ca.id = ?
      `;

      const [alerts] = await connection.execute(query, [alertId]);

      if (alerts.length === 0) {
        return null;
      }

      const alert = alerts[0];
      return {
        ...alert,
        details: {}, // Use empty object instead of parsing
        created_at: alert.created_at.toISOString(),
        timestamp: alert.timestamp
          ? new Date(alert.timestamp).toISOString()
          : null,
      };
    } catch (err) {
      console.error(`Database error in getAlertById: ${err.message}`);
      throw new Error("Failed to fetch crime alert. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },
};

module.exports = CrimeAlertModel;
