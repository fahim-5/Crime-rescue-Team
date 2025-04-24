const mysql = require("mysql2/promise");
require("dotenv").config();

async function initializeDatabase() {
  // Create connection without database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "Fahim",
    password: process.env.DB_PASSWORD || "fahimfaysal"
  });

  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "Crime_Rescue_BD"}`);
    await connection.query(`USE ${process.env.DB_NAME || "Crime_Rescue_BD"}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        national_id VARCHAR(255) NOT NULL UNIQUE,
        passport VARCHAR(255),
        mobile_no VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('public', 'police', 'admin') NOT NULL DEFAULT 'public',
        address VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        police_id VARCHAR(50) UNIQUE,
        station VARCHAR(255),
        rank VARCHAR(100),
        badge_number VARCHAR(50) UNIQUE,
        joining_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_status (status),
        INDEX idx_role (role),
        INDEX idx_police_id (police_id),
        INDEX idx_badge_number (badge_number)
      )
    `);

    // Create public table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS public (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        national_id VARCHAR(255) NOT NULL UNIQUE,
        passport VARCHAR(255),
        mobile_no VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_national_id (national_id)
      )
    `);

    // Create police table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS police (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        national_id VARCHAR(255) NOT NULL UNIQUE,
        passport VARCHAR(255),
        mobile_no VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        police_id VARCHAR(50) UNIQUE,
        station VARCHAR(255),
        rank VARCHAR(100),
        badge_number VARCHAR(50) UNIQUE,
        joining_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_police_id (police_id),
        INDEX idx_badge_number (badge_number),
        INDEX idx_station (station),
        INDEX idx_rank (rank)
      )
    `);

    // Create crime_reports table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS crime_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location VARCHAR(255) NOT NULL,
        time DATETIME NOT NULL,
        crime_type VARCHAR(50) NOT NULL,
        num_criminals INT NOT NULL,
        victim_gender VARCHAR(20) NOT NULL,
        armed VARCHAR(10) NOT NULL,
        photos JSON,
        videos JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the initialization
initializeDatabase().catch(console.error);

module.exports = { initializeDatabase }; 