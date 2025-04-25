const { pool } = require("./config/db");

async function testQuery() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Connected to the database");

    // Check if the table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'police_stations'"
    );

    if (tables.length === 0) {
      console.log("The police_stations table does not exist!");

      // Create the table
      console.log("Attempting to create the police_stations table...");

      await connection.query(`
        CREATE TABLE IF NOT EXISTS police_stations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          district VARCHAR(100) NOT NULL,
          thana VARCHAR(100) NOT NULL,
          address TEXT,
          phone_number VARCHAR(50),
          email VARCHAR(100),
          type VARCHAR(50),
          coordinates POINT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("Table created successfully!");

      // Insert some test data
      console.log("Inserting sample data...");

      await connection.query(`
        INSERT INTO police_stations (name, district, thana, address, phone_number, email, type, is_active) VALUES
        ('Kotwali Police Station', 'Dhaka', 'Kotwali', 'Kotwali, Dhaka', '01713-373170', 'oc-kotwali@police.gov.bd', 'Police Station', true),
        ('Banani Police Station', 'Dhaka', 'Banani', 'Banani, Dhaka', '01713-373128', 'oc-banani@police.gov.bd', 'Police Station', true),
        ('Mirpur Police Station', 'Dhaka', 'Mirpur', 'Mirpur, Dhaka', '01713-373139', 'oc-mirpur@police.gov.bd', 'Police Station', true);
      `);

      console.log("Sample data inserted!");
    } else {
      console.log("The police_stations table exists!");

      // Check if there's data in the table
      const [count] = await connection.query(
        "SELECT COUNT(*) as count FROM police_stations"
      );
      console.log(`The table has ${count[0].count} records`);

      if (count[0].count === 0) {
        console.log(
          "The table exists but has no data. Inserting sample data..."
        );

        await connection.query(`
          INSERT INTO police_stations (name, district, thana, address, phone_number, email, type, is_active) VALUES
          ('Kotwali Police Station', 'Dhaka', 'Kotwali', 'Kotwali, Dhaka', '01713-373170', 'oc-kotwali@police.gov.bd', 'Police Station', true),
          ('Banani Police Station', 'Dhaka', 'Banani', 'Banani, Dhaka', '01713-373128', 'oc-banani@police.gov.bd', 'Police Station', true),
          ('Mirpur Police Station', 'Dhaka', 'Mirpur', 'Mirpur, Dhaka', '01713-373139', 'oc-mirpur@police.gov.bd', 'Police Station', true);
        `);

        console.log("Sample data inserted!");
      } else {
        // Fetch some sample data
        const [rows] = await connection.query(
          "SELECT * FROM police_stations LIMIT 3"
        );
        console.log("Sample data from the table:");
        console.log(rows);
      }
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

testQuery();
