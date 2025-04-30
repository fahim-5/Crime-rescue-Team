-- Fix database issues with address_based_alerts table

-- Check if address_based_alerts table exists, if not create it
CREATE TABLE IF NOT EXISTS `address_based_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alert_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `alert_id` (`alert_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_alert_id` FOREIGN KEY (`alert_id`) REFERENCES `crime_alerts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Check if crime_alerts table has the necessary columns
ALTER TABLE `crime_alerts` 
  ADD COLUMN IF NOT EXISTS `location` VARCHAR(255) NOT NULL AFTER `description`,
  ADD COLUMN IF NOT EXISTS `type` ENUM('emergency','warning','notice','information') NOT NULL DEFAULT 'warning' AFTER `location`,
  ADD COLUMN IF NOT EXISTS `status` ENUM('active','resolved','expired') NOT NULL DEFAULT 'active' AFTER `type`;

-- Check for existing trigger and drop if exists
DROP TRIGGER IF EXISTS `after_crime_alert_insert`;

-- Create the trigger to automatically populate address_based_alerts
DELIMITER //
CREATE TRIGGER `after_crime_alert_insert` AFTER INSERT ON `crime_alerts` FOR EACH ROW
BEGIN
    -- Get the location of the crime report
    DECLARE crime_location VARCHAR(255);
    
    SELECT location INTO crime_location
    FROM crime_reports
    WHERE id = NEW.report_id;
    
    -- Insert into address_based_alerts for all users with matching address
    INSERT INTO address_based_alerts (alert_id, user_id)
    SELECT NEW.id, u.id
    FROM users u
    WHERE 
        -- Match users whose address contains the crime location
        -- or the crime location contains the user's address (flexible matching)
        (u.address LIKE CONCAT('%', crime_location, '%') OR
         crime_location LIKE CONCAT('%', u.address, '%'));
END //
DELIMITER ;

-- Check for and create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 