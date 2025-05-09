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

  /**
   * Get count of reports by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getReportsCountByStatus: async (req, res) => {
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

      const count = await CrimeReportModel.getReportsCountByStatus(status);

      return res.status(200).json({
        success: true,
        status,
        count,
      });
    } catch (error) {
      console.error(
        "Error in getReportsCountByStatus controller:",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching crime reports count",
      });
    }
  },

  /**
   * Get active investigations count
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getActiveInvestigationsCount: async (req, res) => {
    try {
      const count = await CrimeReportModel.getActiveInvestigationsCount();

      return res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      console.error(
        "Error in getActiveInvestigationsCount controller:",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching active investigations count",
      });
    }
  },

  /**
   * Get solved cases count
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getSolvedCasesCount: async (req, res) => {
    try {
      const count = await CrimeReportModel.getSolvedCasesCount();

      return res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      console.error("Error in getSolvedCasesCount controller:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching solved cases count",
      });
    }
  },

  /**
   * Get clearance rate
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getClearanceRate: async (req, res) => {
    try {
      const data = await CrimeReportModel.getClearanceRate();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error in getClearanceRate controller:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error calculating clearance rate",
      });
    }
  },

  /**
   * Get crime reports statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getReportsStatistics: async (req, res) => {
    try {
      const statistics = await CrimeReportModel.getReportsStatistics();

      return res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error("Error in getReportsStatistics controller:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching report statistics",
      });
    }
  },

  /**
   * Get pending cases count
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getPendingCasesCount: async (req, res) => {
    try {
      const count = await CrimeReportModel.getPendingCasesCount();

      return res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      console.error("Error in getPendingCasesCount controller:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching pending cases count",
      });
    }
  },
};

module.exports = PoliceReportController;
