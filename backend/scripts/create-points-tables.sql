-- Check if points column exists in users table, if not add it
ALTER TABLE users
ADD COLUMN IF NOT EXISTS points INT NOT NULL DEFAULT 0;

-- Create points_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS points_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  points INT NOT NULL,
  reason TEXT,
  awarded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 