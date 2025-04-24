const { pool } = require("../config/db");

/**
 * Simple logging utility
 */
const log = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`)
};

/**
 * Police Request Data Model
 * Handles all database operations related to police registration requests
 */
const RequestModel = {
  /**
   * Fetches all pending police registration requests
   * @returns {Promise<Array>} Array of police request objects
   * @throws {Error} If database operation fails
   */
  getAllPoliceRequests: async () => {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT 
          id,
          full_name,
          email,
          mobile_no AS mobile,
          police_id,
          badge_number,
          rank,
          station,
          joining_date,
          status,
          national_id,
          address,
          created_at
        FROM users
        WHERE role = 'police' AND status = 'pending'
        ORDER BY created_at DESC
      `;
      
      const [requests] = await connection.execute(query);
      
      if (!requests || requests.length === 0) {
        log.info("No pending police requests found");
        return [];
      }

      return requests;
    } catch (err) {
      log.error(`Database error in getAllPoliceRequests: ${err.message}`);
      throw new Error("Failed to fetch police requests. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Gets a single police request by police ID
   * @param {string} policeId - The police ID to search for
   * @returns {Promise<Object|null>} The police request object or null if not found
   * @throws {Error} If database operation fails
   */
  getPoliceRequestByPoliceId: async (policeId) => {
    if (!policeId) {
      throw new Error("Police ID is required");
    }

    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT 
          id,
          full_name,
          email,
          mobile_no AS mobile,
          police_id,
          badge_number,
          rank,
          station,
          joining_date,
          status,
          national_id,
          address,
          created_at
        FROM users 
        WHERE police_id = ? AND role = 'police'
        LIMIT 1
      `;

      const [requests] = await connection.execute(query, [policeId]);
      
      if (requests.length === 0) {
        log.warn(`No police request found for ID: ${policeId}`);
        return null;
      }

      return requests[0];
    } catch (err) {
      log.error(`Database error in getPoliceRequestByPoliceId for ID ${policeId}: ${err.message}`);
      throw new Error("Failed to fetch police request details");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Approves a police registration request
   * @param {string} policeId - The police ID to approve
   * @returns {Promise<boolean>} True if approval was successful
   * @throws {Error} If database operation fails
   */
  approvePoliceRequest: async (policeId) => {
    if (!policeId) {
      throw new Error("Police ID is required");
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update status in users table
      const [result] = await connection.execute(
        `UPDATE users SET status = 'approved' WHERE police_id = ? AND role = 'police'`,
        [policeId]
      );

      if (result.affectedRows === 0) {
        throw new Error("No police request found with the provided ID");
      }

      await connection.commit();
      log.info(`Approved police request for ID: ${policeId}`);
      return true;
    } catch (err) {
      await connection.rollback();
      log.error(`Error approving police request ${policeId}: ${err.message}`);
      throw new Error(`Failed to approve request: ${err.message}`);
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Rejects and deletes a police registration request
   * @param {string} policeId - The police ID to reject
   * @returns {Promise<boolean>} True if rejection was successful
   * @throws {Error} If database operation fails
   */
  rejectPoliceRequest: async (policeId) => {
    if (!policeId) {
      throw new Error("Police ID is required");
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // First verify the request exists
      const [check] = await connection.execute(
        `SELECT 1 FROM users WHERE police_id = ? AND role = 'police' LIMIT 1`,
        [policeId]
      );

      if (check.length === 0) {
        throw new Error("No police request found with the provided ID");
      }

      // Delete from users table
      await connection.execute(
        `DELETE FROM users WHERE police_id = ? AND role = 'police'`,
        [policeId]
      );

      // Delete from police table if exists
      await connection.execute(
        `DELETE FROM police WHERE police_id = ?`,
        [policeId]
      );

      await connection.commit();
      log.info(`Rejected police request for ID: ${policeId}`);
      return true;
    } catch (err) {
      await connection.rollback();
      log.error(`Error rejecting police request ${policeId}: ${err.message}`);
      throw new Error(`Failed to reject request: ${err.message}`);
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Checks if a police ID already exists
   * @param {string} policeId - The police ID to check
   * @returns {Promise<boolean>} True if the ID exists
   * @throws {Error} If database operation fails
   */
  policeIdExists: async (policeId) => {
    if (!policeId) {
      throw new Error("Police ID is required");
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 1 FROM users WHERE police_id = ? LIMIT 1`,
        [policeId]
      );
      return rows.length > 0;
    } catch (err) {
      log.error(`Error checking police ID existence ${policeId}: ${err.message}`);
      throw new Error("Failed to check police ID existence");
    } finally {
      if (connection) await connection.release();
    }
  }
};

module.exports = RequestModel;