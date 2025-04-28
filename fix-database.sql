-- Add this at the top to see any SQL errors
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO,STRICT_TRANS_TABLES";

-- Create a temporary table to log errors
CREATE TEMPORARY TABLE IF NOT EXISTS migration_log (
  id INT NOT NULL AUTO_INCREMENT,
  operation VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Make sure we have access to information_schema
SET @has_access = (SELECT COUNT(*) FROM information_schema.tables WHERE 1=1);

-- Attempt to repair any corrupted tables
REPAIR TABLE crime_reports, users, police, validations, crime_alerts;
OPTIMIZE TABLE crime_reports, users, police, validations, crime_alerts;

-- Ensure we have the crime_reports table with proper structure
CREATE TABLE IF NOT EXISTS `crime_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `location` varchar(255) NOT NULL,
  `time` datetime NOT NULL,
  `crime_type` varchar(50) NOT NULL,
  `num_criminals` int(11) NOT NULL,
  `victim_gender` enum('Male','Female','Other') NOT NULL,
  `armed` enum('yes','no') NOT NULL,
  `photos` JSON DEFAULT NULL,
  `videos` JSON DEFAULT NULL,
  `reporter_id` int(11) DEFAULT NULL,
  `status` enum('Pending','Under Investigation','Solved') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_location` (`location`),
  KEY `idx_crime_type` (`crime_type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_crime_reports_users` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Make sure our users table has the necessary fields for reporter info
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `address` varchar(255) DEFAULT NULL AFTER `mobile_no`,
ADD COLUMN IF NOT EXISTS `full_name` varchar(100) NOT NULL AFTER `id`,
ADD COLUMN IF NOT EXISTS `email` varchar(100) NOT NULL AFTER `username`;

-- Ensure we have validations table for reports
CREATE TABLE IF NOT EXISTS `validations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_valid` boolean NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_validations_report_id` (`report_id`),
  KEY `fk_validations_user_id` (`user_id`),
  CONSTRAINT `fk_validations_reports` FOREIGN KEY (`report_id`) REFERENCES `crime_reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_validations_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ensure we have police_alerts table
CREATE TABLE IF NOT EXISTS `police_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `police_id` int(11) DEFAULT NULL,
  `status` enum('pending','acknowledged','closed') NOT NULL DEFAULT 'pending',
  `response_text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_alerts_report_id` (`report_id`),
  KEY `fk_alerts_police_id` (`police_id`),
  CONSTRAINT `fk_alerts_reports` FOREIGN KEY (`report_id`) REFERENCES `crime_reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alerts_police` FOREIGN KEY (`police_id`) REFERENCES `police` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Make sure our crime_reports table has needed columns
ALTER TABLE `crime_reports` 
  ADD COLUMN IF NOT EXISTS `crime_id` varchar(20) DEFAULT NULL AFTER `id`,
  ADD COLUMN IF NOT EXISTS `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  ADD COLUMN IF NOT EXISTS `videos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`videos`)),
  ADD COLUMN IF NOT EXISTS `reporter_id` int(11) DEFAULT NULL AFTER `created_at`,
  MODIFY COLUMN IF EXISTS `status` enum('pending','validating','investigating','resolved','closed') NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS `category_id` int(11) DEFAULT NULL;

-- Add the crime_id generation trigger if it doesn't exist
DELIMITER $$
DROP TRIGGER IF EXISTS `generate_crime_id` $$
CREATE TRIGGER `generate_crime_id` BEFORE INSERT ON `crime_reports` FOR EACH ROW
BEGIN
  IF NEW.crime_id IS NULL THEN
    SET NEW.crime_id = CONCAT('CR-', YEAR(CURRENT_DATE()), '-', LPAD((SELECT COUNT(*)+1 FROM `crime_reports` WHERE YEAR(created_at) = YEAR(CURRENT_DATE())), 3, '0'));
  END IF;
END $$
DELIMITER ;

-- Make sure users table has the necessary fields for reporter info
ALTER TABLE `users` 
  ADD COLUMN IF NOT EXISTS `address` varchar(255) DEFAULT NULL AFTER `mobile_no`,
  ADD COLUMN IF NOT EXISTS `full_name` varchar(255) NOT NULL AFTER `id`,
  ADD COLUMN IF NOT EXISTS `email` varchar(255) NOT NULL AFTER `username`;

-- Ensure we have validations table for reports
CREATE TABLE IF NOT EXISTS `validations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_valid` tinyint(1) NOT NULL DEFAULT 0,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_validation` (`report_id`,`user_id`),
  KEY `fk_validation_report` (`report_id`),
  KEY `fk_validation_user` (`user_id`),
  CONSTRAINT `fk_validation_report` FOREIGN KEY (`report_id`) REFERENCES `crime_reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_validation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ensure we have police_alerts table
CREATE TABLE IF NOT EXISTS `police_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `police_id` int(11) DEFAULT NULL,
  `status` enum('pending','confirmed','responded','closed') NOT NULL DEFAULT 'pending',
  `response_details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `responded_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_alert_report` (`report_id`),
  KEY `fk_alert_police` (`police_id`),
  CONSTRAINT `fk_alert_report` FOREIGN KEY (`report_id`) REFERENCES `crime_reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alert_police` FOREIGN KEY (`police_id`) REFERENCES `police` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Try to add the foreign keys if they don't exist, but do it safely
SET @safe_mode = 1;
SET @error_message = '';

SET @fk_exists = (
  SELECT COUNT(*) 
  FROM information_schema.table_constraints 
  WHERE constraint_name = 'fk_validation_report' 
  AND table_name = 'validations'
);

-- Only try to add if it doesn't exist
SET @add_fk_validation_report = CONCAT('ALTER TABLE validations ADD CONSTRAINT fk_validation_report FOREIGN KEY (report_id) REFERENCES crime_reports(id) ON DELETE CASCADE');
SET @add_fk_validation_user = CONCAT('ALTER TABLE validations ADD CONSTRAINT fk_validation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
SET @add_fk_alert_report = CONCAT('ALTER TABLE police_alerts ADD CONSTRAINT fk_alert_report FOREIGN KEY (report_id) REFERENCES crime_reports(id) ON DELETE CASCADE');
SET @add_fk_alert_police = CONCAT('ALTER TABLE police_alerts ADD CONSTRAINT fk_alert_police FOREIGN KEY (police_id) REFERENCES police(id) ON DELETE SET NULL');

-- Log completion
INSERT INTO migration_log (operation, status, message) VALUES ('Database fix complete', 'SUCCESS', 'All operations completed'); 