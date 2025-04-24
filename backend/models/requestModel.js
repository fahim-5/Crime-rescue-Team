const { pool } = require("../config/db");

const RequestModel = {
  getAllPoliceRequests: async () => {
    const query = `
      SELECT 
        id,
        full_name,
        email,
        mobile_no as mobile,
        police_id,
        badge_number,
        rank,
        station,
        joining_date,
        status,
        created_at
      FROM users
      WHERE role = 'police' AND status = 'pending'
      ORDER BY created_at DESC
    `;
    
    try {
      const [requests] = await pool.execute(query);
      return requests;
    } catch (err) {
      console.error("Database Error:", err.sqlMessage || err);
      throw err;
    }
  },

  getPoliceRequestByPoliceId: async (policeId) => {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT 
          id,
          full_name,
          email,
          mobile_no as mobile,
          police_id,
          badge_number,
          rank,
          station,
          joining_date,
          status,
          national_id,
          address
        FROM users 
        WHERE police_id = ? AND role = 'police'
        LIMIT 1
      `;

      const [requests] = await connection.execute(query, [policeId]);
      return requests[0] || null;
    } catch (err) {
      console.error("Database Error:", err.sqlMessage || err);
      throw err;
    } finally {
      if (connection) await connection.release();
    }
  },

  approvePoliceRequest: async (policeId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update status in users table
      await connection.execute(
        `UPDATE users SET status = 'approved' WHERE police_id = ? AND role = 'police'`,
        [policeId]
      );

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      console.error("Database Error:", err.sqlMessage || err);
      throw err;
    } finally {
      if (connection) await connection.release();
    }
  },

  rejectPoliceRequest: async (policeId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete from users table
      await connection.execute(
        `DELETE FROM users WHERE police_id = ? AND role = 'police'`,
        [policeId]
      );

      // Delete from police table if exists
      await connection.execute(
        `DELETE FROM police WHERE police_id = ?`,
        [policeId]
      );

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      console.error("Database Error:", err.sqlMessage || err);
      throw err;
    } finally {
      if (connection) await connection.release();
    }
  }
};

module.exports = RequestModel;