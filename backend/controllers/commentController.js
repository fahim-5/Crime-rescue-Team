const Comment = require('../models/commentModel');

const commentController = {
  async getComments(req, res) {
    try {
      const { reportId } = req.params;
      const comments = await Comment.getCommentsByReportId(reportId);
      res.json({ success: true, data: comments });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch comments', error: err.message });
    }
  },

  async addComment(req, res) {
    try {
      const { reportId } = req.params;
      const { comment } = req.body;
      const user_id = req.user.id;
      if (!comment || !comment.trim()) {
        return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
      }
      const newComment = await Comment.addComment({ report_id: reportId, user_id, comment });
      res.json({ success: true, data: newComment });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to add comment', error: err.message });
    }
  },
};

module.exports = commentController; 