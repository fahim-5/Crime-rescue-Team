const ReportModel = require("../models/reportModel");

const createReport = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.location || !req.body.time || !req.body.crimeType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const photos = req.files?.photos?.map((file) => file.path) || [];
    const videos = req.files?.videos?.map((file) => file.path) || [];

    const reportId = await ReportModel.create(
      req.body.location,
      req.body.time,
      req.body.crimeType,
      req.body.numCriminals,
      req.body.victimGender,
      req.body.armed,
      photos,
      videos,
      req.user ? req.user.id : null // Pass user ID if authenticated
    );

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: { id: reportId },
    });
  } catch (error) {
    console.error("Report creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error.message,
    });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await ReportModel.getAll();
    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await ReportModel.getById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

const validateCrimeReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;
    const { isValid, comment } = req.body;

    if (isValid === undefined) {
      return res.status(400).json({
        success: false,
        message: "Validation status (isValid) is required",
      });
    }

    // Add validation
    const result = await ReportModel.addValidation(
      reportId,
      userId,
      isValid,
      comment
    );

    // Check validation threshold and alert police if needed
    const validations = await ReportModel.getValidationsCount(reportId);
    const ALERT_THRESHOLD = 3; // Configure as needed

    if (validations.valid >= ALERT_THRESHOLD) {
      // Alert police
      await ReportModel.alertPolice(reportId);

      res.status(200).json({
        success: true,
        message: "Validation recorded successfully. Police has been alerted.",
        data: result,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Validation recorded successfully",
        data: result,
        validations,
      });
    }
  } catch (error) {
    console.error("Error validating report:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to validate report",
    });
  }
};

const getNearbyReports = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const maxRadius = radius || 10; // Default 10 km radius
    const reports = await ReportModel.getNearbyReports(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(maxRadius)
    );

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching nearby reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby reports",
      error: error.message,
    });
  }
};

const getPendingPoliceAlerts = async (req, res) => {
  try {
    // Only allow police to see alerts
    if (req.user.role !== "police") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Police only.",
      });
    }

    const alerts = await ReportModel.getPendingAlerts();

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching police alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch police alerts",
      error: error.message,
    });
  }
};

const respondToAlert = async (req, res) => {
  try {
    // Only allow police to respond to alerts
    if (req.user.role !== "police") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Police only.",
      });
    }

    const { alertId } = req.params;
    const { status, response_details } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Response status is required",
      });
    }

    const result = await ReportModel.updateAlert(alertId, {
      police_id: req.user.id,
      status,
      response_details,
    });

    res.status(200).json({
      success: true,
      message: "Alert response recorded",
      data: result,
    });
  } catch (error) {
    console.error("Error responding to alert:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to respond to alert",
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  validateCrimeReport,
  getNearbyReports,
  getPendingPoliceAlerts,
  respondToAlert,
};
