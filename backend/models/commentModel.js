const db = require('../config/database');

const Comment = {
  async getCommentsByReportId(reportId) {
    const [rows] = await db.query(
      'SELECT c.*, u.full_name as userName FROM comments c JOIN users u ON c.user_id = u.id WHERE c.report_id = ? ORDER BY c.created_at ASC',
      [reportId]
    );
    return rows;
  },

  async addComment({ report_id, user_id, comment }) {
    const [result] = await db.query(
      'INSERT INTO comments (report_id, user_id, comment) VALUES (?, ?, ?)',
      [report_id, user_id, comment]
    );
    return { id: result.insertId, report_id, user_id, comment };
  },
};

module.exports = Comment; 