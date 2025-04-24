const { pool } = require("../config/db");

class AnalyticsModel {
  /**
   * Get global crime statistics
   * @param {string} timeRange - Time range for data (day, week, month, year, all)
   * @returns {Promise<Object>} Global crime statistics
   */
  static async getGlobalStats(timeRange = "month") {
    const connection = await pool.getConnection();
    try {
      // Create date range filter based on timeRange
      let dateFilter = "";
      if (timeRange !== "all") {
        const dateRanges = {
          day: "DATE(created_at) = CURDATE()",
          week: "created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)",
          month: "created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)",
          year: "created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)",
        };
        dateFilter = `WHERE ${dateRanges[timeRange] || dateRanges.month}`;
      }

      // Get crime counts by type
      const [crimeByType] = await connection.query(`
        SELECT crime_type, COUNT(*) as count
        FROM crime_reports
        ${dateFilter}
        GROUP BY crime_type
        ORDER BY count DESC
      `);

      // Get crime counts by location
      const [crimeByLocation] = await connection.query(`
        SELECT location, COUNT(*) as count
        FROM crime_reports
        ${dateFilter}
        GROUP BY location
        ORDER BY count DESC
        LIMIT 10
      `);

      // Get crime validation statistics
      const [validationStats] = await connection.query(`
        SELECT 
          COUNT(*) as total_validations,
          SUM(CASE WHEN is_valid = true THEN 1 ELSE 0 END) as confirmed_validations,
          SUM(CASE WHEN is_valid = false THEN 1 ELSE 0 END) as rejected_validations
        FROM validations
        ${dateFilter.replace("created_at", "validations.created_at")}
      `);

      // Get report counts by status
      const [reportStatusCounts] = await connection.query(`
        SELECT 
          COUNT(*) as total_reports,
          COUNT(CASE WHEN EXISTS(
            SELECT 1 FROM police_alerts pa WHERE pa.report_id = crime_reports.id
          ) THEN 1 END) as alerted_reports,
          COUNT(CASE WHEN EXISTS(
            SELECT 1 FROM police_alerts pa WHERE pa.report_id = crime_reports.id AND pa.status = 'closed'
          ) THEN 1 END) as resolved_reports
        FROM crime_reports
        ${dateFilter}
      `);

      // Get crimes by time of day
      const [crimesByTime] = await connection.query(`
        SELECT 
          CASE 
            WHEN HOUR(time) BETWEEN 0 AND 5 THEN 'Night (12AM-6AM)'
            WHEN HOUR(time) BETWEEN 6 AND 11 THEN 'Morning (6AM-12PM)'
            WHEN HOUR(time) BETWEEN 12 AND 17 THEN 'Afternoon (12PM-6PM)'
            ELSE 'Evening (6PM-12AM)'
          END as time_of_day,
          COUNT(*) as count
        FROM crime_reports
        ${dateFilter}
        GROUP BY time_of_day
        ORDER BY 
          CASE time_of_day
            WHEN 'Morning (6AM-12PM)' THEN 1
            WHEN 'Afternoon (12PM-6PM)' THEN 2
            WHEN 'Evening (6PM-12AM)' THEN 3
            WHEN 'Night (12AM-6AM)' THEN 4
          END
      `);

      // Get trend data (crimes over time)
      let trendQuery = "";
      let groupBy = "";

      switch (timeRange) {
        case "day":
          trendQuery = `DATE_FORMAT(created_at, '%H:00') as time_period`;
          groupBy = "HOUR(created_at)";
          break;
        case "week":
          trendQuery = `DATE_FORMAT(created_at, '%W') as time_period`;
          groupBy = "DAYOFWEEK(created_at)";
          break;
        case "month":
          trendQuery = `DATE_FORMAT(created_at, '%Y-%m-%d') as time_period`;
          groupBy = "DATE(created_at)";
          break;
        case "year":
          trendQuery = `DATE_FORMAT(created_at, '%Y-%m') as time_period`;
          groupBy = "YEAR(created_at), MONTH(created_at)";
          break;
        default:
          trendQuery = `DATE_FORMAT(created_at, '%Y-%m') as time_period`;
          groupBy = "YEAR(created_at), MONTH(created_at)";
      }

      const [trendData] = await connection.query(`
        SELECT ${trendQuery}, COUNT(*) as count
        FROM crime_reports
        ${dateFilter}
        GROUP BY ${groupBy}
        ORDER BY created_at
      `);

      return {
        crimeByType,
        crimeByLocation,
        validationStats: validationStats[0] || {
          total_validations: 0,
          confirmed_validations: 0,
          rejected_validations: 0,
        },
        reportStatusCounts: reportStatusCounts[0] || {
          total_reports: 0,
          alerted_reports: 0,
          resolved_reports: 0,
        },
        crimesByTime,
        trendData,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get analytics for a specific police officer
   * @param {number} policeId - ID of the police officer
   * @param {string} timeRange - Time range for data (day, week, month, year)
   * @returns {Promise<Object>} Police-specific analytics
   */
  static async getPoliceAnalytics(policeId, timeRange = "month") {
    const connection = await pool.getConnection();
    try {
      // Create date range filter based on timeRange
      const dateRanges = {
        day: "DATE(pa.created_at) = CURDATE()",
        week: "pa.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)",
        month: "pa.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)",
        year: "pa.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)",
      };
      const dateFilter = dateRanges[timeRange] || dateRanges.month;

      // Get case status distribution
      const [caseStatusDistribution] = await connection.query(
        `
        SELECT 
          pa.status,
          COUNT(*) as count
        FROM police_alerts pa
        WHERE pa.police_id = ? AND ${dateFilter}
        GROUP BY pa.status
      `,
        [policeId]
      );

      // Get response time statistics
      const [responseTimeStats] = await connection.query(
        `
        SELECT 
          AVG(TIMESTAMPDIFF(HOUR, pa.created_at, pa.responded_at)) as avg_response_time_hours,
          MIN(TIMESTAMPDIFF(HOUR, pa.created_at, pa.responded_at)) as min_response_time_hours,
          MAX(TIMESTAMPDIFF(HOUR, pa.created_at, pa.responded_at)) as max_response_time_hours
        FROM police_alerts pa
        WHERE pa.police_id = ? 
          AND pa.responded_at IS NOT NULL
          AND ${dateFilter}
      `,
        [policeId]
      );

      // Get performance metrics (cases handled vs. others)
      const [performanceMetrics] = await connection.query(
        `
        SELECT 
          COUNT(*) as total_cases_handled,
          (
            SELECT COUNT(*)
            FROM police_alerts pa
            WHERE pa.status IN ('responded', 'closed')
              AND ${dateFilter}
          ) as total_cases_handled_all_police,
          (
            SELECT COUNT(DISTINCT police_id)
            FROM police_alerts
            WHERE police_id IS NOT NULL
              AND ${dateFilter}
          ) as active_police_count
        FROM police_alerts pa
        WHERE pa.police_id = ?
          AND pa.status IN ('responded', 'closed')
          AND ${dateFilter}
      `,
        [policeId]
      );

      // Get crime types handled by officer
      const [crimeTypesHandled] = await connection.query(
        `
        SELECT 
          cr.crime_type,
          COUNT(*) as count
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        WHERE pa.police_id = ? AND ${dateFilter}
        GROUP BY cr.crime_type
        ORDER BY count DESC
      `,
        [policeId]
      );

      // Get areas served by officer
      const [areasServed] = await connection.query(
        `
        SELECT 
          cr.location,
          COUNT(*) as count
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        WHERE pa.police_id = ? AND ${dateFilter}
        GROUP BY cr.location
        ORDER BY count DESC
        LIMIT 5
      `,
        [policeId]
      );

      // Get activity over time
      let trendQuery = "";
      let groupBy = "";

      switch (timeRange) {
        case "day":
          trendQuery = `DATE_FORMAT(pa.created_at, '%H:00') as time_period`;
          groupBy = "HOUR(pa.created_at)";
          break;
        case "week":
          trendQuery = `DATE_FORMAT(pa.created_at, '%W') as time_period`;
          groupBy = "DAYOFWEEK(pa.created_at)";
          break;
        case "month":
          trendQuery = `DATE_FORMAT(pa.created_at, '%Y-%m-%d') as time_period`;
          groupBy = "DATE(pa.created_at)";
          break;
        case "year":
          trendQuery = `DATE_FORMAT(pa.created_at, '%Y-%m') as time_period`;
          groupBy = "YEAR(pa.created_at), MONTH(pa.created_at)";
          break;
      }

      const [activityOverTime] = await connection.query(
        `
        SELECT ${trendQuery}, COUNT(*) as count
        FROM police_alerts pa
        WHERE pa.police_id = ? AND ${dateFilter}
        GROUP BY ${groupBy}
        ORDER BY pa.created_at
      `,
        [policeId]
      );

      return {
        caseStatusDistribution,
        responseTimeStats: responseTimeStats[0] || {
          avg_response_time_hours: 0,
          min_response_time_hours: 0,
          max_response_time_hours: 0,
        },
        performanceMetrics: performanceMetrics[0] || {
          total_cases_handled: 0,
          total_cases_handled_all_police: 0,
          active_police_count: 0,
        },
        crimeTypesHandled,
        areasServed,
        activityOverTime,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get crime statistics for a specific area
   * @param {string} area - Area/location to get statistics for
   * @param {string} timeRange - Time range for data (day, week, month, year)
   * @returns {Promise<Object>} Area-specific crime statistics
   */
  static async getCrimeStatsByArea(area, timeRange = "month") {
    const connection = await pool.getConnection();
    try {
      // Create date range filter based on timeRange
      const dateRanges = {
        day: "DATE(created_at) = CURDATE()",
        week: "created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)",
        month: "created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)",
        year: "created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)",
      };
      const dateFilter = dateRanges[timeRange] || dateRanges.month;

      // Get area crime counts by type
      const [crimeByType] = await connection.query(
        `
        SELECT crime_type, COUNT(*) as count
        FROM crime_reports
        WHERE location LIKE ? AND ${dateFilter}
        GROUP BY crime_type
        ORDER BY count DESC
      `,
        [`%${area}%`]
      );

      // Get area crime counts by time of day
      const [crimesByTime] = await connection.query(
        `
        SELECT 
          CASE 
            WHEN HOUR(time) BETWEEN 0 AND 5 THEN 'Night (12AM-6AM)'
            WHEN HOUR(time) BETWEEN 6 AND 11 THEN 'Morning (6AM-12PM)'
            WHEN HOUR(time) BETWEEN 12 AND 17 THEN 'Afternoon (12PM-6PM)'
            ELSE 'Evening (6PM-12AM)'
          END as time_of_day,
          COUNT(*) as count
        FROM crime_reports
        WHERE location LIKE ? AND ${dateFilter}
        GROUP BY time_of_day
        ORDER BY 
          CASE time_of_day
            WHEN 'Morning (6AM-12PM)' THEN 1
            WHEN 'Afternoon (12PM-6PM)' THEN 2
            WHEN 'Evening (6PM-12AM)' THEN 3
            WHEN 'Night (12AM-6AM)' THEN 4
          END
      `,
        [`%${area}%`]
      );

      // Get area validation statistics
      const [validationStats] = await connection.query(
        `
        SELECT 
          COUNT(*) as total_validations,
          SUM(CASE WHEN v.is_valid = true THEN 1 ELSE 0 END) as confirmed_validations,
          SUM(CASE WHEN v.is_valid = false THEN 1 ELSE 0 END) as rejected_validations
        FROM validations v
        JOIN crime_reports cr ON v.report_id = cr.id
        WHERE cr.location LIKE ? 
          AND ${dateFilter.replace("created_at", "v.created_at")}
      `,
        [`%${area}%`]
      );

      // Get area report status counts
      const [reportStatusCounts] = await connection.query(
        `
        SELECT 
          COUNT(*) as total_reports,
          COUNT(CASE WHEN EXISTS(
            SELECT 1 FROM police_alerts pa WHERE pa.report_id = cr.id
          ) THEN 1 END) as alerted_reports,
          COUNT(CASE WHEN EXISTS(
            SELECT 1 FROM police_alerts pa WHERE pa.report_id = cr.id AND pa.status = 'closed'
          ) THEN 1 END) as resolved_reports
        FROM crime_reports cr
        WHERE cr.location LIKE ? AND ${dateFilter}
      `,
        [`%${area}%`]
      );

      // Get area criminal weapon statistics
      const [armedStatistics] = await connection.query(
        `
        SELECT 
          armed,
          COUNT(*) as count
        FROM crime_reports
        WHERE location LIKE ? AND ${dateFilter}
        GROUP BY armed
      `,
        [`%${area}%`]
      );

      // Get area crime trend data
      let trendQuery = "";
      let groupBy = "";

      switch (timeRange) {
        case "day":
          trendQuery = `DATE_FORMAT(created_at, '%H:00') as time_period`;
          groupBy = "HOUR(created_at)";
          break;
        case "week":
          trendQuery = `DATE_FORMAT(created_at, '%W') as time_period`;
          groupBy = "DAYOFWEEK(created_at)";
          break;
        case "month":
          trendQuery = `DATE_FORMAT(created_at, '%Y-%m-%d') as time_period`;
          groupBy = "DATE(created_at)";
          break;
        case "year":
          trendQuery = `DATE_FORMAT(created_at, '%Y-%m') as time_period`;
          groupBy = "YEAR(created_at), MONTH(created_at)";
          break;
      }

      const [trendData] = await connection.query(
        `
        SELECT ${trendQuery}, COUNT(*) as count
        FROM crime_reports
        WHERE location LIKE ? AND ${dateFilter}
        GROUP BY ${groupBy}
        ORDER BY created_at
      `,
        [`%${area}%`]
      );

      return {
        area,
        crimeByType,
        crimesByTime,
        validationStats: validationStats[0] || {
          total_validations: 0,
          confirmed_validations: 0,
          rejected_validations: 0,
        },
        reportStatusCounts: reportStatusCounts[0] || {
          total_reports: 0,
          alerted_reports: 0,
          resolved_reports: 0,
        },
        armedStatistics,
        trendData,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get user-specific analytics
   * @param {number} userId - ID of the user
   * @param {string} timeRange - Time range for data
   * @returns {Promise<Object>} User analytics
   */
  static async getUserAnalytics(userId, timeRange = "month") {
    const connection = await pool.getConnection();
    try {
      // Create date range filter based on timeRange
      const dateRanges = {
        day: "DATE(created_at) = CURDATE()",
        week: "created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)",
        month: "created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)",
        year: "created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)",
      };
      const dateFilter = dateRanges[timeRange] || dateRanges.month;

      // Get user's reported crimes
      const [reportedCrimes] = await connection.query(
        `
        SELECT COUNT(*) as total_reports
        FROM crime_reports
        WHERE reporter_id = ? AND ${dateFilter}
      `,
        [userId]
      );

      // Get user's validations
      const [validations] = await connection.query(
        `
        SELECT 
          COUNT(*) as total_validations,
          SUM(CASE WHEN is_valid = true THEN 1 ELSE 0 END) as confirmed_validations,
          SUM(CASE WHEN is_valid = false THEN 1 ELSE 0 END) as rejected_validations
        FROM validations
        WHERE user_id = ? AND ${dateFilter.replace(
          "created_at",
          "validations.created_at"
        )}
      `,
        [userId]
      );

      // Get user's report impact (reports that led to police action)
      const [reportImpact] = await connection.query(
        `
        SELECT COUNT(DISTINCT pa.id) as reports_with_police_action
        FROM crime_reports cr
        JOIN police_alerts pa ON cr.id = pa.report_id
        WHERE cr.reporter_id = ? 
          AND pa.status IN ('responded', 'closed')
          AND ${dateFilter.replace("created_at", "cr.created_at")}
      `,
        [userId]
      );

      return {
        reportedCrimes: reportedCrimes[0]?.total_reports || 0,
        validations: validations[0] || {
          total_validations: 0,
          confirmed_validations: 0,
          rejected_validations: 0,
        },
        reportImpact: reportImpact[0]?.reports_with_police_action || 0,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get summary analytics for admin dashboard
   * @returns {Promise<Object>} Summary analytics
   */
  static async getDashboardSummary() {
    const connection = await pool.getConnection();
    try {
      // Get total counts
      const [totalCounts] = await connection.query(`
        SELECT 
          (SELECT COUNT(*) FROM crime_reports) as total_reports,
          (SELECT COUNT(*) FROM validations) as total_validations,
          (SELECT COUNT(*) FROM police_alerts) as total_alerts,
          (SELECT COUNT(*) FROM police_alerts WHERE status = 'closed') as resolved_cases,
          (SELECT COUNT(*) FROM users WHERE role = 'public') as total_users,
          (SELECT COUNT(*) FROM users WHERE role = 'police') as total_police
      `);

      // Get recent activity
      const [recentReports] = await connection.query(`
        SELECT cr.id, cr.location, cr.time, cr.crime_type, cr.created_at,
          u.username as reporter_username
        FROM crime_reports cr
        LEFT JOIN users u ON cr.reporter_id = u.id
        ORDER BY cr.created_at DESC
        LIMIT 5
      `);

      // Get recent police actions
      const [recentPoliceActions] = await connection.query(`
        SELECT pa.id, pa.status, pa.created_at, pa.updated_at,
          cr.location, cr.crime_type,
          p.username as police_username
        FROM police_alerts pa
        JOIN crime_reports cr ON pa.report_id = cr.id
        LEFT JOIN police p ON pa.police_id = p.id
        WHERE pa.status IN ('responded', 'closed')
        ORDER BY pa.updated_at DESC
        LIMIT 5
      `);

      // Get pending police registrations
      const [pendingRegistrations] = await connection.query(`
        SELECT id, full_name, email, created_at
        FROM requests
        WHERE status = 'pending'
        ORDER BY created_at DESC
        LIMIT 5
      `);

      return {
        counts: totalCounts[0],
        recentReports,
        recentPoliceActions,
        pendingRegistrations,
      };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = AnalyticsModel;
