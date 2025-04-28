-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 28, 2025 at 07:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crime_rescue_bd`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `national_id` varchar(255) NOT NULL,
  `passport` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `full_name`, `username`, `email`, `national_id`, `passport`, `mobile_no`, `password`, `address`, `created_at`, `updated_at`) VALUES
(2, 'Fahim Faysal', 'fahim', 'fahimbafu@gmail.com', '9631478952', NULL, '01774071130', '$2b$10$XkooQEfw8HJgPoyqdQeKnevblEPSUWsFW0uzG5jasfC7AxLdRLgpe', 'Dhaka-Mirpur', '2025-03-28 15:59:48', '2025-03-28 15:59:48'),
(3, 'admin1', 'admin', 'mfaysal223224@bscse.uiu.ac.bd', '6395959595', '1212121', '0174646464', '$2a$10$zJnE3Wpv9GHrQw/IligOGevRMvzIxYMsOp00qxqX8uaNcOYCm802C', 'Dhaka-Mirpur', '2025-04-28 11:58:04', '2025-04-28 11:58:04');

-- --------------------------------------------------------

--
-- Table structure for table `cases`
--

CREATE TABLE `cases` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `case_number` varchar(50) NOT NULL,
  `status` enum('open','investigating','pending','closed','resolved') NOT NULL DEFAULT 'open',
  `assigned_to` int(11) DEFAULT NULL,
  `priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cases`
--

INSERT INTO `cases` (`id`, `report_id`, `case_number`, `status`, `assigned_to`, `priority`, `notes`, `created_at`, `updated_at`, `closed_at`) VALUES
(2, 3, 'CASE-3', 'resolved', NULL, 'medium', NULL, '2025-04-28 13:06:34', '2025-04-28 13:06:34', NULL),
(3, 4, 'CASE-4', 'open', NULL, 'medium', NULL, '2025-04-28 13:06:34', '2025-04-28 13:06:34', NULL),
(5, 5, 'CASE-5', 'open', NULL, 'medium', NULL, '2025-04-28 14:54:02', '2025-04-28 14:54:02', NULL),
(6, 6, 'CASE-6', 'open', NULL, 'medium', NULL, '2025-04-28 14:54:02', '2025-04-28 14:54:02', NULL),
(7, 7, 'CASE-7', 'open', NULL, 'medium', NULL, '2025-04-28 14:54:02', '2025-04-28 14:54:02', NULL),
(8, 8, 'CASE-8', 'open', NULL, 'medium', NULL, '2025-04-28 14:54:02', '2025-04-28 14:54:02', NULL),
(9, 9, 'CASE-9', 'open', NULL, 'medium', NULL, '2025-04-28 14:54:02', '2025-04-28 14:54:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `case_updates`
--

CREATE TABLE `case_updates` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `update_by` int(11) NOT NULL,
  `update_text` text NOT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `crime_alerts`
--

CREATE TABLE `crime_alerts` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(255) NOT NULL,
  `type` enum('emergency','warning','notice','information') NOT NULL DEFAULT 'warning',
  `alert_type` enum('emergency','warning','notice','information') NOT NULL DEFAULT 'warning',
  `status` enum('active','resolved','expired') NOT NULL DEFAULT 'active',
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `created_by` int(11) NOT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `response_details` text DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `crime_alerts`
--

INSERT INTO `crime_alerts` (`id`, `report_id`, `title`, `description`, `location`, `type`, `alert_type`, `status`, `severity`, `created_by`, `assigned_to`, `response_details`, `details`, `created_at`, `expires_at`, `resolved_at`, `updated_at`) VALUES
(1, 2, 'Theft Alert in Mirpur', 'Multiple theft incidents reported in Mirpur area. Be vigilant.', 'Mirpur, Dhaka', 'warning', 'warning', 'active', 'high', 16, 3, NULL, '{}', '2025-04-27 08:00:00', '2025-05-05 08:00:00', NULL, '2025-04-27 21:18:39'),
(2, 2, 'Emergency Response Needed', 'Armed robbery in progress at Mirpur-10. Police units dispatched.', 'Mirpur-10, Dhaka', 'emergency', 'emergency', 'resolved', 'critical', 16, 3, 'Multiple units responding. ETA 5 minutes.', '{}', '2025-04-27 09:30:00', '2025-04-27 17:59:59', NULL, '2025-04-28 14:29:13');

--
-- Triggers `crime_alerts`
--
DELIMITER $$
CREATE TRIGGER `after_crime_alert_insert` AFTER INSERT ON `crime_alerts` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `crime_areas`
--

CREATE TABLE `crime_areas` (
  `id` int(11) NOT NULL,
  `district` varchar(100) NOT NULL,
  `thana` varchar(100) NOT NULL,
  `area_name` varchar(255) NOT NULL,
  `coordinates` varchar(255) DEFAULT NULL,
  `risk_level` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `last_incident_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `crime_categories`
--

CREATE TABLE `crime_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `severity_level` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `crime_categories`
--

INSERT INTO `crime_categories` (`id`, `name`, `description`, `severity_level`, `created_at`, `updated_at`) VALUES
(1, 'Theft', 'Taking someone\'s property without permission', 'medium', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(2, 'Robbery', 'Taking property through force or fear', 'high', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(3, 'Assault', 'Physical attack on another person', 'high', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(4, 'Murder', 'Unlawful killing of another person', 'critical', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(5, 'Kidnapping', 'Taking a person against their will', 'critical', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(6, 'Fraud', 'Deception for financial gain', 'medium', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(7, 'Cybercrime', 'Crime involving computers or networks', 'medium', '2025-04-22 14:00:00', '2025-04-22 14:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `crime_reports`
--

CREATE TABLE `crime_reports` (
  `id` int(11) NOT NULL,
  `crime_id` varchar(20) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `time` datetime NOT NULL,
  `crime_type` varchar(50) NOT NULL,
  `num_criminals` int(11) NOT NULL,
  `victim_gender` varchar(20) NOT NULL,
  `armed` varchar(10) NOT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `videos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`videos`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reporter_id` int(11) DEFAULT NULL,
  `status` enum('pending','validating','investigating','resolved','closed') NOT NULL DEFAULT 'pending',
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `crime_reports`
--

INSERT INTO `crime_reports` (`id`, `crime_id`, `location`, `time`, `crime_type`, `num_criminals`, `victim_gender`, `armed`, `photos`, `videos`, `created_at`, `reporter_id`, `status`, `category_id`) VALUES
(3, NULL, 'Fahim Reporting', '2025-04-27 21:15:22', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-04-27 21:15:50', 20, 'pending', NULL),
(4, NULL, 'Fahim 3', '2025-04-28 08:53:03', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-04-28 08:53:08', 21, 'pending', NULL),
(5, NULL, 'one to one', '2025-04-28 14:23:57', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-04-28 14:24:05', 21, 'pending', NULL),
(6, NULL, 'one to two', '2025-04-28 14:24:06', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-04-28 14:24:18', 21, 'pending', NULL),
(7, NULL, 'one to three', '2025-04-28 14:24:18', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-04-28 14:24:28', 21, 'pending', NULL),
(8, NULL, 'report from two to one', '2025-04-28 14:26:33', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-04-28 14:26:41', 22, 'pending', NULL),
(9, NULL, 'two to two', '2025-04-28 14:26:41', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-04-28 14:26:49', 22, 'pending', NULL);

--
-- Triggers `crime_reports`
--
DELIMITER $$
CREATE TRIGGER `generate_crime_id` BEFORE INSERT ON `crime_reports` FOR EACH ROW BEGIN
  IF NEW.crime_id IS NULL THEN
    SET NEW.crime_id = CONCAT('CR-', YEAR(CURRENT_DATE()), '-', LPAD((SELECT COUNT(*)+1 FROM `crime_reports` WHERE YEAR(created_at) = YEAR(CURRENT_DATE())), 3, '0'));
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `emergency_contacts`
--

CREATE TABLE `emergency_contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `service_type` enum('police','ambulance','fire','helpline') NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `district` varchar(100) NOT NULL,
  `thana` varchar(100) DEFAULT NULL,
  `available_24_7` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emergency_contacts`
--

INSERT INTO `emergency_contacts` (`id`, `name`, `service_type`, `phone_number`, `address`, `district`, `thana`, `available_24_7`, `created_at`, `updated_at`) VALUES
(1, 'National Emergency Service', 'police', '999', 'N/A', 'All', NULL, 1, '2025-04-22 15:45:00', '2025-04-27 21:07:29'),
(2, 'Fire Service & Civil Defense', 'fire', '16563', 'N/A', 'All', NULL, 1, '2025-04-22 15:45:00', '2025-04-27 21:07:29'),
(3, 'Ambulance Service', 'ambulance', '16263', 'N/A', 'All', NULL, 1, '2025-04-22 15:45:00', '2025-04-27 21:07:29'),
(4, 'Women & Children Helpline', 'helpline', '109', 'N/A', 'All', NULL, 1, '2025-04-22 15:45:00', '2025-04-27 21:07:29'),
(5, 'Dhaka Medical College Hospital', 'ambulance', '01712345678', 'Secretariat Rd, Dhaka', 'Dhaka', 'Shahbag', 1, '2025-04-22 15:45:00', '2025-04-27 21:07:29');

-- --------------------------------------------------------

--
-- Table structure for table `evidence`
--

CREATE TABLE `evidence` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_type` enum('image','video','audio','document','other') NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `feedback_type` enum('general','report','service','app') NOT NULL DEFAULT 'general',
  `rating` int(1) NOT NULL,
  `message` text DEFAULT NULL,
  `related_id` int(11) DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('pending','reviewed','responded') NOT NULL DEFAULT 'pending',
  `responded_by` int(11) DEFAULT NULL,
  `response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('alert','info','warning','success') NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `related_to` varchar(50) DEFAULT NULL,
  `related_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `related_to`, `related_id`, `created_at`, `updated_at`) VALUES
(4, 20, 'Report Submitted', 'Your crime report #3 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 1, NULL, 3, '2025-04-27 21:15:50', '2025-04-27 21:26:59'),
(5, 21, 'New Crime Report', 'A new report about theft in Fahim Reporting has been submitted. Stay safe!', 'info', 0, NULL, 3, '2025-04-27 21:15:50', '2025-04-27 21:15:50'),
(6, 22, 'New Crime Report', 'A new report about theft in Fahim Reporting has been submitted. Stay safe!', 'info', 0, NULL, 3, '2025-04-27 21:15:50', '2025-04-27 21:15:50'),
(7, 21, 'Report Submitted', 'Your crime report #4 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 4, '2025-04-28 08:53:08', '2025-04-28 08:53:08'),
(8, 20, 'New Crime Report', 'A new report about theft in Fahim 3 has been submitted. Stay safe!', 'info', 0, NULL, 4, '2025-04-28 08:53:08', '2025-04-28 08:53:08'),
(9, 22, 'New Crime Report', 'A new report about theft in Fahim 3 has been submitted. Stay safe!', 'info', 0, NULL, 4, '2025-04-28 08:53:08', '2025-04-28 08:53:08'),
(10, 24, 'New Crime Report Submitted', 'A new theft has been reported in one to one. Report ID: 5', 'alert', 1, NULL, 5, '2025-04-28 14:24:05', '2025-04-28 14:31:55'),
(11, 21, 'Report Submitted', 'Your crime report #5 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 5, '2025-04-28 14:24:06', '2025-04-28 14:24:06'),
(12, 20, 'New Crime Report', 'A new report about theft in one to one has been submitted. Stay safe!', 'info', 0, NULL, 5, '2025-04-28 14:24:06', '2025-04-28 14:24:06'),
(13, 22, 'New Crime Report', 'A new report about theft in one to one has been submitted. Stay safe!', 'info', 0, NULL, 5, '2025-04-28 14:24:06', '2025-04-28 14:24:06'),
(14, 24, 'New Crime Report Submitted', 'A new theft has been reported in one to two. Report ID: 6', 'alert', 1, NULL, 6, '2025-04-28 14:24:18', '2025-04-28 14:31:55'),
(15, 21, 'Report Submitted', 'Your crime report #6 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 6, '2025-04-28 14:24:18', '2025-04-28 14:24:18'),
(16, 20, 'New Crime Report', 'A new report about theft in one to two has been submitted. Stay safe!', 'info', 0, NULL, 6, '2025-04-28 14:24:18', '2025-04-28 14:24:18'),
(17, 22, 'New Crime Report', 'A new report about theft in one to two has been submitted. Stay safe!', 'info', 0, NULL, 6, '2025-04-28 14:24:18', '2025-04-28 14:24:18'),
(18, 24, 'New Crime Report Submitted', 'A new theft has been reported in one to three. Report ID: 7', 'alert', 1, NULL, 7, '2025-04-28 14:24:28', '2025-04-28 14:25:17'),
(19, 21, 'Report Submitted', 'Your crime report #7 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 7, '2025-04-28 14:24:28', '2025-04-28 14:24:28'),
(20, 20, 'New Crime Report', 'A new report about theft in one to three has been submitted. Stay safe!', 'info', 0, NULL, 7, '2025-04-28 14:24:28', '2025-04-28 14:24:28'),
(21, 22, 'New Crime Report', 'A new report about theft in one to three has been submitted. Stay safe!', 'info', 0, NULL, 7, '2025-04-28 14:24:28', '2025-04-28 14:24:28'),
(22, 24, 'New Crime Report Submitted', 'A new theft has been reported in report from two to one. Report ID: 8', 'alert', 1, NULL, 8, '2025-04-28 14:26:41', '2025-04-28 14:31:55'),
(23, 22, 'Report Submitted', 'Your crime report #8 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 8, '2025-04-28 14:26:41', '2025-04-28 14:26:41'),
(24, 20, 'New Crime Report', 'A new report about theft in report from two to one has been submitted. Stay safe!', 'info', 0, NULL, 8, '2025-04-28 14:26:41', '2025-04-28 14:26:41'),
(25, 21, 'New Crime Report', 'A new report about theft in report from two to one has been submitted. Stay safe!', 'info', 0, NULL, 8, '2025-04-28 14:26:41', '2025-04-28 14:26:41'),
(26, 24, 'New Crime Report Submitted', 'A new theft has been reported in two to two. Report ID: 9', 'alert', 1, NULL, 9, '2025-04-28 14:26:49', '2025-04-28 14:31:55'),
(27, 22, 'Report Submitted', 'Your crime report #9 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 9, '2025-04-28 14:26:49', '2025-04-28 14:26:49'),
(28, 20, 'New Crime Report', 'A new report about theft in two to two has been submitted. Stay safe!', 'info', 0, NULL, 9, '2025-04-28 14:26:49', '2025-04-28 14:26:49'),
(29, 21, 'New Crime Report', 'A new report about theft in two to two has been submitted. Stay safe!', 'info', 0, NULL, 9, '2025-04-28 14:26:49', '2025-04-28 14:26:49');

-- --------------------------------------------------------

--
-- Table structure for table `police`
--

CREATE TABLE `police` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `national_id` varchar(255) NOT NULL,
  `passport` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `police_id` varchar(50) DEFAULT NULL,
  `station` varchar(255) DEFAULT NULL,
  `rank` varchar(100) DEFAULT NULL,
  `badge_number` varchar(50) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `station_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `police`
--

INSERT INTO `police` (`id`, `full_name`, `username`, `email`, `national_id`, `passport`, `mobile_no`, `password`, `address`, `police_id`, `station`, `rank`, `badge_number`, `joining_date`, `created_at`, `updated_at`, `station_id`) VALUES
(3, 'Mahir Forhad', 'forhad', 'forhad@gmail.com', '7536894210', '321789', '0142698534', '$2b$10$mbvjmjRC6Di9lK/hNuRcw.KuzpYIAd.rlDLDYJ/Z.ib2/mhkxvjNe', 'Dinajpur-kotoali', '101', 'Badda', 'ASP', '55', '2025-03-04', '2025-03-28 15:57:58', '2025-03-28 15:57:58', 1),
(4, 'Ruhul Amin', 'ruhul', 'ruhul@gmail.com', '95136746952', NULL, '1477953264', '$2b$10$qcknsgIyY01uK9h7N1p2hu193JBnsv3AHJnvdDUcxCdbqSwVBk3x.', 'Thana-Birol', '789', 'dhaka', '12', '56', '2025-04-18', '2025-04-17 15:44:00', '2025-04-17 15:44:00', 2),
(5, 'Md Abdullah', 'abdullah', 'abdulllah@gmail.com', '569981659465', NULL, '01456986251', '$2b$10$RuqMTxpDUGJ1hl421HGZ2ueHi1pirXGfhPWPMthvxI/Jo3aj9qR2K', 'Dhaka-Mirpur', '96', 'Misrup', 'SI', '02', '2025-04-08', '2025-04-18 09:48:55', '2025-04-18 09:48:55', 3),
(6, 'rakin', 'rakib', 'rakib@gmail.com', '4569332154', NULL, '01774071126', '$2b$10$T/owIsT.zn8mofsylmgTXOy8wad2.Ysugad8mhIRRGx4KwOjk9Fk6', 'dhaka-bangladesh', '78', 'cazcxzcvcx', 'acas', 'fg', '2025-04-26', '2025-04-21 16:15:22', '2025-04-21 16:15:22', 4);

-- --------------------------------------------------------

--
-- Table structure for table `police_alerts`
--

CREATE TABLE `police_alerts` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `police_id` int(11) DEFAULT NULL,
  `status` enum('pending','confirmed','responded','closed') NOT NULL DEFAULT 'pending',
  `response_details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `responded_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `police_alerts`
--

INSERT INTO `police_alerts` (`id`, `report_id`, `police_id`, `status`, `response_details`, `created_at`, `responded_at`, `updated_at`) VALUES
(1, 3, NULL, 'pending', NULL, '2025-04-27 21:15:50', NULL, '2025-04-27 21:15:50'),
(2, 4, NULL, 'pending', NULL, '2025-04-28 08:53:08', NULL, '2025-04-28 08:53:08'),
(3, 5, NULL, 'pending', NULL, '2025-04-28 14:24:05', NULL, '2025-04-28 14:24:05'),
(4, 6, NULL, 'pending', NULL, '2025-04-28 14:24:18', NULL, '2025-04-28 14:24:18'),
(5, 7, NULL, 'pending', NULL, '2025-04-28 14:24:28', NULL, '2025-04-28 14:24:28'),
(6, 8, NULL, 'pending', NULL, '2025-04-28 14:26:41', NULL, '2025-04-28 14:26:41'),
(7, 9, NULL, 'pending', NULL, '2025-04-28 14:26:49', NULL, '2025-04-28 14:26:49');

-- --------------------------------------------------------

--
-- Table structure for table `police_stations`
--

CREATE TABLE `police_stations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `district` varchar(100) NOT NULL,
  `thana` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `officer_in_charge` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `police_stations`
--

INSERT INTO `police_stations` (`id`, `name`, `address`, `district`, `thana`, `phone`, `email`, `officer_in_charge`, `created_at`, `updated_at`) VALUES
(1, 'Badda Police Station', '15/A, Middle Badda, Dhaka-1212', 'Dhaka', 'Badda', '01713398339', 'ocbadda@police.gov.bd', 'AKM Hafiz Akhter', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(2, 'Mirpur Police Station', 'Section-1, Mirpur, Dhaka-1216', 'Dhaka', 'Mirpur', '01713373196', 'ocmirpur@police.gov.bd', 'Mohammad Selim', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(3, 'Vatara Police Station', 'Notun Bazar, Vatara, Dhaka-1212', 'Dhaka', 'Vatara', '01713373158', 'ocvatara@police.gov.bd', 'Mohiuddin Faruki', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(4, 'Birol Police Station', 'Main Road, Birol, Dinajpur-5310', 'Dinajpur', 'Birol', '01713398254', 'ocbirol@police.gov.bd', 'Shamsul Haque', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(5, 'Kotoali Police Station', 'Central Road, Kotoali, Dinajpur-5200', 'Dinajpur', 'Kotoali', '01713373125', 'ockotoali@police.gov.bd', 'Abdul Kader', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(6, 'Gulshan Police Station', '80 Gulshan Avenue, Dhaka-1212', 'Dhaka', 'Gulshan', '01713373210', 'ocgulshan@police.gov.bd', 'Md Asaduzzaman', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(7, 'Uttara East Police Station', 'Sector-4, Uttara, Dhaka-1230', 'Dhaka', 'Uttara East', '01713373211', 'ocuttaraeast@police.gov.bd', 'Noor-e-Azam Mia', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(8, 'Uttara West Police Station', 'Sector-7, Uttara, Dhaka-1230', 'Dhaka', 'Uttara West', '01713373212', 'ocuttarawest@police.gov.bd', 'Mohammad Mohsin', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(9, 'Dhanmondi Police Station', 'House-33, Road-2, Dhanmondi, Dhaka-1205', 'Dhaka', 'Dhanmondi', '01713373213', 'ocdhanmondi@police.gov.bd', 'Rezaul Karim', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(10, 'Mohammadpur Police Station', 'Ring Road, Mohammadpur, Dhaka-1207', 'Dhaka', 'Mohammadpur', '01713373214', 'ocmohammadpur@police.gov.bd', 'Jahidul Islam', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(11, 'Ramna Police Station', 'New Circular Road, Ramna, Dhaka-1217', 'Dhaka', 'Ramna', '01713373215', 'ocramna@police.gov.bd', 'Harunor Rashid', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(12, 'Khilgaon Police Station', 'Khilgaon Chowdhury Para, Dhaka-1219', 'Dhaka', 'Khilgaon', '01713373216', 'ockhilgaon@police.gov.bd', 'Faruk Ahmed', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(13, 'Motijheel Police Station', '8 Inner Circular Road, Dhaka-1000', 'Dhaka', 'Motijheel', '01713373217', 'ocmotijheel@police.gov.bd', 'Syed Shahid Alam', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(14, 'Kotwali Police Station', 'Kotwali, Chittagong-4000', 'Chittagong', 'Kotwali', '01713373218', 'ockotwali@police.gov.bd', 'Mohammad Mohsin', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(15, 'Double Mooring Police Station', 'Port Connecting Road, Chittagong-4100', 'Chittagong', 'Double Mooring', '01713373219', 'ocdoublemooring@police.gov.bd', 'Jahir Hossain', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(16, 'Panchlaish Police Station', 'O.R. Nizam Road, Chittagong-4203', 'Chittagong', 'Panchlaish', '01713373220', 'ocpanchlaish@police.gov.bd', 'Mohammad Shahidullah', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(17, 'Khulna Sadar Police Station', 'KDA Avenue, Khulna-9100', 'Khulna', 'Khulna Sadar', '01713373221', 'ockhulnasadar@police.gov.bd', 'Helal Uddin', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(18, 'Sonadanga Police Station', 'Sonadanga R/A, Khulna-9100', 'Khulna', 'Sonadanga', '01713373222', 'ocsonadanga@police.gov.bd', 'Momtazul Haque', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(19, 'Boalia Police Station', 'Shaheb Bazar, Rajshahi-6100', 'Rajshahi', 'Boalia', '01713373223', 'ocboalia@police.gov.bd', 'Nibaran Chandra Barman', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(20, 'Rajpara Police Station', 'Rajpara, Rajshahi-6100', 'Rajshahi', 'Rajpara', '01713373224', 'ocrajpara@police.gov.bd', 'Masud Parvez', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(21, 'Sylhet Kotwali Police Station', 'Kotwali, Sylhet-3100', 'Sylhet', 'Kotwali', '01713373225', 'ockotwalisylhet@police.gov.bd', 'Selim Miah', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(22, 'South Surma Police Station', 'South Surma, Sylhet-3112', 'Sylhet', 'South Surma', '01713373226', 'ocsouthsurma@police.gov.bd', 'Khaled Mojumder', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(23, 'Barisal Kotwali Police Station', 'Central Road, Barisal-8200', 'Barisal', 'Kotwali', '01713373227', 'ocktkowali@police.gov.bd', 'Shakhawat Hossain', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(24, 'Airport Police Station', 'Hazrat Shahjalal International Airport, Dhaka-1229', 'Dhaka', 'Airport', '01713373228', 'ocairport@police.gov.bd', 'Md. Ziaul Haque', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(25, 'Pahartali Police Station', 'Pahartali, Chittagong-4202', 'Chittagong', 'Pahartali', '01713373229', 'ocpahartali@police.gov.bd', 'Mohammed Mahfuzur Rahman', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(26, 'Mymensingh Kotwali Police Station', 'Main Road, Mymensingh-2200', 'Mymensingh', 'Kotwali', '01713373230', 'ocmymensingh@police.gov.bd', 'Shah Kamal Akanda', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(27, 'Rangpur Kotwali Police Station', 'Station Road, Rangpur-5400', 'Rangpur', 'Kotwali', '01713373231', 'ocrangpur@police.gov.bd', 'Abdul Kader Zilani', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(28, 'Jessore Kotwali Police Station', 'M.K. Road, Jessore-7400', 'Jessore', 'Kotwali', '01713373232', 'ocjessore@police.gov.bd', 'Touhidul Islam', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(29, 'Comilla Kotwali Police Station', 'Police Line, Comilla-3500', 'Comilla', 'Kotwali', '01713373233', 'occomilla@police.gov.bd', 'Abu Salam Miah', '2025-04-22 14:00:00', '2025-04-22 14:00:00'),
(30, 'Bogra Sadar Police Station', 'Thana Road, Bogra-5800', 'Bogra', 'Sadar', '01713373234', 'ocbogra@police.gov.bd', 'Ali Ashraf Bhuiyan', '2025-04-22 14:00:00', '2025-04-22 14:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `public`
--

CREATE TABLE `public` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `national_id` varchar(255) NOT NULL,
  `passport` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `public`
--

INSERT INTO `public` (`id`, `full_name`, `username`, `email`, `national_id`, `passport`, `mobile_no`, `password`, `address`, `created_at`, `updated_at`) VALUES
(2, 'Jarin Tasnim', 'jarin', 'jarinmoni@gmail.com', '9632587410', '321654', '01775963352', '$2b$10$CxxuwZo4yV0n5FaTZ.qSu.lcrvjixAfrAiHvpwRQjsAFTrfNmPIwi', 'Dinajpur-Birol', '2025-03-28 15:56:40', '2025-03-28 15:56:40'),
(3, 'Fahim Faysal', 'bafu', 'fahimbafu@gmail.com', '333333333', '111111', '017740711130', '$2a$10$c95S1aEnxcNDjoUbc8Y2OOv5Qu8e9oivyyTEPdJfDz4CggsneVtfW', 'Dhaka-Mirpur', '2025-04-27 21:11:49', '2025-04-27 21:11:49'),
(4, 'Mr.one', 'one', 'one@gmail.com', '5555555553', '1239999', '0177345678', '$2a$10$h6fq8658j1jhI3b1PgBSauMYUJZth9NdIAobyosFjgi.YniCMEs7m', 'Dhaka-Mirpur', '2025-04-27 21:14:17', '2025-04-27 21:14:17'),
(5, 'Mr.two', 'two', 'two@gmail.com', '5565626262', '333333', '01775692261', '$2a$10$ZvYIXk/lRR7tuLRbNRbnue0Lo/FshUYyi/U1RSA/vR59x80MAnoVG', 'Dinajpur-Birol', '2025-04-27 21:15:06', '2025-04-28 14:27:50');

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `national_id` varchar(50) NOT NULL,
  `passport` varchar(50) DEFAULT NULL,
  `mobile` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('police') DEFAULT 'police',
  `address` varchar(255) NOT NULL,
  `police_id` varchar(50) NOT NULL,
  `badge_number` varchar(50) NOT NULL,
  `rank` varchar(100) NOT NULL,
  `station` varchar(255) NOT NULL,
  `joining_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`id`, `full_name`, `username`, `email`, `national_id`, `passport`, `mobile`, `password_hash`, `role`, `address`, `police_id`, `badge_number`, `rank`, `station`, `joining_date`, `created_at`, `status`) VALUES
(3, 'Mahir Forhad', 'forhad', 'forhad@gmail.com', '3698521470', '321456', '017123416548', '$2b$10$FgBsw.UDi/ANIq8yHajTcOu4moXR4YmRb/Pc342vTWttX64NvEe9e', 'police', 'Dinajpur-Birol', '78', '69', 'SI', 'Vatara', '2025-03-05', '2025-03-26 15:59:32', 'pending'),
(4, 'Rakib', 'rakib', 'rakib@gmail.com', '36598518462616', '95665162.', '0162984161652169', '$2b$10$dio2edxO6FaJ//3VQrjdxuR9b6liNTHEEQL.x8FPlUrv8ipWB5kf6', 'police', 'Dhaka-Mirpur', '58', '36', 'RT', 'Vatara', '2025-03-12', '2025-03-27 21:00:55', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `national_id` varchar(255) NOT NULL,
  `passport` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('public','police','admin') NOT NULL DEFAULT 'public',
  `address` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `police_id` varchar(50) DEFAULT NULL,
  `station` varchar(255) DEFAULT NULL,
  `rank` varchar(100) DEFAULT NULL,
  `badge_number` varchar(50) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_code` varchar(10) DEFAULT NULL,
  `reset_code_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `username`, `email`, `national_id`, `passport`, `mobile_no`, `password`, `role`, `address`, `status`, `police_id`, `station`, `rank`, `badge_number`, `joining_date`, `created_at`, `updated_at`, `reset_code`, `reset_code_expires`) VALUES
(20, 'Fahim Faysal', 'bafu', 'fahimbafu@gmail.com', '333333333', '111111', '017740711130', '$2a$10$EJdx.IbHjkAUFUbWuE9wJ.WY.wRYFe9lLenh3I6X2lKw4hzrHEFkS', 'public', 'Dhaka-Mirpur', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-04-27 21:11:49', '2025-04-27 21:12:49', NULL, NULL),
(21, 'Mr.one', 'one', 'one@gmail.com', '5555555553', '1239999', '0177345678', '$2a$10$h6fq8658j1jhI3b1PgBSauMYUJZth9NdIAobyosFjgi.YniCMEs7m', 'public', 'Dhaka-Mirpur', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-04-27 21:14:17', '2025-04-27 21:14:17', NULL, NULL),
(22, 'Mr.two', 'two', 'two@gmail.com', '5565626262', '333333', '01775692261', '$2a$10$ZvYIXk/lRR7tuLRbNRbnue0Lo/FshUYyi/U1RSA/vR59x80MAnoVG', 'public', 'Dinajpur-Birol', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-04-27 21:15:06', '2025-04-28 14:27:50', NULL, NULL),
(24, 'admin1', 'admin', 'mfaysal223224@bscse.uiu.ac.bd', '6395959595', '1212121', '0174646464', '$2a$10$zJnE3Wpv9GHrQw/IligOGevRMvzIxYMsOp00qxqX8uaNcOYCm802C', 'admin', 'Dhaka-Mirpur', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-04-28 11:58:04', '2025-04-28 11:58:04', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `validations`
--

CREATE TABLE `validations` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_valid` tinyint(1) NOT NULL DEFAULT 0,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_national_id` (`national_id`);

--
-- Indexes for table `cases`
--
ALTER TABLE `cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_case_number` (`case_number`),
  ADD KEY `fk_case_report` (`report_id`),
  ADD KEY `fk_case_officer` (`assigned_to`),
  ADD KEY `idx_case_status` (`status`),
  ADD KEY `idx_case_priority` (`priority`);

--
-- Indexes for table `case_updates`
--
ALTER TABLE `case_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_update_case` (`case_id`),
  ADD KEY `fk_update_user` (`update_by`);

--
-- Indexes for table `crime_areas`
--
ALTER TABLE `crime_areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_area` (`district`,`thana`,`area_name`),
  ADD KEY `idx_area_district` (`district`),
  ADD KEY `idx_area_thana` (`thana`),
  ADD KEY `idx_area_risk` (`risk_level`);

--
-- Indexes for table `crime_categories`
--
ALTER TABLE `crime_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category_name` (`name`);

--
-- Indexes for table `crime_reports`
--
ALTER TABLE `crime_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_crime_category` (`category_id`);

--
-- Indexes for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_emergency_district` (`district`),
  ADD KEY `idx_emergency_type` (`service_type`);

--
-- Indexes for table `evidence`
--
ALTER TABLE `evidence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_evidence_report` (`report_id`),
  ADD KEY `fk_evidence_uploader` (`uploaded_by`),
  ADD KEY `fk_evidence_verifier` (`verified_by`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_feedback_user` (`user_id`),
  ADD KEY `fk_feedback_response` (`responded_by`),
  ADD KEY `idx_feedback_type` (`feedback_type`),
  ADD KEY `idx_feedback_rating` (`rating`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_notification` (`user_id`),
  ADD KEY `idx_notification_read` (`is_read`),
  ADD KEY `idx_notification_type` (`type`);

--
-- Indexes for table `police`
--
ALTER TABLE `police`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD UNIQUE KEY `police_id` (`police_id`),
  ADD UNIQUE KEY `badge_number` (`badge_number`),
  ADD KEY `idx_police_id` (`police_id`),
  ADD KEY `idx_badge_number` (`badge_number`),
  ADD KEY `idx_station` (`station`),
  ADD KEY `idx_rank` (`rank`),
  ADD KEY `fk_police_station` (`station_id`);

--
-- Indexes for table `police_alerts`
--
ALTER TABLE `police_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_alert_report` (`report_id`),
  ADD KEY `fk_alert_police` (`police_id`);

--
-- Indexes for table `police_stations`
--
ALTER TABLE `police_stations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_station_name` (`name`),
  ADD KEY `idx_district` (`district`),
  ADD KEY `idx_thana` (`thana`);

--
-- Indexes for table `public`
--
ALTER TABLE `public`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_national_id` (`national_id`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD UNIQUE KEY `police_id` (`police_id`),
  ADD UNIQUE KEY `badge_number` (`badge_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD UNIQUE KEY `police_id` (`police_id`),
  ADD UNIQUE KEY `badge_number` (`badge_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_police_id` (`police_id`),
  ADD KEY `idx_badge_number` (`badge_number`);

--
-- Indexes for table `validations`
--
ALTER TABLE `validations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_validation` (`report_id`,`user_id`),
  ADD KEY `fk_validation_report` (`report_id`),
  ADD KEY `fk_validation_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cases`
--
ALTER TABLE `cases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `case_updates`
--
ALTER TABLE `case_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `crime_areas`
--
ALTER TABLE `crime_areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `crime_categories`
--
ALTER TABLE `crime_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `crime_reports`
--
ALTER TABLE `crime_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `evidence`
--
ALTER TABLE `evidence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `police`
--
ALTER TABLE `police`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `police_alerts`
--
ALTER TABLE `police_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `police_stations`
--
ALTER TABLE `police_stations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `public`
--
ALTER TABLE `public`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `validations`
--
ALTER TABLE `validations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cases`
--
ALTER TABLE `cases`
  ADD CONSTRAINT `fk_case_officer` FOREIGN KEY (`assigned_to`) REFERENCES `police` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_case_report` FOREIGN KEY (`report_id`) REFERENCES `crime_reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `case_updates`
--
ALTER TABLE `case_updates`
  ADD CONSTRAINT `fk_update_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_update_user` FOREIGN KEY (`update_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `crime_reports`
--
ALTER TABLE `crime_reports`
  ADD CONSTRAINT `fk_crime_category` FOREIGN KEY (`category_id`) REFERENCES `crime_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `evidence`
--
ALTER TABLE `evidence`
  ADD CONSTRAINT `fk_evidence_report` FOREIGN KEY (`report_id`) REFERENCES `crime_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_evidence_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_evidence_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback_response` FOREIGN KEY (`responded_by`) REFERENCES `admin` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_user_notification` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `police`
--
ALTER TABLE `police`
  ADD CONSTRAINT `fk_police_station` FOREIGN KEY (`station_id`) REFERENCES `police_stations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `police_alerts`
--
ALTER TABLE `police_alerts`
  ADD CONSTRAINT `fk_alert_police` FOREIGN KEY (`police_id`) REFERENCES `police` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_alert_report` FOREIGN KEY (`report_id`) REFERENCES `crime_reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `validations`
--
ALTER TABLE `validations`
  ADD CONSTRAINT `fk_validation_report` FOREIGN KEY (`report_id`) REFERENCES `crime_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_validation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
