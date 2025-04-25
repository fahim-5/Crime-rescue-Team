const fs = require("fs");
const path = require("path");

const fileUtils = {
  /**
   * Get full URL path for a file from its relative path
   * @param {string} relativePath - Relative path from uploads directory
   * @param {string} baseUrl - Base URL of the API
   * @returns {string} Full URL for the file
   */
  getFileUrl: (
    relativePath,
    baseUrl = process.env.API_URL || "http://localhost:5000"
  ) => {
    if (!relativePath) return null;
    return `${baseUrl}/api/uploads/${relativePath}`;
  },

  /**
   * Delete a file from the uploads directory
   * @param {string} filePath - Path to the file (can be relative or absolute)
   * @returns {Promise<boolean>} Whether the file was deleted successfully
   */
  deleteFile: async (filePath) => {
    try {
      // If path is relative, make it absolute
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(__dirname, "../uploads", filePath);

      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      return false;
    }
  },

  /**
   * Delete multiple files from the uploads directory
   * @param {Array<string>} filePaths - Array of file paths
   * @returns {Promise<Array<string>>} Array of successfully deleted file paths
   */
  deleteFiles: async (filePaths) => {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return [];
    }

    const results = await Promise.all(
      filePaths.map(async (filePath) => {
        const success = await fileUtils.deleteFile(filePath);
        return { path: filePath, success };
      })
    );

    return results
      .filter((result) => result.success)
      .map((result) => result.path);
  },
};

module.exports = fileUtils;
