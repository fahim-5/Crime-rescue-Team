const CrimeReportModel = require("../models/crimeReportModel");

/**
 * Police Report Controller
 * Handles all operations related to crime reports for police officers
 */
const PoliceReportController = {
  /**
   * Get all crime reports
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getAllReports: async (req, res) => {
    try {
      const reports = await CrimeReportModel.getAllReports();

      return res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });
    } catch (error) {
      console.error("Error in getAllReports controller:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching crime reports",
      });
    }
  },

  /**
   * Get a single crime report by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getReportById: async (req, res) => {
    try {
      const reportId = req.params.id;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          message: "Report ID is required",
        });
      }

      const report = await CrimeReportModel.getReportById(reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Crime report not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error("Error in getReportById controller:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching crime report",
      });
    }
  },

  /**
   * Get crime reports filtered by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getReportsByStatus: async (req, res) => {
    try {
      const { status } = req.params;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status parameter is required",
        });
      }

      // Validate that status is one of the allowed values
      const validStatuses = [
        "pending",
        "validating",
        "investigating",
        "resolved",
        "closed",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status value. Must be one of: pending, validating, investigating, resolved, closed",
        });
      }

      const reports = await CrimeReportModel.getReportsByStatus(status);

      return res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });
    } catch (error) {
      console.error("Error in getReportsByStatus controller:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching crime reports",
      });
    }
  },
};

module.exports = PoliceReportController;
