const AnalyticsModel = require("../models/analyticsModel");

/**
 * Controller for analytics functionality
 */
class AnalyticsController {
  /**
   * Get global crime statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getGlobalStats(req, res) {
    try {
      const { timeRange } = req.query;
      const stats = await AnalyticsModel.getGlobalStats(timeRange);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching global statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch global statistics",
        error: error.message,
      });
    }
  }

  /**
   * Get police-specific analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPoliceAnalytics(req, res) {
    try {
      const policeId = req.user.id;
      const { timeRange } = req.query;

      const analytics = await AnalyticsModel.getPoliceAnalytics(
        policeId,
        timeRange
      );

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Error fetching police analytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch police analytics",
        error: error.message,
      });
    }
  }

  /**
   * Get crime statistics for a specific area
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCrimeStatsByArea(req, res) {
    try {
      const { area, timeRange } = req.query;

      if (!area) {
        return res.status(400).json({
          success: false,
          message: "Area parameter is required",
        });
      }

      const stats = await AnalyticsModel.getCrimeStatsByArea(area, timeRange);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching area crime statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch area crime statistics",
        error: error.message,
      });
    }
  }

  /**
   * Get user-specific analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { timeRange } = req.query;

      const analytics = await AnalyticsModel.getUserAnalytics(
        userId,
        timeRange
      );

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user analytics",
        error: error.message,
      });
    }
  }

  /**
   * Get admin dashboard summary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getDashboardSummary(req, res) {
    try {
      const summary = await AnalyticsModel.getDashboardSummary();

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard summary",
        error: error.message,
      });
    }
  }
}

module.exports = AnalyticsController;
