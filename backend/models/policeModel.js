const { pool } = require("../config/db");

class PoliceModel {
  /**
   * Get dashboard statistics for a police officer
   * @param {number} policeId - ID of the police officer
   * @returns {Promise<Object>} Dashboard statistics
   */
  static async getDashboardStats(policeId) {
    const connection = await pool.getConnection();
    try {
      // Get case counts by status
      const [statusCounts] = await connection.query(
        `SELECT 
          COUNT(CASE WHEN pa.status = 'pending' THEN 1 END) AS pendingCases,
          COUNT(CASE WHEN pa.status = 'confirmed' THEN 1 END) AS confirmedCount,
          COUNT(CASE WHEN pa.status = 'responded' THEN 1 END) AS respondedCount,
          COUNT(CASE WHEN pa.status = 'closed' THEN 1 END) AS solvedCases,
          COUNT(*) AS totalCount
        FROM police_alerts pa
        WHERE pa.police_id = ? OR pa.police_id IS NULL`,
        [policeId]
      );

      // Get active investigations count
      const [activeInvestigations] = await connection.query(
        `SELECT COUNT(*) as activeInvestigations
         FROM cases
         WHERE status = 'investigating' 
         AND assigned_to = ?`,
        [policeId]
      );

      // Weekly trend calculations
      const [weeklyTrends] = await connection.query(
        `SELECT 
          COUNT(CASE WHEN pa.status = 'pending' AND pa.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) -
          COUNT(CASE WHEN pa.status = 'pending' AND pa.created_at BETWEEN DATE_SUB(NOW(), INTERVAL 14 DAY) AND DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END)
          AS pendingChange,
          
          COUNT(CASE WHEN pa.status = 'closed' AND pa.updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) -
          COUNT(CASE WHEN pa.status = 'closed' AND pa.updated_at BETWEEN DATE_SUB(NOW(), INTERVAL 14 DAY) AND DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END)
          AS solvedChange,
          
          COUNT(CASE WHEN pa.status IN ('confirmed','responded') AND pa.updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) -
          COUNT(CASE WHEN pa.status IN ('confirmed','responded') AND pa.updated_at BETWEEN DATE_SUB(NOW(), INTERVAL 14 DAY) AND DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END)
          AS activeChange
        FROM police_alerts pa
        WHERE pa.police_id = ? OR pa.police_id IS NULL`,
        [policeId]
      );

      return {
        pendingCases: statusCounts[0]?.pendingCases || 0,
        solvedCases: statusCounts[0]?.solvedCases || 0,
        activeInvestigations: activeInvestigations[0]?.activeInvestigations || 0,
        trends: {
          pendingChange: weeklyTrends[0]?.pendingChange || 0,
          solvedChange: weeklyTrends[0]?.solvedChange || 0,
          activeChange: weeklyTrends[0]?.activeChange || 0
        }
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get recent reports for police dashboard
   * @param {number} policeId - ID of the police officer
   * @returns {Promise<Array>} Recent reports
   */
  static async getRecentReports(policeId) {
    const connection = await pool.getConnection();
    try {
      // Get police station for location filtering
      const [policeInfo] = await connection.query(
        `SELECT station FROM police WHERE id = ?`,
        [policeId]
      );
      
      const policeStation = policeInfo[0]?.station || '';

      // Get recent reports from the area or assigned to this police officer
      const [reports] = await connection.query(
        `SELECT 
          cr.id,
          cr.crime_id,
          cr.crime_type as type,
          cr.location,
          cr.created_at as reportedAt,
          CASE 
            WHEN pa.status IS NOT NULL THEN pa.status
            ELSE cr.status
          END as status
        FROM crime_reports cr
        LEFT JOIN police_alerts pa ON cr.id = pa.report_id
        WHERE 
          (cr.location LIKE ? OR pa.police_id = ?)
          AND cr.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY cr.created_at DESC
        LIMIT 10`,
        [`%${policeStation}%`, policeId]
      );

      return reports;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get cases assigned to a police officer
   * @param {number} policeId - ID of the police officer
   * @param {string} status - Filter by status (optional)
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Array>} Assigned cases
   */
  static async getAssignedCases(policeId, status, { page, limit }) {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      let query = `
        SELECT pa.*, cr.location, cr.time, cr.crime_type, cr.armed,
          COUNT(v.id) AS validation_count,
          SUM(CASE WHEN v.is_valid = true THEN 1 ELSE 0 END) AS confirmed_count
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        LEFT JOIN validations v ON cr.id = v.report_id
        WHERE pa.police_id = ?
      `;

      const queryParams = [policeId];

      if (status) {
        query += ` AND pa.status = ?`;
        queryParams.push(status);
      }

      query += `
        GROUP BY pa.id
        ORDER BY 
          CASE 
            WHEN pa.status = 'pending' THEN 1
            WHEN pa.status = 'confirmed' THEN 2
            WHEN pa.status = 'responded' THEN 3
            WHEN pa.status = 'closed' THEN 4
            ELSE 5
          END,
          pa.created_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(parseInt(limit), offset);

      const [cases] = await connection.query(query, queryParams);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) AS total
        FROM police_alerts
        WHERE police_id = ?
      `;

      const countParams = [policeId];

      if (status) {
        countQuery += ` AND status = ?`;
        countParams.push(status);
      }

      const [countResult] = await connection.query(countQuery, countParams);
      const totalCount = countResult[0].total;

      return {
        cases,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get police officer details
   * @param {number} policeId - ID of the police officer
   * @returns {Promise<Object>} Police officer details
   */
  static async getPoliceDetails(policeId) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `SELECT id, full_name, username, email, police_id, station, rank, badge_number
        FROM police
        WHERE id = ?`,
        [policeId]
      );

      return result[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get pending cases in a specific area/station
   * @param {string} station - Police station/area
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Array>} Pending cases
   */
  static async getPendingCases(station, { page, limit }) {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT pa.*, cr.location, cr.time, cr.crime_type, cr.armed,
          COUNT(v.id) AS validation_count,
          SUM(CASE WHEN v.is_valid = true THEN 1 ELSE 0 END) AS confirmed_count
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        LEFT JOIN validations v ON cr.id = v.report_id
        WHERE pa.status IN ('pending', 'confirmed')
          AND cr.location LIKE ?
          AND (pa.police_id IS NULL OR pa.police_id = 0)
        GROUP BY pa.id
        ORDER BY pa.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [cases] = await connection.query(query, [
        `%${station}%`,
        parseInt(limit),
        offset,
      ]);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        WHERE pa.status IN ('pending', 'confirmed')
          AND cr.location LIKE ?
          AND (pa.police_id IS NULL OR pa.police_id = 0)
      `;

      const [countResult] = await connection.query(countQuery, [
        `%${station}%`,
      ]);
      const totalCount = countResult[0].total;

      return {
        cases,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get resolved cases by a police officer
   * @param {number} policeId - ID of the police officer
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Array>} Resolved cases
   */
  static async getResolvedCases(policeId, { page, limit }) {
    const connection = await pool.getConnection();
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT pa.*, cr.location, cr.time, cr.crime_type, cr.armed,
          COUNT(v.id) AS validation_count,
          SUM(CASE WHEN v.is_valid = true THEN 1 ELSE 0 END) AS confirmed_count
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        LEFT JOIN validations v ON cr.id = v.report_id
        WHERE pa.police_id = ?
          AND pa.status IN ('responded', 'closed')
        GROUP BY pa.id
        ORDER BY pa.updated_at DESC
        LIMIT ? OFFSET ?
      `;

      const [cases] = await connection.query(query, [
        policeId,
        parseInt(limit),
        offset,
      ]);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM police_alerts
        WHERE police_id = ? AND status IN ('responded', 'closed')
      `;

      const [countResult] = await connection.query(countQuery, [policeId]);
      const totalCount = countResult[0].total;

      return {
        cases,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Add case history record
   * @param {number} alertId - ID of the alert
   * @param {number} policeId - ID of the police officer
   * @param {string} status - New status
   * @param {string} details - Additional details
   * @returns {Promise<Object>} Result
   */
  static async addCaseHistory(alertId, policeId, status, details = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO case_history 
          (alert_id, police_id, status, details, created_at)
        VALUES (?, ?, ?, ?, NOW())`,
        [alertId, policeId, status, details]
      );

      await connection.commit();
      return { id: result.insertId, success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Add notes to a case
   * @param {number} alertId - ID of the alert
   * @param {number} policeId - ID of the police officer
   * @param {string} notes - Case notes
   * @returns {Promise<Object>} Result
   */
  static async addCaseNotes(alertId, policeId, notes) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO case_notes 
          (alert_id, police_id, notes, created_at)
        VALUES (?, ?, ?, NOW())`,
        [alertId, policeId, notes]
      );

      await connection.commit();
      return { id: result.insertId, success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get detailed information about a case
   * @param {number} alertId - ID of the alert
   * @returns {Promise<Object>} Case details
   */
  static async getCaseDetails(alertId) {
    const connection = await pool.getConnection();
    try {
      const [alerts] = await connection.query(
        `SELECT pa.*, 
          cr.location, cr.time, cr.crime_type, cr.armed, cr.num_criminals, 
          cr.victim_gender, cr.photos, cr.videos,
          u.username as reporter_username, u.full_name as reporter_name,
          p.full_name as police_name, p.badge_number, p.rank, p.station
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        LEFT JOIN users u ON cr.reporter_id = u.id
        LEFT JOIN police p ON pa.police_id = p.id
        WHERE pa.id = ?`,
        [alertId]
      );

      if (alerts.length === 0) {
        return null;
      }

      const alert = alerts[0];

      // Parse JSON data
      if (alert.photos) {
        alert.photos = JSON.parse(alert.photos);
      }

      if (alert.videos) {
        alert.videos = JSON.parse(alert.videos);
      }

      return alert;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get case history
   * @param {number} alertId - ID of the alert
   * @returns {Promise<Array>} Case history
   */
  static async getCaseHistory(alertId) {
    const connection = await pool.getConnection();
    try {
      const [history] = await connection.query(
        `SELECT ch.*, p.full_name as police_name, p.badge_number, p.rank
        FROM case_history ch
        LEFT JOIN police p ON ch.police_id = p.id
        WHERE ch.alert_id = ?
        ORDER BY ch.created_at DESC`,
        [alertId]
      );

      return history;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get case notes
   * @param {number} alertId - ID of the alert
   * @returns {Promise<Array>} Case notes
   */
  static async getCaseNotes(alertId) {
    const connection = await pool.getConnection();
    try {
      const [notes] = await connection.query(
        `SELECT cn.*, p.full_name as police_name, p.badge_number, p.rank
        FROM case_notes cn
        LEFT JOIN police p ON cn.police_id = p.id
        WHERE cn.alert_id = ?
        ORDER BY cn.created_at DESC`,
        [alertId]
      );

      return notes;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Search for cases based on criteria
   * @param {number} policeId - ID of the police officer
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} Search results
   */
  static async searchCases(policeId, searchParams) {
    const connection = await pool.getConnection();
    try {
      const {
        query,
        status,
        location,
        crimeType,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = searchParams;

      const offset = (page - 1) * limit;

      let sqlQuery = `
        SELECT pa.*, cr.location, cr.time, cr.crime_type, cr.armed,
          COUNT(v.id) AS validation_count,
          SUM(CASE WHEN v.is_valid = true THEN 1 ELSE 0 END) AS confirmed_count
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        LEFT JOIN validations v ON cr.id = v.report_id
        WHERE (pa.police_id = ? OR pa.police_id IS NULL)
      `;

      const queryParams = [policeId];

      // Add search filters
      if (status) {
        sqlQuery += ` AND pa.status = ?`;
        queryParams.push(status);
      }

      if (location) {
        sqlQuery += ` AND cr.location LIKE ?`;
        queryParams.push(`%${location}%`);
      }

      if (crimeType) {
        sqlQuery += ` AND cr.crime_type = ?`;
        queryParams.push(crimeType);
      }

      if (startDate) {
        sqlQuery += ` AND cr.time >= ?`;
        queryParams.push(new Date(startDate));
      }

      if (endDate) {
        sqlQuery += ` AND cr.time <= ?`;
        queryParams.push(new Date(endDate));
      }

      if (query) {
        sqlQuery += ` AND (
          cr.location LIKE ? OR
          cr.crime_type LIKE ? OR
          cr.victim_gender LIKE ?
        )`;
        queryParams.push(`%${query}%`, `%${query}%`, `%${query}%`);
      }

      sqlQuery += `
        GROUP BY pa.id
        ORDER BY pa.created_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(parseInt(limit), offset);

      const [cases] = await connection.query(sqlQuery, queryParams);

      // Build count query
      let countQuery = `
        SELECT COUNT(*) AS total
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        WHERE (pa.police_id = ? OR pa.police_id IS NULL)
      `;

      const countParams = [policeId];

      if (status) {
        countQuery += ` AND pa.status = ?`;
        countParams.push(status);
      }

      if (location) {
        countQuery += ` AND cr.location LIKE ?`;
        countParams.push(`%${location}%`);
      }

      if (crimeType) {
        countQuery += ` AND cr.crime_type = ?`;
        countParams.push(crimeType);
      }

      if (startDate) {
        countQuery += ` AND cr.time >= ?`;
        countParams.push(new Date(startDate));
      }

      if (endDate) {
        countQuery += ` AND cr.time <= ?`;
        countParams.push(new Date(endDate));
      }

      if (query) {
        countQuery += ` AND (
          cr.location LIKE ? OR
          cr.crime_type LIKE ? OR
          cr.victim_gender LIKE ?
        )`;
        countParams.push(`%${query}%`, `%${query}%`, `%${query}%`);
      }

      const [countResult] = await connection.query(countQuery, countParams);
      const totalCount = countResult[0].total;

      return {
        cases,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = PoliceModel;
