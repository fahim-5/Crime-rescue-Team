const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Fix database connection path
const auth = require("../middlewares/authMiddleware"); // Fix the path to match your project structure

/**
 * @route POST /api/reports/:id/take-case
 * @desc Let a police officer take ownership of a case
 * @access Private (Police only)
 */
router.post(
  "/:id/take-case",
  auth.authenticateToken,
  auth.isPolice,
  async (req, res) => {
    try {
      // Check if user is a police officer
      if (req.user.role !== "police") {
        return res.status(403).json({
          success: false,
          message: "Only police officers can take cases",
        });
      }

      const reportId = req.params.id;

      // Use the police_id from the request body if provided, otherwise fall back to user properties
      // This ensures we use the exact ID shown in the police profile popup (like "3695")
      const policeId =
        req.body.police_id ||
        req.user.police_id ||
        req.user.badge_number ||
        `POI-${req.user.id}`;

      console.log("Taking case with police ID:", policeId);
      console.log("Request body:", req.body);

      // First check if the report already has a police officer assigned
      const [checkReport] = await db.pool.query(
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
      await db.pool.query(
        "UPDATE crime_reports SET police_id = ?, case_taken_at = NOW() WHERE id = ?",
        [policeId, reportId]
      );

      // Optionally, you might want to create an entry in a case_actions or case_history table
      // This would allow tracking of all actions taken on a case
      try {
        await db.pool.query(
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
  }
);

// Export the router
module.exports = router;
