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

  /**
   * Get count of reports by status
   * @param {string} status Report status
   * @returns {Promise<number>} Count of reports
   */
  getReportsCountByStatus: async (status) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT COUNT(*) as count
         FROM crime_reports
         WHERE status = ?`,
        [status]
      );

      return rows[0].count || 0;
    } catch (error) {
      console.error(
        `Database error in getReportsCountByStatus: ${error.message}`
      );
      throw new Error(
        "Failed to fetch crime reports count. Please try again later."
      );
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get pending cases count
   * @returns {Promise<number>} Count of pending cases
   */
  getPendingCasesCount: async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT COUNT(*) as count
         FROM crime_reports
         WHERE status = 'pending'`
      );

      return rows[0].count || 0;
    } catch (error) {
      console.error(`Database error in getPendingCasesCount: ${error.message}`);
      throw new Error(
        "Failed to fetch pending cases count. Please try again later."
      );
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get active investigations count
   * @returns {Promise<number>} Count of active investigations
   */
  getActiveInvestigationsCount: async () => {
    const connection = await pool.getConnection();
    try {
      // Try multiple potential status values that might be used for investigating
      const [rows] = await connection.query(
        `SELECT COUNT(*) as count
         FROM crime_reports
         WHERE status IN ('investigating', 'validating', 'investigation')`
      );

      return rows[0].count || 0;
    } catch (error) {
      console.error(
        `Database error in getActiveInvestigationsCount: ${error.message}`
      );
      throw new Error(
        "Failed to fetch active investigations count. Please try again later."
      );
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get solved cases count
   * @returns {Promise<number>} Count of solved cases
   */
  getSolvedCasesCount: async () => {
    const connection = await pool.getConnection();
    try {
      // Try multiple potential status values that might be used for resolved cases
      const [rows] = await connection.query(
        `SELECT COUNT(*) as count
         FROM crime_reports
         WHERE status IN ('resolved', 'closed', 'completed', 'solved')`
      );

      return rows[0].count || 0;
    } catch (error) {
      console.error(`Database error in getSolvedCasesCount: ${error.message}`);
      throw new Error(
        "Failed to fetch solved cases count. Please try again later."
      );
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get clearance rate (percentage of solved cases compared to total)
   * @returns {Promise<Object>} Object containing clearance rate data
   */
  getClearanceRate: async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          COUNT(*) as total_reports,
          SUM(CASE WHEN status IN ('resolved', 'closed', 'completed', 'solved') THEN 1 ELSE 0 END) as solved_reports
         FROM crime_reports`
      );

      const totalReports = rows[0].total_reports || 0;
      const solvedReports = rows[0].solved_reports || 0;

      // Calculate clearance rate (avoid division by zero)
      const clearanceRate =
        totalReports > 0 ? Math.round((solvedReports / totalReports) * 100) : 0;

      return {
        totalReports,
        solvedReports,
        clearanceRate,
      };
    } catch (error) {
      console.error(`Database error in getClearanceRate: ${error.message}`);
      throw new Error(
        "Failed to calculate clearance rate. Please try again later."
      );
    } finally {
      if (connection) await connection.release();
    }
  },

  /**
   * Get crime reports statistics
   * @returns {Promise<Object>} Object containing various statistics
   */
  getReportsStatistics: async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          COUNT(*) as total_reports,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_cases,
          SUM(CASE WHEN status IN ('investigating', 'validating', 'investigation') THEN 1 ELSE 0 END) as active_investigations,
          SUM(CASE WHEN status IN ('resolved', 'closed', 'completed', 'solved') THEN 1 ELSE 0 END) as solved_cases
         FROM crime_reports`
      );

      const totalReports = rows[0].total_reports || 0;
      const pendingCases = rows[0].pending_cases || 0;
      const activeInvestigations = rows[0].active_investigations || 0;
      const solvedCases = rows[0].solved_cases || 0;

      // Calculate clearance rate (avoid division by zero)
      const clearanceRate =
        totalReports > 0 ? Math.round((solvedCases / totalReports) * 100) : 0;

      return {
        totalReports,
        pendingCases,
        activeInvestigations,
        solvedCases,
        clearanceRate,
      };
    } catch (error) {
      console.error(`Database error in getReportsStatistics: ${error.message}`);
      throw new Error(
        "Failed to fetch report statistics. Please try again later."
      );
    } finally {
      if (connection) await connection.release();
    }
  },
};

module.exports = CrimeReportModel;
