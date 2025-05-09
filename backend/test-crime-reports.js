const { pool } = require("./config/db");

async function testCrimeReports() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Connected to the database");

    // Check if the crime_reports table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'crime_reports'");

    if (tables.length === 0) {
      console.log("The crime_reports table does not exist!");

      // Create the table
      console.log("Creating crime_reports table...");
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
      console.log("crime_reports table created successfully!");
    } else {
      console.log("The crime_reports table exists!");

      // Check if there's data in the table
      const [count] = await connection.query(
        "SELECT COUNT(*) as count FROM crime_reports"
      );
      console.log(`The table has ${count[0].count} records`);

      if (count[0].count === 0) {
        console.log("Inserting sample data into crime_reports...");
        await insertSampleData(connection);
      } else {
        // Show sample data
        const [rows] = await connection.query(
          "SELECT * FROM crime_reports LIMIT 3"
        );
        console.log("Sample data from crime_reports table:");
        console.log(rows);
      }
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    if (connection) connection.release();
  }
}

async function insertSampleData(connection) {
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

  // Create at least 50 sample records
  for (let i = 0; i < 50; i++) {
    const crimeType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
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

    await connection.query(
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
    );
  }

  console.log("Sample data inserted successfully!");
}

// Run the test function
testCrimeReports();
