const { Sequelize } = require('sequelize');
require('dotenv').config(); // Make sure this is at the top

const sequelize = new Sequelize(
  process.env.DB_NAME || 'Crime_Rescue_BD',
  process.env.DB_USER || 'Fahim', // Changed from 'root' to match your pool config
  process.env.DB_PASSWORD || 'fahimfaysal',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false // Disable automatic timestamp fields if not needed
    }
  }
);

// Test the connection when the app starts
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Successfully connected to MySQL database with Sequelize');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Exit the application if connection fails
  }
})();

module.exports = sequelize;