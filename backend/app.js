const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const { pool } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const requestRoutes = require("./routes/requestRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const policeRoutes = require("./routes/policeRoutes");
const policeStationRoutes = require("./routes/policeStationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const crimeAlertRoutes = require("./routes/crimeAlertRoutes");
const policeFilesRoutes = require("./routes/policeFilesRoutes"); // New route file
const adminRoutes = require("./routes/adminRoutes"); // Admin routes
const databaseRoutes = require("./routes/databaseRoutes"); // Database management routes
const errorMiddleware = require("./middlewares/errorMiddleware");
const upload = require("./middlewares/upload");

// Remove non-existent route imports
// const userRoutes = require("./routes/userRoutes");
// const crimeReportRoutes = require("./routes/crimeReportRoutes");
// const caseRoutes = require("./routes/caseRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // JSON body parser

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

// Additional CORS headers
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    req.headers.origin || "http://localhost:5173"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(morgan("dev")); // Logging requests

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Database fix endpoint
app.get("/api/fix-database", async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, "scripts", "fix-database.sql");
    
    if (!fs.existsSync(sqlPath)) {
      return res.status(404).json({ 
        success: false, 
        message: "Database fix script not found" 
      });
    }
    
    const sqlContent = fs.readFileSync(sqlPath, "utf8");
    const connection = await pool.getConnection();
    
    try {
      await connection.query(sqlContent);
      res.status(200).json({ 
        success: true, 
        message: "Database fixed successfully" 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fixing database:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fixing database", 
      error: error.message 
    });
  }
});

// Routes
app.use("/", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/police/requests", requestRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/police-stations", policeStationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/crime-alerts", crimeAlertRoutes);
app.use("/api/police-files", policeFilesRoutes); // New police files route
app.use("/api/admin", adminRoutes); // Admin routes
app.use("/api/admin/database", databaseRoutes); // Database management routes

// Remove non-existent route usages
// app.use("/api/users", userRoutes);
// app.use("/api/crime-reports", crimeReportRoutes);
// app.use("/api/cases", caseRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;