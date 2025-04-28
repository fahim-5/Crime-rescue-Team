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
const policeStationRoutes = require("./routes/policeStationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const crimeAlertRoutes = require("./routes/crimeAlertRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const upload = require("./middlewares/upload");

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

// Additional CORS headers for browsers that don't fully respect the cors package
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

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(morgan("dev")); // Logging requests

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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
app.use("/api/police-stations", policeStationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/crime-alerts", crimeAlertRoutes);

// Error handling middleware should be last
app.use(errorMiddleware);

module.exports = app;
