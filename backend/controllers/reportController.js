const ReportModel = require("../models/reportModel");
const path = require("path");
const fileUtils = require("../utils/fileUtils");

const createReport = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.location || !req.body.time || !req.body.crimeType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Process uploaded files and store only the paths relative to the uploads directory
    // This makes it easier to serve files through the static middleware
    const photos =
      req.files?.photos?.map((file) => {
        // Get path relative to uploads directory
        const relativePath = path.relative(
          path.join(__dirname, "../uploads"),
          file.path
        );
        return relativePath.replace(/\\/g, "/"); // Ensure forward slashes for URLs
      }) || [];

    const videos =
      req.files?.videos?.map((file) => {
        // Get path relative to uploads directory
        const relativePath = path.relative(
          path.join(__dirname, "../uploads"),
          file.path
        );
        return relativePath.replace(/\\/g, "/"); // Ensure forward slashes for URLs
      }) || [];

    // Validate numCriminals is a number
    const numCriminals = parseInt(req.body.numCriminals);
    if (isNaN(numCriminals) || numCriminals < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of criminals must be a valid number greater than 0",
      });
    }

    const reportId = await ReportModel.create(
      req.body.location,
      req.body.time,
      req.body.crimeType,
      numCriminals,
      req.body.victimGender,
      req.body.armed,
      photos,
      videos,
      req.user ? req.user.id : null // Pass user ID if authenticated
    );

    // If report created successfully and has valid information, alert nearby police
    if (
      reportId &&
      (req.body.armed === "yes" ||
        req.body.crimeType === "homicide" ||
        req.body.crimeType === "assault")
    ) {
      try {
        await ReportModel.alertPolice(reportId);
      } catch (alertError) {
        console.error("Error alerting police:", alertError);
        // We still want to return success even if alerting fails
      }
    }

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: { id: reportId },
    });
  } catch (error) {
    console.error("Report creation error:", error);

    // Delete any uploaded files if report creation fails
    if (req.files) {
      try {
        const allFiles = [
          ...(req.files.photos || []),
          ...(req.files.videos || []),
        ].map((file) => file.path);

        await fileUtils.deleteFiles(allFiles);
      } catch (deleteError) {
        console.error("Error deleting files after failed report:", deleteError);
      }
    }

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

/**
 * Delete a report and its associated media files
 */
const deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    // First get the report to find the media files
    const report = await ReportModel.getById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check authorization (only admin or the report creator can delete)
    if (
      req.user.role !== "admin" &&
      report.reporter_id &&
      req.user.id !== report.reporter_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this report",
      });
    }

    // Delete the report media files
    const mediaFiles = [
      ...report.photos.map((p) => p.path),
      ...report.videos.map((v) => v.path),
    ];

    // Delete the files
    await fileUtils.deleteFiles(mediaFiles);

    // Delete the report from the database
    const result = await ReportModel.delete(reportId);

    res.status(200).json({
      success: true,
      message: "Report and associated media files deleted successfully",
      deletedCount: result,
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message,
    });
  }
};

/**
 * Update a report including handling media files
 */
const updateReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Check if report exists
    const report = await ReportModel.getById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      report.reporter_id &&
      req.user.id !== report.reporter_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this report",
      });
    }

    // Handle file updates if any
    let updatedPhotos = report.photos.map((p) => p.path);
    let updatedVideos = report.videos.map((v) => v.path);

    // Process new photos if any
    if (req.files?.photos) {
      const newPhotos = req.files.photos.map((file) => {
        const relativePath = path.relative(
          path.join(__dirname, "../uploads"),
          file.path
        );
        return relativePath.replace(/\\/g, "/");
      });

      // Add new photos to the existing ones
      updatedPhotos = [...updatedPhotos, ...newPhotos];
    }

    // Process new videos if any
    if (req.files?.videos) {
      const newVideos = req.files.videos.map((file) => {
        const relativePath = path.relative(
          path.join(__dirname, "../uploads"),
          file.path
        );
        return relativePath.replace(/\\/g, "/");
      });

      // Add new videos to the existing ones
      updatedVideos = [...updatedVideos, ...newVideos];
    }

    // Prepare update data
    const updateData = {
      ...req.body,
    };

    // Only update media if there are changes
    if (req.files?.photos) {
      updateData.photos = updatedPhotos;
    }

    if (req.files?.videos) {
      updateData.videos = updatedVideos;
    }

    // Update the report
    const result = await ReportModel.update(reportId, updateData);

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: { id: reportId },
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update report",
      error: error.message,
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
  deleteReport,
  updateReport,
};
