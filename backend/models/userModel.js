const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class UserModel {
  static async create(userData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        full_name,
        username,
        email,
        national_id,
        mobile_no,
        password,
        address,
        role = "public",
        status = "approved",
        passport = null,
      } = userData;

      // Validate required fields
      const requiredFields = {
        full_name,
        username,
        email,
        national_id,
        mobile_no,
        password,
        address,
      };
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw {
          status: 400,
          message: "Missing required fields",
          fields: missingFields,
        };
      }

      // Check for existing user in users table
      const [existingUsers] = await connection.query(
        `SELECT email, username, national_id FROM users 
             WHERE email = ? OR username = ? OR national_id = ?`,
        [email.trim(), username.trim(), national_id.trim()]
      );

      // Check for existing user in public table
      const [existingPublic] = await connection.query(
        `SELECT email, username, national_id FROM public 
             WHERE email = ? OR username = ? OR national_id = ?`,
        [email.trim(), username.trim(), national_id.trim()]
      );

      const existingRecords = [...existingUsers, ...existingPublic];

      if (existingRecords.length > 0) {
        const errors = [];
        if (existingRecords.some((u) => u.email === email.trim())) {
          errors.push({ field: "email", message: "Email already in use" });
        }
        if (existingRecords.some((u) => u.username === username.trim())) {
          errors.push({ field: "username", message: "Username already taken" });
        }
        if (existingRecords.some((u) => u.national_id === national_id.trim())) {
          errors.push({
            field: "national_id",
            message: "National ID already registered",
          });
        }
        throw { status: 400, errors };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into users table
      const [userResult] = await connection.query(
        `INSERT INTO users 
            (full_name, username, email, national_id, passport, mobile_no, password, role, address, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          full_name.trim(),
          username.trim().toLowerCase(),
          email.trim().toLowerCase(),
          national_id.trim(),
          passport ? passport.trim() : null,
          mobile_no.trim(),
          hashedPassword,
          role.trim().toLowerCase(),
          address.trim(),
          status.trim().toLowerCase(),
        ]
      );

      // Insert into public table (only if role is public)
      if (role === "public") {
        await connection.query(
          `INSERT INTO public 
                (full_name, username, email, national_id, passport, mobile_no, password, address) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            full_name.trim(),
            username.trim().toLowerCase(),
            email.trim().toLowerCase(),
            national_id.trim(),
            passport ? passport.trim() : null,
            mobile_no.trim(),
            hashedPassword,
            address.trim(),
          ]
        );
      }

      await connection.commit();

      return {
        id: userResult.insertId,
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        role: role.trim().toLowerCase(),
        status: status.trim().toLowerCase(),
      };
    } catch (error) {
      await connection.rollback();
      console.error("Database Error:", error);

      if (error.code === "ER_DUP_ENTRY") {
        throw {
          status: 409,
          message: "Duplicate entry",
          details: error.sqlMessage,
        };
      }
      throw error;
    } finally {
      if (connection) await connection.release();
    }
  }

  static async findByEmail(email) {
    const connection = await pool.getConnection();
    try {
      // Log for debugging
      console.log(`Looking up user by email: ${email.toLowerCase().trim()}`);

      // Use LOWER function in SQL for case-insensitive comparison
      const [users] = await connection.query(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        [email.trim()]
      );

      if (users[0]) {
        console.log(`User found: id=${users[0].id}, role=${users[0].role}`);
      } else {
        console.log("No user found with this email");
      }

      return users[0] || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    } finally {
      await connection.release();
    }
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    try {
      if (!hashedPassword) {
        console.error("No hashed password provided for comparison");
        return false;
      }

      if (!candidatePassword) {
        console.error("No candidate password provided for comparison");
        return false;
      }

      const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
      console.log(
        `Password comparison result: ${isMatch ? "match" : "no match"}`
      );
      return isMatch;
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return false;
    }
  }

  static async createAdmin(userData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        full_name,
        username,
        email,
        national_id,
        mobile_no,
        password,
        address,
        role = "admin",
        status = "approved",
        passport = null,
      } = userData;

      // Validate required fields
      const requiredFields = {
        full_name,
        username,
        email,
        national_id,
        mobile_no,
        password,
        address,
      };
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw {
          status: 400,
          message: "Missing required fields",
          fields: missingFields,
        };
      }

      // Check for existing user in users table
      const [existingUsers] = await connection.query(
        `SELECT email, username, national_id FROM users 
             WHERE email = ? OR username = ? OR national_id = ?`,
        [email.trim(), username.trim(), national_id.trim()]
      );

      // Check for existing user in admin table
      const [existingAdmin] = await connection.query(
        `SELECT email, username, national_id FROM admin 
             WHERE email = ? OR username = ? OR national_id = ?`,
        [email.trim(), username.trim(), national_id.trim()]
      );

      const existingRecords = [...existingUsers, ...existingAdmin];

      if (existingRecords.length > 0) {
        const errors = [];
        if (existingRecords.some((u) => u.email === email.trim())) {
          errors.push({ field: "email", message: "Email already in use" });
        }
        if (existingRecords.some((u) => u.username === username.trim())) {
          errors.push({ field: "username", message: "Username already taken" });
        }
        if (existingRecords.some((u) => u.national_id === national_id.trim())) {
          errors.push({
            field: "national_id",
            message: "National ID already registered",
          });
        }
        throw { status: 400, errors };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into users table
      const [userResult] = await connection.query(
        `INSERT INTO users 
            (full_name, username, email, national_id, passport, mobile_no, password, role, address, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          full_name.trim(),
          username.trim().toLowerCase(),
          email.trim().toLowerCase(),
          national_id.trim(),
          passport ? passport.trim() : null,
          mobile_no.trim(),
          hashedPassword,
          role.trim().toLowerCase(),
          address.trim(),
          status.trim().toLowerCase(),
        ]
      );

      // Insert into admin table (only if role is admin)
      if (role === "admin") {
        await connection.query(
          `INSERT INTO admin 
                (full_name, username, email, national_id, passport, mobile_no, password, address) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            full_name.trim(),
            username.trim().toLowerCase(),
            email.trim().toLowerCase(),
            national_id.trim(),
            passport ? passport.trim() : null,
            mobile_no.trim(),
            hashedPassword,
            address.trim(),
          ]
        );
      }

      await connection.commit();

      return {
        id: userResult.insertId,
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        role: role.trim().toLowerCase(),
        status: status.trim().toLowerCase(),
      };
    } catch (error) {
      await connection.rollback();
      console.error("Database Error:", error);

      if (error.code === "ER_DUP_ENTRY") {
        throw {
          status: 409,
          message: "Duplicate entry",
          details: error.sqlMessage,
        };
      }
      throw error;
    } finally {
      if (connection) await connection.release();
    }
  }

  static async createPolice(policeData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Set default police values
      const policeDefaults = {
        role: "police",
        status: "pending", // Police accounts typically require approval
      };

      // Merge provided data with police defaults
      const userData = {
        ...policeData,
        ...policeDefaults,
      };

      // Destructure with validation
      const {
        full_name,
        username,
        email,
        national_id,
        mobile_no,
        password,
        address,
        police_id,
        station,
        rank,
        badge_number,
        joining_date,
        passport = null,
      } = userData;

      // Validate required fields for police
      const requiredFields = {
        full_name,
        username,
        email,
        national_id,
        mobile_no,
        password,
        address,
        police_id,
        station,
        rank,
        badge_number,
        joining_date,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw {
          status: 400,
          message: "Missing required fields for police registration",
          fields: missingFields,
        };
      }

      // Check for existing police with same credentials
      const [existingPolice] = await connection.query(
        `SELECT * FROM users 
          WHERE (email = ? OR username = ? OR national_id = ? OR police_id = ? OR badge_number = ?)
          AND role = 'police'`,
        [
          email.trim(),
          username.trim(),
          national_id.trim(),
          police_id.trim(),
          badge_number.trim(),
        ]
      );

      if (existingPolice.length > 0) {
        const errors = [];
        if (existingPolice.some((u) => u.email === email.trim())) {
          errors.push({
            field: "email",
            message: "Email already used by another officer",
          });
        }
        if (existingPolice.some((u) => u.username === username.trim())) {
          errors.push({
            field: "username",
            message: "Username already taken by another officer",
          });
        }
        if (existingPolice.some((u) => u.national_id === national_id.trim())) {
          errors.push({
            field: "national_id",
            message: "National ID already registered by another officer",
          });
        }
        if (existingPolice.some((u) => u.police_id === police_id.trim())) {
          errors.push({
            field: "police_id",
            message: "Police ID already in use",
          });
        }
        if (
          existingPolice.some((u) => u.badge_number === badge_number.trim())
        ) {
          errors.push({
            field: "badge_number",
            message: "Badge number already assigned",
          });
        }
        throw { status: 400, errors };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into users table (with status)
      const [userResult] = await connection.query(
        `INSERT INTO users 
          (full_name, username, email, national_id, passport, mobile_no, 
           password, role, address, status, police_id, station, rank, badge_number, joining_date) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          full_name.trim(),
          username.trim().toLowerCase(),
          email.trim().toLowerCase(),
          national_id.trim(),
          passport ? passport.trim() : null,
          mobile_no.trim(),
          hashedPassword,
          "police",
          address.trim(),
          "pending",
          police_id.trim(),
          station.trim(),
          rank.trim(),
          badge_number.trim(),
          new Date(joining_date),
        ]
      );

      // Check if police table has user_id column
      let hasUserIdColumn = false;
      try {
        const [columns] = await connection.query("SHOW COLUMNS FROM police WHERE Field = 'user_id'");
        hasUserIdColumn = columns.length > 0;
      } catch (error) {
        console.error("Error checking for user_id column:", error);
      }

      // Insert into police table with or without user_id
      if (hasUserIdColumn) {
        await connection.query(
          `INSERT INTO police 
            (user_id, full_name, username, email, national_id, passport, mobile_no, 
             password, address, police_id, station, rank, badge_number, joining_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userResult.insertId,
            full_name.trim(),
            username.trim().toLowerCase(),
            email.trim().toLowerCase(),
            national_id.trim(),
            passport ? passport.trim() : null,
            mobile_no.trim(),
            hashedPassword,
            address.trim(),
            police_id.trim(),
            station.trim(),
            rank.trim(),
            badge_number.trim(),
            new Date(joining_date),
          ]
        );
      } else {
        await connection.query(
          `INSERT INTO police 
            (full_name, username, email, national_id, passport, mobile_no, 
             password, address, police_id, station, rank, badge_number, joining_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            full_name.trim(),
            username.trim().toLowerCase(),
            email.trim().toLowerCase(),
            national_id.trim(),
            passport ? passport.trim() : null,
            mobile_no.trim(),
            hashedPassword,
            address.trim(),
            police_id.trim(),
            station.trim(),
            rank.trim(),
            badge_number.trim(),
            new Date(joining_date),
          ]
        );
      }

      await connection.commit();

      return {
        id: userResult.insertId,
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        role: "police",
        status: "pending",
        police_id: police_id.trim(),
        badge_number: badge_number.trim(),
      };
    } catch (error) {
      await connection.rollback();
      console.error("Police Registration Error:", error);

      if (error.code === "ER_DUP_ENTRY") {
        throw {
          status: 409,
          message: "Police officer with these details already exists",
          details: error.sqlMessage,
        };
      }
      throw error;
    } finally {
      if (connection) await connection.release();
    }
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get user's current password
      const [users] = await connection.query(
        "SELECT password, username, role FROM users WHERE id = ?",
        [userId]
      );

      if (users.length === 0) {
        throw { status: 404, message: "User not found" };
      }

      const user = users[0];

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw { status: 401, message: "Current password is incorrect" };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in users table
      await connection.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

      // Also update password in role-specific table based on user role
      if (user.role === "public") {
        await connection.query(
          "UPDATE public SET password = ? WHERE username = ?",
          [hashedPassword, user.username]
        );
      } else if (user.role === "police") {
        await connection.query(
          "UPDATE police SET password = ? WHERE username = ?",
          [hashedPassword, user.username]
        );
      } else if (user.role === "admin") {
        await connection.query(
          "UPDATE admin SET password = ? WHERE username = ?",
          [hashedPassword, user.username]
        );
      }

      await connection.commit();
      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.release();
    }
  }

  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      
      if (!users[0]) {
        return null;
      }
      
      const user = users[0];
      
      // If this is a police user, get additional police information
      if (user.role === "police") {
        // First check if the police table has the user_id column
        let hasUserIdColumn = false;
        try {
          const [columns] = await connection.query("SHOW COLUMNS FROM police WHERE Field = 'user_id'");
          hasUserIdColumn = columns.length > 0;
        } catch (error) {
          console.error("Error checking for user_id column:", error);
        }
        
        let query;
        if (hasUserIdColumn) {
          query = "SELECT police_id, station, rank FROM police WHERE user_id = ? OR email = ?";
        } else {
          query = "SELECT police_id, station, rank FROM police WHERE email = ?";
        }
        
        const [policeInfo] = hasUserIdColumn 
          ? await connection.query(query, [id, user.email])
          : await connection.query(query, [user.email]);
        
        if (policeInfo[0]) {
          user.police_id = policeInfo[0].police_id;
          user.station = policeInfo[0].station;
          user.rank = policeInfo[0].rank;
        }
      }
      
      return user;
    } finally {
      await connection.release();
    }
  }

  static async updateProfile(userId, userData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { full_name, email, mobile_no, address, national_id } = userData;

      // Check if user exists
      const [existingUsers] = await connection.query(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );

      if (existingUsers.length === 0) {
        throw { status: 404, message: "User not found" };
      }

      const user = existingUsers[0];

      // Check if email is already taken by another user
      if (email !== user.email) {
        const [existingEmail] = await connection.query(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [email.trim().toLowerCase(), userId]
        );

        if (existingEmail.length > 0) {
          throw {
            status: 409,
            message: "Email is already in use by another account",
            errors: [{ field: "email", message: "Email already in use" }],
          };
        }
      }

      // Use existing values if not provided
      const updatedFullName = full_name ? full_name.trim() : user.full_name;
      const updatedEmail = email ? email.trim().toLowerCase() : user.email;
      const updatedMobileNo =
        mobile_no !== undefined ? mobile_no.trim() : user.mobile_no;
      const updatedAddress =
        address !== undefined ? address.trim() : user.address;
      const updatedNationalId = national_id
        ? national_id.trim()
        : user.national_id;

      // Create the base SQL for update - always include all fields
      let usersSql = `UPDATE users SET 
        full_name = ?, 
        email = ?, 
        mobile_no = ?, 
        address = ?, 
        national_id = ?,
        updated_at = NOW()
        WHERE id = ?`;

      // Create parameters array with all fields
      const params = [
        updatedFullName,
        updatedEmail,
        updatedMobileNo,
        updatedAddress,
        updatedNationalId,
        userId,
      ];

      // Update users table
      await connection.query(usersSql, params);

      // Update role-specific table based on user role
      if (user.role === "public") {
        let publicSql = `UPDATE public SET 
          full_name = ?, 
          email = ?, 
          mobile_no = ?, 
          address = ?, 
          national_id = ?,
          updated_at = NOW()
          WHERE username = ?`;

        // Create parameters array for public table
        const publicParams = [
          updatedFullName,
          updatedEmail,
          updatedMobileNo,
          updatedAddress,
          updatedNationalId,
          user.username,
        ];

        await connection.query(publicSql, publicParams);
      } else if (user.role === "police") {
        let policeSql = `UPDATE police SET 
          full_name = ?, 
          email = ?, 
          mobile_no = ?, 
          address = ?, 
          national_id = ?,
          updated_at = NOW()
          WHERE username = ?`;

        const policeParams = [
          updatedFullName,
          updatedEmail,
          updatedMobileNo,
          updatedAddress,
          updatedNationalId,
          user.username,
        ];

        await connection.query(policeSql, policeParams);
      } else if (user.role === "admin") {
        let adminSql = `UPDATE admin SET 
          full_name = ?, 
          email = ?, 
          mobile_no = ?, 
          address = ?, 
          national_id = ?,
          updated_at = NOW()
          WHERE username = ?`;

        const adminParams = [
          updatedFullName,
          updatedEmail,
          updatedMobileNo,
          updatedAddress,
          updatedNationalId,
          user.username,
        ];

        await connection.query(adminSql, adminParams);
      }

      await connection.commit();

      // Return updated user data
      return {
        id: userId,
        full_name: updatedFullName,
        username: user.username,
        email: updatedEmail,
        mobile_no: updatedMobileNo,
        address: updatedAddress,
        national_id: updatedNationalId,
        role: user.role,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      if (connection) await connection.release();
    }
  }

  static async deleteAccount(userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get user details first to determine role and email
      const [userResult] = await connection.query(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );

      if (userResult.length === 0) {
        throw { status: 404, message: "User not found" };
      }

      const user = userResult[0];
      const { role, email } = user;

      // Check if tables exist before attempting operations
      const tableCheckQueries = {
        reports: "SHOW TABLES LIKE 'reports'",
        assistance_requests: "SHOW TABLES LIKE 'assistance_requests'",
        notifications: "SHOW TABLES LIKE 'notifications'",
        password_reset_codes: "SHOW TABLES LIKE 'password_reset_codes'",
        comments: "SHOW TABLES LIKE 'comments'",
        police_responses: "SHOW TABLES LIKE 'police_responses'",
      };

      const tableExists = {};

      // Check which tables exist
      for (const [table, query] of Object.entries(tableCheckQueries)) {
        const [result] = await connection.query(query);
        tableExists[table] = result.length > 0;
        console.log(`Table ${table} exists: ${tableExists[table]}`);
      }

      // First, delete any related records based on user's role
      if (role === "public") {
        // Delete user's reports if table exists
        if (tableExists.reports) {
          await connection.query("DELETE FROM reports WHERE user_id = ?", [
            userId,
          ]);
        }

        // Delete user's assistance requests if table exists
        if (tableExists.assistance_requests) {
          await connection.query(
            "DELETE FROM assistance_requests WHERE user_id = ?",
            [userId]
          );
        }

        // Delete from public table
        await connection.query("DELETE FROM public WHERE email = ?", [email]);
      } else if (role === "police") {
        // Update assigned cases/reports if table exists
        if (tableExists.reports) {
          await connection.query(
            "UPDATE reports SET assigned_officer_id = NULL WHERE assigned_officer_id = ?",
            [userId]
          );
        }

        // Delete police responses if table exists
        if (tableExists.police_responses) {
          await connection.query(
            "DELETE FROM police_responses WHERE officer_id = ?",
            [userId]
          );
        }

        // First check if the police table has the user_id column
        let hasUserIdColumn = false;
        try {
          const [columns] = await connection.query("SHOW COLUMNS FROM police WHERE Field = 'user_id'");
          hasUserIdColumn = columns.length > 0;
        } catch (error) {
          console.error("Error checking for user_id column:", error);
        }
        
        // Delete from police table based on available columns
        if (hasUserIdColumn) {
          await connection.query("DELETE FROM police WHERE user_id = ? OR email = ?", [userId, email]);
        } else {
          await connection.query("DELETE FROM police WHERE email = ?", [email]);
        }
      } else if (role === "admin") {
        // Reset any admin-specific actions if reports table exists
        if (tableExists.reports) {
          await connection.query(
            "UPDATE reports SET reviewed_by = NULL WHERE reviewed_by = ?",
            [userId]
          );
        }

        // Delete from admin table
        await connection.query("DELETE FROM admin WHERE email = ?", [email]);
      }

      // Delete any notifications for this user if table exists
      if (tableExists.notifications) {
        await connection.query("DELETE FROM notifications WHERE user_id = ?", [
          userId,
        ]);
      }

      // Delete any reset codes for this user if table exists
      if (tableExists.password_reset_codes) {
        await connection.query(
          "DELETE FROM password_reset_codes WHERE email = ?",
          [email]
        );
      }

      // Delete any comments by this user if table exists
      if (tableExists.comments) {
        await connection.query("DELETE FROM comments WHERE user_id = ?", [
          userId,
        ]);
      }

      // Delete from users table (this should cascade to other tables with foreign key constraints)
      await connection.query("DELETE FROM users WHERE id = ?", [userId]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("Delete Account Error:", error);
      throw error;
    } finally {
      if (connection) await connection.release();
    }
  }

  static async generateResetToken(email) {
    try {
      // Check if the email exists
      const query = "SELECT id, username, email FROM users WHERE email = ?";
      const [rows] = await pool.execute(query, [email]);

      if (rows.length === 0) {
        return {
          success: false,
          message: "No user found with this email",
        };
      }

      // Generate a random token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Set the expiry time to 60 minutes from now
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

      // Update user with reset token - first check if reset_token_expires column exists
      let columnExists = true;

      try {
        // Check if the column exists
        const [columns] = await pool.execute(
          "SHOW COLUMNS FROM users LIKE 'reset_token_expires'"
        );
        columnExists = columns.length > 0;
      } catch (error) {
        console.error("Error checking for column existence:", error);
        columnExists = false;
      }

      // Update user record with token
      if (columnExists) {
        await pool.execute(
          "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
          [resetToken, resetTokenExpires, email]
        );
      } else {
        await pool.execute("UPDATE users SET reset_token = ? WHERE email = ?", [
          resetToken,
          email,
        ]);
      }

      return {
        success: true,
        message: "Reset token generated successfully",
        resetToken,
        username: rows[0].username,
        email: rows[0].email,
      };
    } catch (error) {
      console.error("Generate Reset Token Error:", error);
      return {
        success: false,
        message: "Error generating reset token",
      };
    }
  }

  static async verifyResetToken(token) {
    try {
      if (!token) {
        console.error("Token is empty or undefined");
        const error = new Error("Reset token is required");
        error.status = 400;
        throw error;
      }

      console.log("Verifying token:", token);
      console.log("Token length:", token.length);

      // Debug: Show all tokens in the database
      console.log("Checking database for tokens...");
      const [allTokens] = await pool.execute(
        "SELECT id, username, reset_token FROM users WHERE reset_token IS NOT NULL"
      );

      console.log("Found tokens in database:", allTokens.length);
      allTokens.forEach((row) => {
        console.log(
          `User ID: ${row.id}, Username: ${
            row.username
          }, Token: ${row.reset_token?.substring(0, 10)}...`
        );
      });

      // First try to include expiry check if column exists
      try {
        console.log("Attempting query with expiry check...");
        const query =
          "SELECT id, username FROM users WHERE reset_token = ? AND reset_token_expires > NOW()";
        const [rows] = await pool.execute(query, [token]);

        console.log("Query with expiry check results:", rows.length);

        if (rows.length > 0) {
          console.log("Token verified successfully with expiry check");
          return {
            success: true,
            userId: rows[0].id,
            username: rows[0].username,
          };
        }
      } catch (dbError) {
        // If column doesn't exist, fall back to simpler check
        console.error("Error with expiry check query:", dbError.message);
        if (dbError.code === "ER_BAD_FIELD_ERROR") {
          console.log(
            "reset_token_expires column doesn't exist, falling back to simple token check"
          );
        } else {
          throw dbError; // Re-throw if it's some other error
        }
      }

      // Fallback query without expiry check
      console.log("Attempting fallback query without expiry check...");
      const simpleQuery =
        "SELECT id, username FROM users WHERE reset_token = ?";
      const [rows] = await pool.execute(simpleQuery, [token]);

      console.log("Fallback query results:", rows.length);

      if (rows.length === 0) {
        console.error("No user found with this token");
        const error = new Error("Invalid or expired reset token");
        error.status = 400;
        throw error;
      }

      console.log("Token verified successfully with fallback query");
      return {
        success: true,
        userId: rows[0].id,
        username: rows[0].username,
      };
    } catch (error) {
      console.error("Verify Reset Token Error:", error);
      throw error;
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      // Find user with the provided token
      const query =
        "SELECT id, username, email FROM users WHERE reset_token = ?";
      const [rows] = await pool.execute(query, [token]);

      if (rows.length === 0) {
        return {
          success: false,
          message: "Invalid or expired reset token",
        };
      }

      const userId = rows[0].id;
      const username = rows[0].username;
      const email = rows[0].email;

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token (with graceful fallback)
      try {
        // Try to update with reset_token_expires column if it exists
        await pool.execute(
          "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
          [hashedPassword, userId]
        );
      } catch (dbError) {
        // Fall back to just reset_token if the column doesn't exist
        if (dbError.code === "ER_BAD_FIELD_ERROR") {
          console.log(
            "Falling back to just clearing reset_token without expiry"
          );
          await pool.execute(
            "UPDATE users SET password = ?, reset_token = NULL WHERE id = ?",
            [hashedPassword, userId]
          );
        } else {
          throw dbError;
        }
      }

      return {
        success: true,
        message: "Password reset successful",
        username,
        email,
      };
    } catch (error) {
      console.error("Reset Password Error:", error);
      return {
        success: false,
        message: "Failed to reset password",
      };
    }
  }

  static async generateResetCode(email) {
    try {
      // Check if the email exists
      const query =
        "SELECT id, username, full_name, email FROM users WHERE email = ?";
      const [rows] = await pool.execute(query, [email]);

      if (rows.length === 0) {
        return {
          success: false,
          message: "No user found with this email",
        };
      }

      // Generate a 6-digit code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Set the expiry time to 15 minutes from now
      const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

      // Ensure the reset_code and reset_code_expires columns exist
      try {
        // Check if the columns exist
        const [codeColumn] = await pool.execute(
          "SHOW COLUMNS FROM users LIKE 'reset_code'"
        );

        if (codeColumn.length === 0) {
          // Add the reset_code column if it doesn't exist
          await pool.execute(
            "ALTER TABLE users ADD COLUMN reset_code VARCHAR(10) NULL"
          );
        }

        const [expiryColumn] = await pool.execute(
          "SHOW COLUMNS FROM users LIKE 'reset_code_expires'"
        );

        if (expiryColumn.length === 0) {
          // Add the reset_code_expires column if it doesn't exist
          await pool.execute(
            "ALTER TABLE users ADD COLUMN reset_code_expires DATETIME NULL"
          );
        }
      } catch (error) {
        console.error("Error checking or adding columns:", error);
      }

      // Update user record with the reset code
      await pool.execute(
        "UPDATE users SET reset_code = ?, reset_code_expires = ? WHERE email = ?",
        [resetCode, resetCodeExpires, email]
      );

      return {
        success: true,
        message: "Reset code generated successfully",
        resetCode,
        username: rows[0].username,
        fullName: rows[0].full_name,
        email: rows[0].email,
      };
    } catch (error) {
      console.error("Generate Reset Code Error:", error);
      return {
        success: false,
        message: "Error generating reset code",
      };
    }
  }

  static async verifyResetCode(email, code) {
    try {
      if (!email || !code) {
        console.error("Email or code is missing");
        return {
          success: false,
          message: "Email and verification code are required",
        };
      }

      console.log(`Verifying code ${code} for email ${email}`);

      // Check if the code exists and is valid
      try {
        // Try with expiry first
        const [rows] = await pool.execute(
          "SELECT id, username FROM users WHERE email = ? AND reset_code = ? AND reset_code_expires > NOW()",
          [email, code]
        );

        if (rows.length > 0) {
          console.log("Code verified successfully with expiry check");
          return {
            success: true,
            userId: rows[0].id,
            username: rows[0].username,
            email,
          };
        }
      } catch (dbError) {
        // If column doesn't exist or some other DB issue
        console.error("Error with expiry check query:", dbError.message);
        if (dbError.code === "ER_BAD_FIELD_ERROR") {
          console.log(
            "reset_code_expires column doesn't exist, using simple check"
          );
        } else {
          throw dbError;
        }
      }

      // Fallback to just code check without expiry
      const [rows] = await pool.execute(
        "SELECT id, username FROM users WHERE email = ? AND reset_code = ?",
        [email, code]
      );

      if (rows.length === 0) {
        console.error("Invalid or expired verification code");
        return {
          success: false,
          message: "Invalid or expired verification code",
        };
      }

      return {
        success: true,
        userId: rows[0].id,
        username: rows[0].username,
        email,
      };
    } catch (error) {
      console.error("Verify Reset Code Error:", error);
      return {
        success: false,
        message: "Error verifying reset code",
      };
    }
  }

  static async resetPasswordWithCode(email, code, newPassword) {
    try {
      // Verify the code first
      const verification = await this.verifyResetCode(email, code);

      if (!verification.success) {
        return verification; // Return the error from verification
      }

      // If verification is successful, update the password
      const userId = verification.userId;
      const username = verification.username;

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset code
      await pool.execute(
        "UPDATE users SET password = ?, reset_code = NULL, reset_code_expires = NULL WHERE id = ?",
        [hashedPassword, userId]
      );

      return {
        success: true,
        message: "Password reset successful",
        username,
        email,
      };
    } catch (error) {
      console.error("Reset Password With Code Error:", error);
      return {
        success: false,
        message: "Failed to reset password",
      };
    }
  }

  static async getUsersByLocation(location) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        `SELECT id, username, full_name, email, role, address
         FROM users 
         WHERE address LIKE ? AND status = 'approved'`,
        [`%${location}%`]
      );

      return users;
    } catch (error) {
      console.error("Error finding users by location:", error);
      throw error;
    } finally {
      await connection.release();
    }
  }

  static async getUsersByRole(role) {
    const connection = await pool.getConnection();
    try {
      // For police users, join with the police table to get additional information
      if (role === "police") {
        // First check if the police table has the user_id column
        let hasUserIdColumn = false;
        try {
          const [columns] = await connection.query("SHOW COLUMNS FROM police WHERE Field = 'user_id'");
          hasUserIdColumn = columns.length > 0;
        } catch (error) {
          console.error("Error checking for user_id column:", error);
        }
        
        // Use the appropriate query based on table structure
        let query;
        if (hasUserIdColumn) {
          query = `
            SELECT u.*, 
                   p.police_id as policeId, 
                   p.station as station,
                   p.rank as rank
            FROM users u
            LEFT JOIN police p ON u.id = p.user_id OR u.email = p.email
            WHERE u.role = ?
          `;
        } else {
          // Fallback to just matching on email
          query = `
            SELECT u.*, 
                   p.police_id as policeId, 
                   p.station as station,
                   p.rank as rank
            FROM users u
            LEFT JOIN police p ON u.email = p.email
            WHERE u.role = ?
          `;
        }
        
        const [users] = await connection.query(query, [role]);
        console.log(`Found ${users.length} police users`);
        return users;
      } else {
        // For non-police users, just query the users table
        const query = "SELECT * FROM users WHERE role = ?";
        const [users] = await connection.query(query, [role]);
        return users;
      }
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    } finally {
      if (connection) await connection.release();
    }
  }
}

module.exports = UserModel;
