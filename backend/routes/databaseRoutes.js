const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

/**
 * @route GET /api/admin/database/tables
 * @desc Get all tables in the database
 * @access Admin only
 */
router.get('/tables', authenticateToken, isAdmin, databaseController.getTables);

/**
 * @route GET /api/admin/database/stats/:tableName
 * @desc Get statistics for a specific table
 * @access Admin only
 */
router.get('/stats/:tableName', authenticateToken, isAdmin, databaseController.getTableStats);

/**
 * @route POST /api/admin/database/purge
 * @desc Purge data from a table that is older than a specific date
 * @access Admin only
 */
router.post('/purge', authenticateToken, isAdmin, databaseController.purgeData);

module.exports = router; 