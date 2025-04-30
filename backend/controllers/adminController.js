const UserModel = require("../models/userModel");

/**
 * Get all users based on role query parameter
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role = "public" } = req.query;
    
    // Validate role
    if (!["public", "police", "admin"].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid role parameter" 
      });
    }
    
    console.log(`Fetching users with role: ${role}`);
    
    // Get users from database
    const users = await UserModel.getUsersByRole(role);
    
    console.log(`Retrieved ${users.length} ${role} users`);
    
    // For debugging police users
    if (role === "police") {
      console.log("Sample police user data:", users.length > 0 ? JSON.stringify(users[0]) : "No police users found");
    }
    
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user from database
    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message
    });
  }
};

/**
 * Delete a user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Attempting to delete user with ID: ${id}`);
    
    // Check if user exists
    const user = await UserModel.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    console.log(`Found user to delete: ${user.username} (${user.email}), role: ${user.role}`);
    
    // Don't allow deleting admin users through this endpoint
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users"
      });
    }
    
    // Delete user
    await UserModel.deleteAccount(id);
    
    console.log(`Successfully deleted user ID: ${id}`);
    
    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
}; 