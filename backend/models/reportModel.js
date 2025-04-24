const { pool } = require("../config/db");

class ReportModel {
  /**
   * Create a new crime report
   * @returns {Promise<number>} The ID of the created report
   */
  static async create(
    location,
    time,
    crimeType,
    numCriminals,
    victimGender,
    armed,
    photos,
    videos,
    reporterId = null
  ) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert the crime report
      const [reportResult] = await connection.query(
        `INSERT INTO crime_reports 
        (location, time, crime_type, num_criminals, victim_gender, armed, photos, videos, reporter_id, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          location,
          time,
          crimeType,
          numCriminals,
          victimGender,
          armed,
          JSON.stringify(photos),
          JSON.stringify(videos),
          reporterId,
        ]
      );

      await connection.commit();
      return reportResult.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all reports with parsed media arrays
   * @returns {Promise<Array>} Array of report objects
   */
  static async getAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT cr.*, 
         COUNT(v.id) AS total_validations,
         SUM(CASE WHEN v.is_valid = true THEN 1 ELSE 0 END) AS valid_count,
         SUM(CASE WHEN v.is_valid = false THEN 1 ELSE 0 END) AS invalid_count
         FROM crime_reports cr
         LEFT JOIN validations v ON cr.id = v.report_id
         GROUP BY cr.id
         ORDER BY cr.created_at DESC`
      );

      // Process and return the rows with parsed JSON data
      return rows.map((row) => ({
        ...row,
        photos: row.photos ? JSON.parse(row.photos) : [],
        videos: row.videos ? JSON.parse(row.videos) : [],
      }));
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a single report by ID
   * @returns {Promise<Object|null>} The report object or null if not found
   */
  static async getById(reportId) {
    const connection = await pool.getConnection();
    try {
      // Get the report with validation counts
      const [reports] = await connection.query(
        `SELECT cr.*, 
         COUNT(v.id) AS total_validations,
         SUM(CASE WHEN v.is_valid = true THEN 1 ELSE 0 END) AS valid_count,
         SUM(CASE WHEN v.is_valid = false THEN 1 ELSE 0 END) AS invalid_count
         FROM crime_reports cr
         LEFT JOIN validations v ON cr.id = v.report_id
         WHERE cr.id = ?
         GROUP BY cr.id`,
        [reportId]
      );

      if (reports.length === 0) {
        return null;
      }

      const report = reports[0];

      // Get validations for the report
      const [validations] = await connection.query(
        `SELECT v.*, u.username, u.full_name
         FROM validations v
         JOIN users u ON v.user_id = u.id
         WHERE v.report_id = ?
         ORDER BY v.created_at DESC`,
        [reportId]
      );

      // Get police alerts for the report
      const [alerts] = await connection.query(
        `SELECT pa.*, p.full_name as police_name, p.badge_number, p.station
         FROM police_alerts pa
         LEFT JOIN police p ON pa.police_id = p.id
         WHERE pa.report_id = ?
         ORDER BY pa.created_at DESC`,
        [reportId]
      );

      // Return the report with processed data
      return {
        ...report,
        photos: report.photos ? JSON.parse(report.photos) : [],
        videos: report.videos ? JSON.parse(report.videos) : [],
        validations,
        alerts,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update a report by ID
   * @returns {Promise<number>} Number of affected rows
   */
  static async update(id, updates) {
    const connection = await pool.getConnection();
    try {
      const fieldsToUpdate = [];
      const values = [];

      // Dynamic field updates
      if (updates.location !== undefined) {
        fieldsToUpdate.push("location = ?");
        values.push(updates.location);
      }
      if (updates.time !== undefined) {
        fieldsToUpdate.push("time = ?");
        values.push(new Date(updates.time));
      }
      if (updates.crimeType !== undefined) {
        fieldsToUpdate.push("crime_type = ?");
        values.push(updates.crimeType);
      }
      if (updates.numCriminals !== undefined) {
        fieldsToUpdate.push("num_criminals = ?");
        values.push(updates.numCriminals);
      }
      if (updates.victimGender !== undefined) {
        fieldsToUpdate.push("victim_gender = ?");
        values.push(updates.victimGender);
      }
      if (updates.armed !== undefined) {
        fieldsToUpdate.push("armed = ?");
        values.push(updates.armed);
      }
      if (updates.photos !== undefined) {
        fieldsToUpdate.push("photos = ?");
        values.push(JSON.stringify(updates.photos));
      }
      if (updates.videos !== undefined) {
        fieldsToUpdate.push("videos = ?");
        values.push(JSON.stringify(updates.videos));
      }

      if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields provided for update");
      }

      values.push(id);
      const query = `UPDATE crime_reports SET ${fieldsToUpdate.join(
        ", "
      )} WHERE id = ?`;

      const [result] = await connection.query(query, values);
      return result.affectedRows;
    } catch (error) {
      console.error("Error updating report:", error);
      throw new Error("Failed to update report");
    } finally {
      connection.release();
    }
  }

  /**
   * Delete a report by ID
   * @returns {Promise<number>} Number of affected rows
   */
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        "DELETE FROM crime_reports WHERE id = ?",
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      console.error("Error deleting report:", error);
      throw new Error("Failed to delete report");
    } finally {
      connection.release();
    }
  }

  /**
   * Search reports with filters
   * @returns {Promise<Array>} Array of filtered reports
   */
  static async search({ location, crimeType, startDate, endDate }) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT *, 
          JSON_UNQUOTE(photos) as photos,
          JSON_UNQUOTE(videos) as videos 
        FROM crime_reports 
        WHERE 1=1
      `;
      const values = [];

      if (location) {
        query += " AND location LIKE ?";
        values.push(`%${location}%`);
      }
      if (crimeType) {
        query += " AND crime_type = ?";
        values.push(crimeType);
      }
      if (startDate) {
        query += " AND time >= ?";
        values.push(new Date(startDate));
      }
      if (endDate) {
        query += " AND time <= ?";
        values.push(new Date(endDate));
      }

      query += " ORDER BY created_at DESC";

      const [reports] = await connection.query(query, values);

      return reports.map((report) => ({
        ...report,
        photos: report.photos ? JSON.parse(report.photos) : [],
        videos: report.videos ? JSON.parse(report.videos) : [],
      }));
    } catch (error) {
      console.error("Error searching reports:", error);
      throw new Error("Failed to search reports");
    } finally {
      connection.release();
    }
  }

  static async addValidation(reportId, userId, isValid, comment = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if report exists
      const [reports] = await connection.query(
        "SELECT id FROM crime_reports WHERE id = ?",
        [reportId]
      );

      if (reports.length === 0) {
        throw { status: 404, message: "Report not found" };
      }

      // Check if user already validated this report
      const [existingValidations] = await connection.query(
        "SELECT id FROM validations WHERE report_id = ? AND user_id = ?",
        [reportId, userId]
      );

      if (existingValidations.length > 0) {
        // Update existing validation
        await connection.query(
          "UPDATE validations SET is_valid = ?, comment = ?, updated_at = NOW() WHERE report_id = ? AND user_id = ?",
          [isValid, comment, reportId, userId]
        );
      } else {
        // Create new validation
        await connection.query(
          "INSERT INTO validations (report_id, user_id, is_valid, comment, created_at) VALUES (?, ?, ?, ?, NOW())",
          [reportId, userId, isValid, comment]
        );
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getValidationsCount(reportId) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `SELECT 
         COUNT(*) AS total,
         SUM(CASE WHEN is_valid = true THEN 1 ELSE 0 END) AS valid,
         SUM(CASE WHEN is_valid = false THEN 1 ELSE 0 END) AS invalid
         FROM validations 
         WHERE report_id = ?`,
        [reportId]
      );

      return {
        total: result[0].total || 0,
        valid: result[0].valid || 0,
        invalid: result[0].invalid || 0,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async alertPolice(reportId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if there's already an alert for this report
      const [existingAlerts] = await connection.query(
        "SELECT id FROM police_alerts WHERE report_id = ?",
        [reportId]
      );

      if (existingAlerts.length > 0) {
        // Update existing alert status to confirmed
        await connection.query(
          "UPDATE police_alerts SET status = 'confirmed', updated_at = NOW() WHERE report_id = ?",
          [reportId]
        );
      } else {
        // Create new alert
        await connection.query(
          "INSERT INTO police_alerts (report_id, status, created_at) VALUES (?, 'pending', NOW())",
          [reportId]
        );
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getNearbyReports(latitude, longitude, radiusKm = 10) {
    const connection = await pool.getConnection();
    try {
      // For simplicity, we'll use location strings and filter by name
      // In a production environment, you would use spatial queries with latitude/longitude
      const [rows] = await connection.query(
        `SELECT cr.*, 
         COUNT(v.id) AS total_validations,
         SUM(CASE WHEN v.is_valid = true THEN 1 ELSE 0 END) AS valid_count,
         SUM(CASE WHEN v.is_valid = false THEN 1 ELSE 0 END) AS invalid_count
         FROM crime_reports cr
         LEFT JOIN validations v ON cr.id = v.report_id
         GROUP BY cr.id
         ORDER BY cr.created_at DESC
         LIMIT 50` // Limit for performance
      );

      // Process and return the rows with parsed JSON data
      return rows.map((row) => ({
        ...row,
        photos: row.photos ? JSON.parse(row.photos) : [],
        videos: row.videos ? JSON.parse(row.videos) : [],
      }));
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getPendingAlerts() {
    const connection = await pool.getConnection();
    try {
      const [alerts] = await connection.query(
        `SELECT pa.*, cr.location, cr.time, cr.crime_type, cr.armed,
         COUNT(v.id) AS validation_count,
         SUM(CASE WHEN v.is_valid = true THEN 1 ELSE 0 END) AS confirmed_count
         FROM police_alerts pa
         JOIN crime_reports cr ON pa.report_id = cr.id
         LEFT JOIN validations v ON cr.id = v.report_id
         WHERE pa.status IN ('pending', 'confirmed') 
         GROUP BY pa.id
         ORDER BY pa.created_at DESC`
      );

      return alerts;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateAlert(alertId, updateData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if alert exists
      const [alerts] = await connection.query(
        "SELECT id FROM police_alerts WHERE id = ?",
        [alertId]
      );

      if (alerts.length === 0) {
        throw { status: 404, message: "Alert not found" };
      }

      // Update the alert
      await connection.query(
        `UPDATE police_alerts 
         SET 
           status = ?, 
           police_id = ?, 
           response_details = ?,
           responded_at = NOW(),
           updated_at = NOW()
         WHERE id = ?`,
        [
          updateData.status,
          updateData.police_id,
          updateData.response_details || null,
          alertId,
        ]
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ReportModel;
