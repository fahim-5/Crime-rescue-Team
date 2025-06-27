import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './CommentSection.module.css';

const API_URL = 'http://localhost:5000';

const CommentSection = ({ reportId, user, token }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [reportId]);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/api/reports/${reportId}/comments`);
      setComments(res.data.data || []);
    } catch (err) {
      setError('Failed to load comments');
    }
    setLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(
        `${API_URL}/api/reports/${reportId}/comments`,
        { comment: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setNewComment('');
      fetchComments();
    } catch (err) {
      setError('Failed to add comment');
    }
    setLoading(false);
  };

  return (
    <div className={styles.commentSection}>
      <h4>Comments</h4>
      {loading && <div>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.commentsList}>
        {comments.length === 0 && <div>No comments yet.</div>}
        {comments.map((c) => (
          <div key={c.id} className={styles.commentItem}>
            <span className={styles.userName}>{c.userName || 'User'}:</span>
            <span className={styles.commentText}>{c.comment}</span>
            <span className={styles.commentTime}>{new Date(c.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
      {user && (
        <form onSubmit={handleAddComment} className={styles.commentForm}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={loading}
            className={styles.commentInput}
          />
          <button type="submit" disabled={loading || !newComment.trim()} className={styles.commentButton}>
            Post
          </button>
        </form>
      )}
    </div>
  );
};

export default CommentSection; 