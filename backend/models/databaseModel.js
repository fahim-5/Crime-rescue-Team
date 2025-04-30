const { pool } = require('../config/db');

/**
 * Get all tables from the database
 */
exports.getAllTables = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      ORDER BY table_name
    `);
    return rows.map(row => row.table_name);
  } catch (error) {
    console.error('Error in getAllTables:', error);
    throw error;
  }
};

/**
 * Check if a table exists in the database
 */
exports.tableExists = async (tableName) => {
  try {
    // Using a parameterized query to prevent SQL injection
    const [rows] = await pool.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = ?
    `, [tableName]);
    
    return rows[0].table_count > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    throw error;
  }
};

/**
 * Check if a table has a created_at column
 */
exports.hasCreatedAtColumn = async (tableName) => {
  try {
    // Using a parameterized query to prevent SQL injection
    const [rows] = await pool.query(`
      SELECT COUNT(*) as column_count
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = ?
      AND column_name = 'created_at'
    `, [tableName]);
    
    return rows[0].column_count > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} has created_at column:`, error);
    throw error;
  }
};

/**
 * Get statistics for a specific table
 */
exports.getTableStats = async (tableName) => {
  try {
    // Get total number of rows
    const [rowCountResult] = await pool.query(`SELECT COUNT(*) as total FROM ??`, [tableName]);
    const totalRows = rowCountResult[0].total;
    
    // Get oldest and newest records (if created_at exists)
    let oldestRecord = null;
    let newestRecord = null;
    
    const hasCreatedAt = await this.hasCreatedAtColumn(tableName);
    
    if (hasCreatedAt) {
      const [oldestResult] = await pool.query(
        `SELECT DATE_FORMAT(MIN(created_at), '%Y-%m-%d') as oldest FROM ??`,
        [tableName]
      );
      
      const [newestResult] = await pool.query(
        `SELECT DATE_FORMAT(MAX(created_at), '%Y-%m-%d') as newest FROM ??`,
        [tableName]
      );
      
      oldestRecord = oldestResult[0].oldest;
      newestRecord = newestResult[0].newest;
    }
    
    // Get table size
    const [tableInfoResult] = await pool.query(`
      SELECT
        ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = ?
    `, [tableName]);
    
    const tableSize = tableInfoResult[0].size_mb ? `${tableInfoResult[0].size_mb} MB` : '0 MB';
    
    return {
      totalRows,
      oldestRecord,
      newestRecord,
      tableSize
    };
  } catch (error) {
    console.error(`Error getting stats for table ${tableName}:`, error);
    throw error;
  }
};

/**
 * Delete data from a table that is older than a specified date
 */
exports.purgeDataOlderThanDate = async (tableName, date) => {
  try {
    // Start a transaction
    await pool.query('START TRANSACTION');
    
    // Get count of records to be deleted (for reporting)
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as count FROM ?? WHERE created_at < ?`,
      [tableName, date]
    );
    
    const countToDelete = countResult[0].count;
    
    // Delete records older than the given date
    const [deleteResult] = await pool.query(
      `DELETE FROM ?? WHERE created_at < ?`,
      [tableName, date]
    );
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    return countToDelete;
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    console.error(`Error purging data from table ${tableName}:`, error);
    throw error;
  }
}; 