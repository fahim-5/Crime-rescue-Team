const { pool } = require("../config/db");

const userController = {
  // Award points to a user
  awardPoints: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { userId } = req.params;
      const { points, reason } = req.body;

      // Validate input
      if (!userId || !points || points <= 0) {
        return res.status(400).json({
          success: false,
          message: "User ID and positive points value are required",
        });
      }

      // Check if the user exists
      const [userResults] = await connection.query(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );

      if (userResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      console.log(
        `Adding ${points} points to user ${userId}. Reason: ${reason}`
      );

      // Update the user's points directly - making this a simpler operation
      const [updateResult] = await connection.query(
        "UPDATE users SET points = points + ? WHERE id = ?",
        [points, userId]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to update user points",
        });
      }

      // Get the updated points
      const [updatedUser] = await connection.query(
        "SELECT points FROM users WHERE id = ?",
        [userId]
      );

      return res.status(200).json({
        success: true,
        message: `Successfully awarded ${points} points to user`,
        data: {
          userId,
          pointsAwarded: points,
          currentPoints: updatedUser[0].points,
        },
      });
    } catch (error) {
      console.error("Error awarding points:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    } finally {
      if (connection) await connection.release();
    }
  },

  // Get a user's points
  getUserPoints: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { userId } = req.params;

      // Check if the user exists
      const [userResults] = await connection.query(
        "SELECT points FROM users WHERE id = ?",
        [userId]
      );

      if (userResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          userId,
          points: userResults[0].points,
        },
      });
    } catch (error) {
      console.error("Error getting user points:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    } finally {
      if (connection) await connection.release();
    }
  },
};

module.exports = userController;
