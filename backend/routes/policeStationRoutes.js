const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const { pool } = require("../config/db");

// Get all police stations
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM police_stations WHERE is_active = true ORDER BY district, thana, name"
    );

    return res.status(200).json({
      success: true,
      message: "Police stations retrieved successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching police stations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve police stations",
      error: error.message,
    });
  }
});

// Get police stations by district
router.get("/district/:district", async (req, res) => {
  try {
    const { district } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM police_stations WHERE district LIKE ? AND is_active = true ORDER BY thana, name",
      [`%${district}%`]
    );

    return res.status(200).json({
      success: true,
      message: `Police stations in ${district} retrieved successfully`,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching police stations by district:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve police stations",
      error: error.message,
    });
  }
});

// Get police stations by thana
router.get("/thana/:thana", async (req, res) => {
  try {
    const { thana } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM police_stations WHERE thana LIKE ? AND is_active = true ORDER BY name",
      [`%${thana}%`]
    );

    return res.status(200).json({
      success: true,
      message: `Police stations in ${thana} thana retrieved successfully`,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching police stations by thana:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve police stations",
      error: error.message,
    });
  }
});

// Search police stations by name, district, or thana
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM police_stations 
       WHERE (name LIKE ? OR district LIKE ? OR thana LIKE ?) 
       AND is_active = true 
       ORDER BY district, thana, name`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );

    return res.status(200).json({
      success: true,
      message: "Search results retrieved successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error searching police stations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search police stations",
      error: error.message,
    });
  }
});

// Get all districts (for dropdown)
router.get("/districts", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT district FROM police_stations WHERE is_active = true ORDER BY district"
    );

    return res.status(200).json({
      success: true,
      message: "Districts retrieved successfully",
      data: rows.map((row) => row.district),
    });
  } catch (error) {
    console.error("Error fetching districts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve districts",
      error: error.message,
    });
  }
});

// Get thanas by district (for dropdown)
router.get("/thanas/:district", async (req, res) => {
  try {
    const { district } = req.params;

    const [rows] = await pool.query(
      "SELECT DISTINCT thana FROM police_stations WHERE district = ? AND is_active = true ORDER BY thana",
      [district]
    );

    return res.status(200).json({
      success: true,
      message: `Thanas in ${district} retrieved successfully`,
      data: rows.map((row) => row.thana),
    });
  } catch (error) {
    console.error("Error fetching thanas by district:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve thanas",
      error: error.message,
    });
  }
});

module.exports = router;
