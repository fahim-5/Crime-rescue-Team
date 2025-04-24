const mysql = require("mysql2/promise");
require("dotenv").config();

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "Fahim",
  password: process.env.DB_PASSWORD || "fahimfaysal",
  database: process.env.DB_NAME || "Crime_Rescue_BD",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection when the app starts
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Successfully connected to MySQL database");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    throw err; // Re-throw the error to stop the application
  } finally {
    if (connection) connection.release();
  }
}

// Export both the pool and connection test function
module.exports = {
  pool,
  testConnection
};