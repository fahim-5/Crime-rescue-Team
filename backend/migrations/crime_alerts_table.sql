-- Create the crime_alerts table
CREATE TABLE IF NOT EXISTS `crime_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('active','resolved') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `details` JSON DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_crime_alerts_reports` (`report_id`),
  KEY `idx_location` (`location`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  CONSTRAINT `fk_crime_alerts_reports` FOREIGN KEY (`report_id`) REFERENCES `crime_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 