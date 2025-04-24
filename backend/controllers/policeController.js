const PoliceModel = require("../models/policeModel");
const ReportModel = require("../models/reportModel");
const AnalyticsModel = require("../models/analyticsModel");

// Get dashboard statistics for police officer
const getDashboardStats = async (req, res) => {
  try {
    const policeId = req.user.id;

    // Get dashboard statistics
    const stats = await PoliceModel.getDashboardStats(policeId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching police dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// Get cases assigned to the police officer
const getAssignedCases = async (req, res) => {
  try {
    const policeId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const cases = await PoliceModel.getAssignedCases(policeId, status, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: cases,
    });
  } catch (error) {
    console.error("Error fetching assigned cases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned cases",
      error: error.message,
    });
  }
};

// Get pending cases that need police attention
const getPendingCases = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const policeId = req.user.id;

    // Get station of current police officer for location filtering
    const police = await PoliceModel.getPoliceDetails(policeId);

    // Get pending cases in the police officer's station/area
    const pendingCases = await PoliceModel.getPendingCases(police.station, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: pendingCases,
    });
  } catch (error) {
    console.error("Error fetching pending cases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending cases",
      error: error.message,
    });
  }
};

// Get resolved cases by the police officer
const getResolvedCases = async (req, res) => {
  try {
    const policeId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const resolvedCases = await PoliceModel.getResolvedCases(policeId, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: resolvedCases,
    });
  } catch (error) {
    console.error("Error fetching resolved cases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resolved cases",
      error: error.message,
    });
  }
};

// Update case status by police
const updateCaseStatus = async (req, res) => {
  try {
    const { alertId } = req.params;
    const policeId = req.user.id;
    const { status, response_details } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Check if valid status
    const validStatuses = ["pending", "confirmed", "responded", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Update the case status
    const result = await ReportModel.updateAlert(alertId, {
      police_id: policeId,
      status,
      response_details,
    });

    // Record the case history
    await PoliceModel.addCaseHistory(
      alertId,
      policeId,
      status,
      response_details
    );

    res.status(200).json({
      success: true,
      message: "Case status updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating case status:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update case status",
    });
  }
};

// Add notes or updates to a case
const addCaseNotes = async (req, res) => {
  try {
    const { alertId } = req.params;
    const policeId = req.user.id;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: "Notes are required",
      });
    }

    // Add notes to the case
    const result = await PoliceModel.addCaseNotes(alertId, policeId, notes);

    res.status(200).json({
      success: true,
      message: "Case notes added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding case notes:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to add case notes",
    });
  }
};

// Get detailed information about a specific case
const getCaseDetails = async (req, res) => {
  try {
    const { alertId } = req.params;

    // Get detailed case information
    const caseDetails = await PoliceModel.getCaseDetails(alertId);

    if (!caseDetails) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Get case history
    const caseHistory = await PoliceModel.getCaseHistory(alertId);

    // Get case notes
    const caseNotes = await PoliceModel.getCaseNotes(alertId);

    res.status(200).json({
      success: true,
      data: {
        ...caseDetails,
        history: caseHistory,
        notes: caseNotes,
      },
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch case details",
    });
  }
};

// Search for cases based on criteria
const searchCases = async (req, res) => {
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
    } = req.query;

    const policeId = req.user.id;

    // Search for cases based on criteria
    const searchResults = await PoliceModel.searchCases(policeId, {
      query,
      status,
      location,
      crimeType,
      startDate,
      endDate,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error("Error searching cases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search cases",
      error: error.message,
    });
  }
};

// Get police analytics
const getPoliceAnalytics = async (req, res) => {
  try {
    const policeId = req.user.id;
    const { timeRange = "month" } = req.query; // day, week, month, year

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
};

// Get crime statistics by area
const getCrimeStatsByArea = async (req, res) => {
  try {
    const { area, timeRange = "month" } = req.query;

    // If specific area is not provided, get the police officer's station
    let targetArea = area;
    if (!targetArea) {
      const policeId = req.user.id;
      const police = await PoliceModel.getPoliceDetails(policeId);
      targetArea = police.station;
    }

    const crimeStats = await AnalyticsModel.getCrimeStatsByArea(
      targetArea,
      timeRange
    );

    res.status(200).json({
      success: true,
      data: crimeStats,
    });
  } catch (error) {
    console.error("Error fetching crime statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch crime statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getAssignedCases,
  getPendingCases,
  getResolvedCases,
  updateCaseStatus,
  addCaseNotes,
  getCaseDetails,
  searchCases,
  getPoliceAnalytics,
  getCrimeStatsByArea,
};
