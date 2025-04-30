const { pool } = require('../config/db');
const databaseModel = require('../models/databaseModel');

/**
 * Get all available tables in the database
 */
exports.getTables = async (req, res) => {
  try {
    const tables = await databaseModel.getAllTables();
    
    return res.status(200).json({
      success: true,
      tables
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch database tables',
      error: error.message
    });
  }
};

/**
 * Get statistics for a specific table
 */
exports.getTableStats = async (req, res) => {
  const { tableName } = req.params;
  
  // Basic input validation
  if (!tableName) {
    return res.status(400).json({
      success: false,
      message: 'Table name is required'
    });
  }

  try {
    // Validate table name to prevent SQL injection
    const tableExists = await databaseModel.tableExists(tableName);
    
    if (!tableExists) {
      return res.status(404).json({
        success: false,
        message: `Table '${tableName}' does not exist`
      });
    }

    const stats = await databaseModel.getTableStats(tableName);
    
    return res.status(200).json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error(`Error fetching stats for table ${tableName}:`, error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch statistics for table ${tableName}`,
      error: error.message
    });
  }
};

/**
 * Purge data from a table that is older than a specific date
 */
exports.purgeData = async (req, res) => {
  const { table, date } = req.body;
  
  // Basic input validation
  if (!table || !date) {
    return res.status(400).json({
      success: false,
      message: 'Table name and date are required'
    });
  }

  try {
    // Validate table name to prevent SQL injection
    const tableExists = await databaseModel.tableExists(table);
    
    if (!tableExists) {
      return res.status(404).json({
        success: false,
        message: `Table '${table}' does not exist`
      });
    }

    // Check if the table has a created_at column
    const hasCreatedAt = await databaseModel.hasCreatedAtColumn(table);
    
    if (!hasCreatedAt) {
      return res.status(400).json({
        success: false,
        message: `Table '${table}' does not have a created_at column and cannot be purged by date`
      });
    }

    // Confirm it's a valid date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Perform the purge operation
    const deletedCount = await databaseModel.purgeDataOlderThanDate(table, date);
    
    return res.status(200).json({
      success: true,
      message: `Successfully purged data from ${table}`,
      deletedCount
    });
  } catch (error) {
    console.error(`Error purging data from table ${table}:`, error);
    return res.status(500).json({
      success: false,
      message: `Failed to purge data from table ${table}`,
      error: error.message
    });
  }
}; 