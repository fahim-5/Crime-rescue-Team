const express = require("express");
const router = express.Router();
const AnalyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");

// Global stats route - Admin only
router.get(
  "/global",
  authMiddleware.authenticateToken,
  authMiddleware.isAdmin,
  AnalyticsController.getGlobalStats
);

// Police analytics - Police only
router.get(
  "/police",
  authMiddleware.authenticateToken,
  authMiddleware.isPolice,
  AnalyticsController.getPoliceAnalytics
);

// Area-based crime statistics - Accessible to all authenticated users
router.get(
  "/area",
  authMiddleware.authenticateToken,
  AnalyticsController.getCrimeStatsByArea
);

// User-specific analytics - Accessible to the authenticated user
router.get(
  "/user",
  authMiddleware.authenticateToken,
  AnalyticsController.getUserAnalytics
);

// Admin dashboard summary - Admin only
router.get(
  "/dashboard",
  authMiddleware.authenticateToken,
  authMiddleware.isAdmin,
  AnalyticsController.getDashboardSummary
);

// New routes for analytics dashboard - make them temporarily accessible without authentication for testing
router.get("/overview", AnalyticsController.getOverviewData);
router.get("/crime-types", AnalyticsController.getCrimeTypesData);
router.get("/recent-validations", AnalyticsController.getRecentValidations);
router.get(
  "/location-distribution",
  AnalyticsController.getLocationDistribution
);
router.get("/validation-metrics", AnalyticsController.getValidationMetrics);

// New route for getting all analytics dashboard data at once
router.get("/dashboard-data", AnalyticsController.getAllDashboardData);

// Route to insert test data for analytics
router.get("/insert-test-data", async (req, res) => {
  try {
    const { pool } = require("../config/db");
    const connection = await pool.getConnection();

    try {
      // Create crime_reports table if it doesn't exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS crime_reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          crime_type VARCHAR(100) NOT NULL,
          location VARCHAR(255) NOT NULL,
          description TEXT,
          time TIME,
          reporter_id INT,
          validation_count INT DEFAULT 0,
          armed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if there's data already
      const [count] = await connection.query(
        "SELECT COUNT(*) as count FROM crime_reports"
      );
      console.log(`Current record count: ${count[0].count}`);

      // Insert sample data
      const crimeTypes = [
        "Theft",
        "Assault",
        "Burglary",
        "Fraud",
        "Vandalism",
        "Harassment",
      ];

      const locations = [
        "Dhaka-Mirpur",
        "Dhaka-Gulshan",
        "Dhaka-Dhanmondi",
        "Dhaka-Uttara",
        "Chittagong-Center",
        "Sylhet-Main",
      ];

      // Create 50 sample records
      const insertPromises = [];
      for (let i = 0; i < 50; i++) {
        const crimeType =
          crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
        const location =
          locations[Math.floor(Math.random() * locations.length)];
        const validationCount = Math.floor(Math.random() * 10); // Random validation count 0-9
        const armed = Math.random() > 0.7; // 30% chance of being armed

        // Random date within the past month
        const daysAgo = Math.floor(Math.random() * 30);
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        const timeStr = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:00`;

        insertPromises.push(
          connection.query(
            `INSERT INTO crime_reports 
             (crime_type, location, description, time, validation_count, armed, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              crimeType,
              location,
              `${crimeType} incident reported in ${location}`,
              timeStr,
              validationCount,
              armed,
              createdAt,
            ]
          )
        );
      }

      await Promise.all(insertPromises);

      // Verify data was inserted
      const [newCount] = await connection.query(
        "SELECT COUNT(*) as count FROM crime_reports"
      );

      res.status(200).json({
        success: true,
        message: `${
          newCount[0].count - count[0].count
        } new crime reports inserted. Total records: ${newCount[0].count}`,
      });
    } catch (error) {
      console.error("Error inserting test data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to insert test data",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection error",
      error: error.message,
    });
  }
});

module.exports = router;
