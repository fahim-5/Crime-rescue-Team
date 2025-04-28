const app = require("./app");
const { pool, testConnection } = require("./config/db");

const PORT = process.env.PORT || 5000;

// Start the server
async function startServer() {
  try {
    // Test database connection first
    await testConnection();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1); // Exit with failure code
  }
}

// Start the application
startServer();
