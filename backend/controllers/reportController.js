const ReportModel = require("../models/reportModel");
const path = require("path");
const fileUtils = require("../utils/fileUtils");
const NotificationService = require("../services/notificationService");
const CrimeAlertModel = require("../models/crimeAlertModel");
const { pool } = require("../config/db");

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

    // Create a crime alert for the community
    try {
      const alertType =
        req.body.crimeType.charAt(0).toUpperCase() +
        req.body.crimeType.slice(1);

      // Create details object based on crime report data
      const details = {
        peopleInvolved: numCriminals,
        victimDescription: `${req.body.victimGender} victim`,
        weapons:
          req.body.armed === "yes" ? "Armed suspect(s)" : "No weapons reported",
        dangerLevel: req.body.armed === "yes" ? "High" : "Medium",
        policeResponse: "Report under review",
      };

      // Create the crime alert
      await CrimeAlertModel.createAlert({
        report_id: reportId,
        type: alertType,
        location: req.body.location,
        description: `${alertType} reported in ${req.body.location} area`,
        status: "active",
        details: details,
      });

      console.log("Crime alert created successfully");
    } catch (alertError) {
      console.error("Error creating crime alert:", alertError);
      // Continue even if alert creation fails
    }

    // Send notification to the user who created the report
    if (reportId && req.user) {
      try {
        await NotificationService.sendReportNotification({
          userId: req.user.id,
          reportId: reportId,
          action: "created",
          details: `Your report about ${req.body.crimeType} has been submitted successfully.`,
        });
        console.log("Report notification sent successfully");
      } catch (notificationError) {
        console.error("Error sending report notification:", notificationError);
        // We still want to return success even if notification fails
      }
    }

    // Send notifications to all other users about the new report
    try {
      await NotificationService.notifyAllUsersAboutNewReport({
        reportId: reportId,
        location: req.body.location,
        crimeType: req.body.crimeType,
        reporterId: req.user ? req.user.id : null, // Exclude the reporter from notifications
      });
      console.log("Community notifications sent successfully");
    } catch (notificationError) {
      console.error(
        "Error sending community notifications:",
        notificationError
      );
      // We still want to return success even if notification fails
    }

    // Explicitly notify admins about high-risk reports that need urgent attention
    if (
      req.body.armed === "yes" ||
      req.body.crimeType === "homicide" ||
      req.body.crimeType === "assault" ||
      req.body.crimeType === "robbery"
    ) {
      try {
        await NotificationService.notifyAllAdmins({
          title: "URGENT: High-Risk Crime Report",
          message: `A ${req.body.armed === "yes" ? "ARMED " : ""}${
            req.body.crimeType
          } report (#${reportId}) in ${
            req.body.location
          } requires immediate attention.`,
          type: "alert",
          relatedId: reportId,
        });
        console.log("Urgent admin notifications sent successfully");
      } catch (notificationError) {
        console.error(
          "Error sending admin urgent notifications:",
          notificationError
        );
        // We still want to return success even if notification fails
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

/**
 * @desc   Health check endpoint
 * @route  GET /api/health
 * @access Public
 */
const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const connection = await require("../config/db").pool.getConnection();
    connection.release();

    res.status(200).json({
      status: "success",
      message: "API is healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "error",
      message: "API health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * @desc   Get all reports (admin access)
 * @route  GET /api/reports/admin
 * @access Private
 */
const getAllReports = async (req, res) => {
  try {
    // Check for user role in the query parameters
    const userRole = req.query.role;

    // Get all reports from the database
    const connection = await require("../config/db").pool.getConnection();
    try {
      // Base query to include reporter_address
      let query = `SELECT id, crime_id, location, time, crime_type, num_criminals, victim_gender, 
        armed, photos, videos, status, created_at, reporter_id, reporter_address, police_id
        FROM crime_reports`;

      // If no role is provided or role is not admin/police, apply restrictions
      if (!userRole || (userRole !== "admin" && userRole !== "police")) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin or police role required.",
        });
      }

      // Always order by created_at in descending order
      query += ` ORDER BY created_at DESC`;

      const [reports] = await connection.query(query);

      // Process photos and videos
      const processedReports = reports.map((report) => {
        const photos = report.photos ? JSON.parse(report.photos) : [];
        const videos = report.videos ? JSON.parse(report.videos) : [];

        return {
          ...report,
          photos: photos.map((photo) => ({ path: photo })),
          videos: videos.map((video) => ({ path: video })),
          description: `${report.crime_type} in ${report.location}`,
        };
      });

      res.status(200).json({
        success: true,
        count: reports.length,
        data: processedReports,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching all reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

/**
 * @desc   Get public crime reports for the community
 * @route  GET /api/reports/public
 * @access Public
 */
const getPublicReports = async (req, res) => {
  try {
    // Get reports from the database with restricted fields for public view
    const connection = await require("../config/db").pool.getConnection();
    try {
      // Query to get reports with limited sensitive data
      const query = `
        SELECT id, location, time, crime_type, status, created_at, reporter_address
        FROM crime_reports 
        WHERE status IN ('active', 'confirmed', 'pending')
        ORDER BY created_at DESC 
        LIMIT 100`;

      const [reports] = await connection.query(query);

      // Format response for the client
      const formattedReports = reports.map((report) => {
        // Basic formatting of reports for public consumption
        return {
          id: report.id,
          location: report.location,
          time: report.time,
          type: report.crime_type,
          status: report.status,
          created_at: report.created_at,
          reporter_address: report.reporter_address,
        };
      });

      return res.status(200).json({
        success: true,
        data: formattedReports,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching public reports:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public reports",
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
    const { isValid, comment, pointsAdjustment, isNewValidation } = req.body;
    const isPoliceValidation = req.user.role === "police";

    if (isValid === undefined) {
      return res.status(400).json({
        success: false,
        message: "Validation status (isValid) is required",
      });
    }

    // Check if this is a new validation or an update to an existing one
    let isFirstValidation = false;
    if (isNewValidation) {
      const existingValidation = await ReportModel.getUserValidation(
        reportId,
        userId
      );
      isFirstValidation = !existingValidation;
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

    // Get the report to check who created it
    const report = await ReportModel.getById(reportId);

    let pointsAwarded = 0;

    // If report has a reporter_id and this is a new validation, process points
    if (report && report.reporter_id && isNewValidation && isFirstValidation) {
      try {
        // Handle points based on validation type - both positive and negative
        try {
          // Directly update the points in the users table
          const connection = await require("../config/db").pool.getConnection();
          try {
            // If pointsAdjustment is specified in the request, use that value
            if (pointsAdjustment !== undefined) {
              pointsAwarded = pointsAdjustment;
            } else {
              // Otherwise use default values based on validation type
              if (isValid) {
                // Positive validation
                pointsAwarded = isPoliceValidation ? 200 : 50;
              } else {
                // Negative validation (mark as false)
                pointsAwarded = isPoliceValidation ? -200 : -50;
              }
            }

            // Log what we're doing
            if (pointsAwarded > 0) {
              console.log(
                `Awarding ${pointsAwarded} points to reporter ${
                  report.reporter_id
                } for validated report ${reportId}${
                  isPoliceValidation ? " (Police validation)" : ""
                }`
              );
            } else {
              console.log(
                `Deducting ${Math.abs(pointsAwarded)} points from reporter ${
                  report.reporter_id
                } for report marked as false ${reportId}${
                  isPoliceValidation ? " (Police validation)" : ""
                }`
              );
            }

            // Update the user's points (will handle both addition and subtraction since pointsAwarded can be negative)
            await connection.query(
              "UPDATE users SET points = points + ? WHERE id = ?",
              [pointsAwarded, report.reporter_id]
            );

            if (pointsAwarded > 0) {
              console.log(
                `Successfully awarded ${pointsAwarded} points to reporter ${report.reporter_id}`
              );
            } else {
              console.log(
                `Successfully deducted ${Math.abs(
                  pointsAwarded
                )} points from reporter ${report.reporter_id}`
              );
            }
          } finally {
            connection.release();
          }
        } catch (pointsError) {
          console.error("Error updating points:", pointsError);
          // Continue with validation even if points update fails
        }

        // If police officer validates as true, always create/update police alert
        if (isPoliceValidation && isValid) {
          try {
            console.log(
              `Police officer ID ${userId} validated report ${reportId} - creating police alert`
            );
            await ReportModel.alertPolice(reportId);
          } catch (alertError) {
            console.error("Error creating police alert:", alertError);
          }
        }
        // Check if we've reached the validation threshold from regular users
        else if (validations.valid >= ALERT_THRESHOLD) {
          // Send validated notification
          await NotificationService.sendReportNotification({
            userId: report.reporter_id,
            reportId: reportId,
            action: "validated",
            details: "Multiple community members have confirmed your report.",
          });

          // Notify all other users about the validated report
          await NotificationService.notifyAllUsersAboutNewReport({
            reportId: reportId,
            location: report.location,
            crimeType: report.crime_type,
            reporterId: report.reporter_id,
            message: `A crime report in ${report.location} has been confirmed by multiple community members. Stay vigilant!`,
          });
        } else {
          // Send notification to reporter based on validation type
          const notificationType = isValid ? "validated" : "marked_false";
          const details = isValid
            ? `Your crime report has been validated by ${
                isPoliceValidation ? "a police officer" : "a community member"
              }. You've earned ${pointsAwarded} points!`
            : `Your crime report has been marked as false by ${
                isPoliceValidation ? "a police officer" : "a community member"
              }. ${Math.abs(pointsAwarded)} points have been deducted.`;

          await NotificationService.sendReportNotification({
            userId: report.reporter_id,
            reportId: reportId,
            action: notificationType,
            details: details,
          });
        }
      } catch (notificationError) {
        console.error(
          "Error sending validation notification:",
          notificationError
        );
        // Continue with response even if notification fails
      }
    }

    // Include information about points in the response
    const responseData = {
      ...result,
      pointsAwarded,
    };

    if (isPoliceValidation && isValid) {
      // Police validation - special handling
      res.status(200).json({
        success: true,
        message: "Police validation recorded successfully. Alert created.",
        data: responseData,
        pointsAwarded,
      });
    } else if (validations.valid >= ALERT_THRESHOLD) {
      // Community threshold reached
      // Alert police
      await ReportModel.alertPolice(reportId);

      res.status(200).json({
        success: true,
        message: "Validation recorded successfully. Police has been alerted.",
        data: responseData,
        pointsAwarded,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Validation recorded successfully",
        data: responseData,
        validations,
        pointsAwarded,
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

/**
 * Get validation counts for a specific report
 * @param {*} req - Request object
 * @param {*} res - Response object
 */
const getReportValidations = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Get validation counts
    const validations = await ReportModel.getValidationsCount(reportId);

    res.status(200).json({
      success: true,
      data: {
        report_id: reportId,
        valid_count: validations.valid,
        invalid_count: validations.invalid,
        total_validations: validations.total,
      },
    });
  } catch (error) {
    console.error("Error fetching report validations:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch report validations",
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
    const alertId = req.params.alertId;
    const { status, response_details } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Get the user ID from authentication
    const policeId = req.user.id;

    // Update the alert with the response
    await ReportModel.updateAlert(alertId, {
      status,
      police_id: policeId,
      response_details,
    });

    // Get the report ID linked to this alert to notify the reporter
    const connection = await require("../config/db").pool.getConnection();
    try {
      const [alerts] = await connection.query(
        "SELECT report_id FROM police_alerts WHERE id = ?",
        [alertId]
      );

      if (alerts.length > 0) {
        const reportId = alerts[0].report_id;

        // Get the report details including the reporter ID
        const report = await ReportModel.getById(reportId);

        if (report && report.reporter_id) {
          try {
            // Send notification based on the status
            if (status === "investigating") {
              await NotificationService.sendReportNotification({
                userId: report.reporter_id,
                reportId: reportId,
                action: "investigating",
                details:
                  response_details ||
                  "Police are now investigating your report.",
              });

              // For serious crimes, notify the community about police response
              if (
                report.crime_type === "homicide" ||
                report.crime_type === "assault" ||
                report.crime_type === "robbery" ||
                report.armed === "yes"
              ) {
                await NotificationService.notifyAllUsersAboutNewReport({
                  reportId: reportId,
                  location: report.location,
                  crimeType: report.crime_type,
                  reporterId: report.reporter_id,
                  message: `Police are responding to a ${report.crime_type} incident in ${report.location}. Stay clear of the area.`,
                });
              }
            } else if (status === "resolved") {
              await NotificationService.sendReportNotification({
                userId: report.reporter_id,
                reportId: reportId,
                action: "resolved",
                details:
                  response_details || "Your case has been resolved by police.",
              });

              // Notify community about case resolution for serious crimes
              if (
                report.crime_type === "homicide" ||
                report.crime_type === "assault" ||
                report.crime_type === "robbery" ||
                report.armed === "yes"
              ) {
                await NotificationService.notifyAllUsersAboutNewReport({
                  reportId: reportId,
                  location: report.location,
                  crimeType: report.crime_type,
                  reporterId: report.reporter_id,
                  message: `Police have resolved a ${report.crime_type} case in ${report.location}. The area is now safe.`,
                });
              }
            } else if (status === "requires_info") {
              await NotificationService.sendReportNotification({
                userId: report.reporter_id,
                reportId: reportId,
                action: "requires_info",
                details:
                  response_details ||
                  "Police need more information about your report.",
              });
            }
          } catch (notificationError) {
            console.error(
              "Error sending police response notification:",
              notificationError
            );
            // Continue with response even if notification fails
          }
        }
      }
    } finally {
      connection.release();
    }

    res.status(200).json({
      success: true,
      message: "Alert response recorded successfully",
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

/**
 * Get reports submitted by the authenticated user
 */
const getUserReports = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to view your reports",
      });
    }

    const userId = req.user.id;
    const reports = await ReportModel.getByUserId(userId);

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user reports",
      error: error.message,
    });
  }
};

/**
 * Get all reports with reporter details for admin
 */
const getReportsWithReporterDetails = async (req, res) => {
  try {
    // Simple approach - just retrieve the basic data
    const connection = await require("../config/db").pool.getConnection();
    try {
      // Simple query to get all reports with basic info
      const [reports] = await connection.query(
        "SELECT * FROM crime_reports ORDER BY created_at DESC"
      );

      // Get reporter info for each report
      const reporterInfo = {};
      if (reports.length > 0) {
        const reporterIds = reports
          .filter((report) => report.reporter_id)
          .map((report) => report.reporter_id);

        if (reporterIds.length > 0) {
          const [users] = await connection.query(
            "SELECT id, full_name, email, address FROM users WHERE id IN (?)",
            [reporterIds]
          );

          // Create a lookup map
          users.forEach((user) => {
            reporterInfo[user.id] = {
              id: user.id,
              name: user.full_name,
              email: user.email,
              address: user.address,
            };
          });
        }
      }

      // Format the response
      const formattedReports = reports.map((report) => {
        return {
          id: report.id,
          crimeId: report.crime_id,
          location: report.location,
          time: report.time,
          crimeType: report.crime_type,
          numCriminals: report.num_criminals,
          victimGender: report.victim_gender,
          armed: report.armed,
          status: report.status,
          createdAt: report.created_at,
          reporter: report.reporter_id
            ? reporterInfo[report.reporter_id] || null
            : null,
        };
      });

      return res.status(200).json({
        success: true,
        data: formattedReports,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error in getReportsWithReporterDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve crime reports",
      error: error.message,
    });
  }
};

/**
 * Get dashboard stats (total count, pending count, active alerts count)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total reports count
    const connection = await require("../config/db").pool.getConnection();
    let totalCount = 0;
    let pendingCount = 0;
    let activeAlertsCount = 0;

    try {
      // Get total count
      const [totalRows] = await connection.query(
        "SELECT COUNT(*) as count FROM crime_reports"
      );
      totalCount = totalRows[0].count;

      // Get pending count
      pendingCount = await ReportModel.getPendingReportsCount();

      // Get active alerts (reports from last 12 hours)
      activeAlertsCount = await ReportModel.getActiveAlertsCount();
    } finally {
      connection.release();
    }

    return res.status(200).json({
      success: true,
      data: {
        totalReports: totalCount,
        pendingReports: pendingCount,
        activeAlerts: activeAlertsCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * Get recent reports (limited to 3)
 */
const getRecentReports = async (req, res) => {
  try {
    const limit = 3; // Hard-coded to 3 as per requirement
    const recentReports = await ReportModel.getRecentReports(limit);

    return res.status(200).json({
      success: true,
      data: recentReports,
    });
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent reports",
      error: error.message,
    });
  }
};

/**
 * Take case - Police officer takes ownership of a case
 * @route POST /api/reports/:id/take-case
 * @access Private (Police only)
 */
const takeCase = async (req, res) => {
  try {
    // Check if user is a police officer (should already be checked by middleware)
    if (req.user.role !== "police") {
      return res.status(403).json({
        success: false,
        message: "Only police officers can take cases",
      });
    }

    const reportId = req.params.id;

    // IMPROVED: First query the police table to get the actual police_id for this user
    let policeId = null;

    // Try to get the police_id from the police table first
    const [policeRows] = await pool.query(
      "SELECT police_id FROM police WHERE id = ?",
      [req.user.id]
    );

    if (policeRows.length > 0 && policeRows[0].police_id) {
      policeId = policeRows[0].police_id;
      console.log(
        `Found police_id ${policeId} in police table for user ${req.user.id}`
      );
    }
    // If not found in police table, use from request body if provided
    else if (req.body.police_id) {
      policeId = req.body.police_id;
      console.log(`Using police_id ${policeId} from request body`);
    }
    // Fallback to other options if needed
    else {
      policeId =
        req.user.police_id || req.user.badge_number || `POI-${req.user.id}`;
      console.log(`Using fallback police_id ${policeId}`);
    }

    console.log("Police officer taking case:", {
      userId: req.user.id,
      policeId: policeId,
      requestBody: req.body,
      name: req.user.name || req.user.username,
      reportId: reportId,
    });

    // First check if the report already has a police officer assigned
    const [checkReport] = await pool.query(
      "SELECT police_id FROM crime_reports WHERE id = ?",
      [reportId]
    );

    if (checkReport.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Log the police IDs for debugging
    console.log("Case assignment check:", {
      reportId: reportId,
      existingPoliceId: checkReport[0].police_id,
      requestingPoliceId: policeId,
      user: req.user,
    });

    // If police_id exists and doesn't match current user's police_id, it's taken by someone else
    // However, if police_id is the same as user's system ID (string format), allow it
    // This handles migration from old to new format
    if (
      checkReport[0].police_id &&
      checkReport[0].police_id !== policeId &&
      checkReport[0].police_id !== req.user.id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "This case is already taken by another officer",
      });
    }

    // If we get here, either no one has taken the case, or this officer has already taken it
    // Update the crime_reports table with the police officer's ID
    await pool.query(
      "UPDATE crime_reports SET police_id = ?, case_taken_at = NOW() WHERE id = ?",
      [policeId, reportId]
    );

    // Optionally, create an entry in a case_actions or case_history table
    // This would allow tracking of all actions taken on a case
    try {
      await pool.query(
        "INSERT INTO case_updates (report_id, user_id, action, timestamp) VALUES (?, ?, ?, NOW())",
        [reportId, req.user.id, "case_taken"]
      );
    } catch (error) {
      console.log(
        "Warning: Could not add to case_updates table:",
        error.message
      );
      // Don't fail the whole operation if this table doesn't exist
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Case successfully assigned to you",
      data: {
        reportId,
        policeId,
        takenAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error taking case:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while taking case",
      error: error.message,
    });
  }
};

/**
 * @desc   Get detailed report information including reporter details
 * @route  GET /api/reports/:id/details
 * @access Private (Police/Admin)
 */
const getReportWithReporterDetails = async (req, res) => {
  try {
    const reportId = req.params.id;
    const includeReporter = req.query.include_reporter === "true";

    // Connect to the database
    const connection = await require("../config/db").pool.getConnection();

    try {
      // First get the report data
      const [reportRows] = await connection.query(
        `SELECT cr.*, 
          ca.type as alert_type, 
          ca.status as alert_status, 
          ca.details as alert_details
        FROM crime_reports cr
        LEFT JOIN crime_alerts ca ON cr.id = ca.report_id
        WHERE cr.id = ?`,
        [reportId]
      );

      if (reportRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      const report = reportRows[0];

      // Process photos and videos
      const photos = report.photos ? JSON.parse(report.photos) : [];
      const videos = report.videos ? JSON.parse(report.videos) : [];

      // Format for response
      const formattedReport = {
        ...report,
        photos: photos.map((photo) => ({ path: photo })),
        videos: videos.map((video) => ({ path: video })),
        description: `${report.crime_type} in ${report.location}`,
        details: report.alert_details ? JSON.parse(report.alert_details) : null,
      };

      // If reporter info is requested and reporter_id exists, fetch reporter details
      if (includeReporter && report.reporter_id) {
        // Fetch reporter details from users table
        const [reporterRows] = await connection.query(
          `SELECT id, username, full_name, email, mobile_no, address
          FROM users
          WHERE id = ?`,
          [report.reporter_id]
        );

        if (reporterRows.length > 0) {
          formattedReport.reporter = {
            id: reporterRows[0].id,
            username: reporterRows[0].username,
            full_name: reporterRows[0].full_name,
            email: reporterRows[0].email,
            phone: reporterRows[0].mobile_no,
            address: reporterRows[0].address,
          };
        } else {
          formattedReport.reporter = {
            id: report.reporter_id,
            full_name: "Anonymous",
            note: "Reporter details not found",
          };
        }
      } else if (includeReporter) {
        // No reporter_id, set as anonymous
        formattedReport.reporter = {
          full_name: "Anonymous",
          note: "Anonymous report",
        };
      }

      return res.status(200).json({
        success: true,
        data: formattedReport,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching detailed report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report details",
      error: error.message,
    });
  }
};

/**
 * @desc   Update the status of a report
 * @route  PUT /api/reports/:id/status
 * @access Private (Police/Admin)
 */
const updateReportStatus = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status } = req.body;

    // Validate status value
    const allowedStatuses = ["pending", "investigating", "resolved", "closed"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: pending, investigating, resolved, closed",
      });
    }

    // Connect to the database
    const connection = await require("../config/db").pool.getConnection();

    try {
      // First check if report exists
      const [reportCheck] = await connection.query(
        "SELECT id, status FROM crime_reports WHERE id = ?",
        [reportId]
      );

      if (reportCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      // Update the status in crime_reports table
      await connection.query(
        "UPDATE crime_reports SET status = ? WHERE id = ?",
        [status, reportId]
      );

      // Also update status in crime_alerts table if exists
      await connection.query(
        "UPDATE crime_alerts SET status = ? WHERE report_id = ?",
        [status, reportId]
      );

      // Add entry to case_updates table to track the status change
      try {
        await connection.query(
          "INSERT INTO case_updates (report_id, user_id, action, details, timestamp) VALUES (?, ?, ?, ?, NOW())",
          [
            reportId,
            req.user.id,
            "status_change",
            JSON.stringify({
              previous: reportCheck[0].status || "pending",
              new: status,
              updated_by:
                req.user.username || req.user.email || `User #${req.user.id}`,
            }),
          ]
        );
      } catch (updateError) {
        // Don't fail the whole operation if adding the update fails
        console.log(
          "Warning: Could not add status change to case_updates table:",
          updateError.message
        );
      }

      return res.status(200).json({
        success: true,
        message: `Case status updated to ${status}`,
        data: {
          id: reportId,
          status: status,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating report status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update report status",
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
  getUserReports,
  getReportsWithReporterDetails,
  healthCheck,
  getDashboardStats,
  getRecentReports,
  getReportValidations,
  takeCase,
  getReportWithReporterDetails,
  updateReportStatus,
  getPublicReports,
};
