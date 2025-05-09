const { pool } = require("../config/db");

/**
 * Crime Report Model
 * Handles all database operations related to crime reports
 */
const CrimeReportModel = {
  /**
   * Get all crime reports
   * @returns {Promise<Array>} Array of crime report objects
   */
  getAllReports: async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          cr.*,
          cc.name as category_name,
          cc.severity_level,
          p.full_name as assigned_officer_name,
          p.badge_number,
          p.station
        FROM 
          crime_reports cr
        LEFT JOIN 
          crime_categories cc ON cr.category_id = cc.id
        LEFT JOIN 
          police p ON cr.police_id = p.police_id
        ORDER BY 
          cr.created_at DESC`
      );

      return rows.map((row) => {
        // Parse JSON fields if they exist
        const photos = row.photos ? JSON.parse(row.photos) : [];
        const videos = row.videos ? JSON.parse(row.videos) : [];

        return {
          ...row,
          photos,
          videos,
        };
      });
    } catch (error) {
      console.error("Database error in getAllReports:", error.message);
      throw new Error("Failed to fetch crime reports. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get crime report by ID
   * @param {number} id Report ID
   * @returns {Promise<Object>} Crime report object
   */
  getReportById: async (id) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          cr.*,
          cc.name as category_name,
          cc.severity_level,
          p.full_name as assigned_officer_name,
          p.badge_number,
          p.station
        FROM 
          crime_reports cr
        LEFT JOIN 
          crime_categories cc ON cr.category_id = cc.id
        LEFT JOIN 
          police p ON cr.police_id = p.police_id
        WHERE 
          cr.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const report = rows[0];

      // Parse JSON fields if they exist
      const photos = report.photos ? JSON.parse(report.photos) : [];
      const videos = report.videos ? JSON.parse(report.videos) : [];

      return {
        ...report,
        photos,
        videos,
      };
    } catch (error) {
      console.error(`Database error in getReportById: ${error.message}`);
      throw new Error("Failed to fetch crime report. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get reports by status
   * @param {string} status Report status
   * @returns {Promise<Array>} Array of crime report objects
   */
  getReportsByStatus: async (status) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          cr.*,
          cc.name as category_name,
          cc.severity_level,
          p.full_name as assigned_officer_name,
          p.badge_number,
          p.station
        FROM 
          crime_reports cr
        LEFT JOIN 
          crime_categories cc ON cr.category_id = cc.id
        LEFT JOIN 
          police p ON cr.police_id = p.police_id
        WHERE 
          cr.status = ?
        ORDER BY 
          cr.created_at DESC`,
        [status]
      );

      return rows.map((row) => {
        // Parse JSON fields if they exist
        const photos = row.photos ? JSON.parse(row.photos) : [];
        const videos = row.videos ? JSON.parse(row.videos) : [];

        return {
          ...row,
          photos,
          videos,
        };
      });
    } catch (error) {
      console.error(`Database error in getReportsByStatus: ${error.message}`);
      throw new Error("Failed to fetch crime reports. Please try again later.");
    } finally {
      if (connection) await connection.release();
    }
  },
};

module.exports = CrimeReportModel;
