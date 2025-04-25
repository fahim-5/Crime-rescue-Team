const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const requestRoutes = require("./routes/requestRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const policeRoutes = require("./routes/policeRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const crimeAlertRoutes = require("./routes/crimeAlertRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const upload = require("./middlewares/upload");

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // JSON body parser
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // CORS for frontend
app.use(morgan("dev")); // Logging requests

// Serve static files from the uploads directory
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/", authRoutes); // This will make auth routes available at root path
app.use("/api/auth", authRoutes); // Also keep them available at /api/auth for API consistency
app.use("/api/reports", reportRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/police/requests", requestRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/crime-alerts", crimeAlertRoutes);

// Error handling middleware should be last
app.use(errorMiddleware);

module.exports = app;