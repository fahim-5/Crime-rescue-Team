-- Make sure crime_reports table has a status field
ALTER TABLE crime_reports 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS police_id VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS case_taken_at DATETIME DEFAULT NULL;

-- Create validations table if it doesn't exist
CREATE TABLE IF NOT EXISTS validations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  report_id INT NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES crime_reports(id) ON DELETE CASCADE,
  UNIQUE KEY user_report_unique (user_id, report_id)
);

-- Create case_updates table if it doesn't exist
CREATE TABLE IF NOT EXISTS case_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES crime_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 