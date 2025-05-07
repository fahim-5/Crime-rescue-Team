-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 07, 2025 at 05:56 PM
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
-- Table structure for table `address_based_alerts`
--

CREATE TABLE `address_based_alerts` (
  `id` int(11) NOT NULL,
  `alert_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `address_based_alerts`
--

INSERT INTO `address_based_alerts` (`id`, `alert_id`, `user_id`, `created_at`) VALUES
(1, 18, 26, '2025-05-05 17:04:22'),
(2, 18, 27, '2025-05-05 17:04:22'),
(3, 18, 29, '2025-05-05 17:04:22'),
(4, 18, 30, '2025-05-05 17:04:22'),
(8, 19, 31, '2025-05-05 17:15:54'),
(9, 20, 31, '2025-05-05 17:18:59'),
(10, 21, 26, '2025-05-05 17:41:17'),
(11, 21, 27, '2025-05-05 17:41:17'),
(12, 21, 29, '2025-05-05 17:41:17'),
(13, 21, 30, '2025-05-05 17:41:17'),
(17, 22, 31, '2025-05-05 17:50:31'),
(18, 23, 31, '2025-05-05 18:23:03'),
(19, 24, 31, '2025-05-05 18:36:19'),
(20, 25, 28, '2025-05-05 19:18:34'),
(21, 26, 31, '2025-05-05 19:41:48'),
(22, 27, 26, '2025-05-05 19:43:59'),
(23, 27, 27, '2025-05-05 19:43:59'),
(24, 27, 29, '2025-05-05 19:43:59'),
(25, 27, 30, '2025-05-05 19:43:59'),
(29, 28, 26, '2025-05-05 19:45:47'),
(30, 28, 27, '2025-05-05 19:45:47'),
(31, 28, 28, '2025-05-05 19:45:47'),
(32, 28, 29, '2025-05-05 19:45:47'),
(33, 28, 30, '2025-05-05 19:45:47'),
(34, 29, 26, '2025-05-06 15:42:55'),
(35, 29, 27, '2025-05-06 15:42:55'),
(36, 29, 28, '2025-05-06 15:42:55'),
(37, 29, 29, '2025-05-06 15:42:55'),
(38, 29, 30, '2025-05-06 15:42:55'),
(41, 30, 26, '2025-05-06 16:02:28'),
(42, 30, 27, '2025-05-06 16:02:28'),
(43, 30, 28, '2025-05-06 16:02:28'),
(44, 30, 29, '2025-05-06 16:02:28'),
(45, 30, 30, '2025-05-06 16:02:28');

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
(3, 'admin1', 'admin', 'mfaysal223224@bscse.uiu.ac.bd', '6395959595', '1212121', '0174646464', '$2a$10$zJnE3Wpv9GHrQw/IligOGevRMvzIxYMsOp00qxqX8uaNcOYCm802C', 'Dhaka-Mirpur', '2025-04-28 11:58:04', '2025-04-28 11:58:04'),
(4, 'Fahim Faysal', 'fahim01', 'mfaysal@bscse.uiu.ac.bd', '5858999581', '581518181818', '01774071130', '$2a$10$WatGbgDh7I3vndEw0coecOh1NTAVJK/NoUkKaZ7lNZV2sTOEBqZRC', 'Dhaka-Mirpur', '2025-04-30 10:19:47', '2025-04-30 19:09:18');

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
(2, 2, 'Emergency Response Needed', 'Armed robbery in progress at Mirpur-10. Police units dispatched.', 'Mirpur-10, Dhaka', 'emergency', 'emergency', 'resolved', 'critical', 16, 3, 'Multiple units responding. ETA 5 minutes.', '{}', '2025-04-27 09:30:00', '2025-04-27 17:59:59', NULL, '2025-04-28 14:29:13'),
(3, 17, '', 'Theft reported in Bonna 2 area', 'Bonna 2', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-04-30 13:03:31', NULL, NULL, '2025-04-30 13:03:31'),
(4, 18, '', 'Cybercrime reported in Me Bonna is reporting. area', 'Me Bonna is reporting.', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-04-30 13:35:31', NULL, NULL, '2025-04-30 13:35:31'),
(5, 19, '', 'Robbery reported in Notun Bazar , Infonrt of Forazi Hospital area', 'Notun Bazar , Infonrt of Forazi Hospital', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-04-30 16:36:26', NULL, NULL, '2025-04-30 16:36:26'),
(6, 20, '', 'Theft reported in pavel 1001 area', 'pavel 1001', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 07:12:05', NULL, NULL, '2025-05-01 07:12:05'),
(7, 21, '', 'Theft reported in pAVEL O11 area', 'pAVEL O11', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 07:13:16', NULL, NULL, '2025-05-01 07:13:16'),
(8, 22, '', 'Theft reported in hELOLKO area', 'hELOLKO', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 07:13:43', NULL, NULL, '2025-05-01 07:13:43'),
(9, 23, '', 'Theft reported in hWLLONOSANVLO area', 'hWLLONOSANVLO', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 07:13:52', NULL, NULL, '2025-05-01 07:13:52'),
(10, 24, '', 'Theft reported in Fahim vai whre are you> area', 'Fahim vai whre are you>', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 08:33:20', NULL, NULL, '2025-05-01 08:33:20'),
(11, 25, '', 'Theft reported in hiononiv area', 'hiononiv', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 08:33:39', NULL, NULL, '2025-05-01 08:33:39'),
(12, 26, '', 'Theft reported in ononbofdlbl area', 'ononbofdlbl', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 08:33:50', NULL, NULL, '2025-05-01 08:33:50'),
(13, 27, '', 'Theft reported in Hello area', 'Hello', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 08:42:23', NULL, NULL, '2025-05-01 08:42:23'),
(14, 28, '', 'Theft reported in Me the king is reportin area', 'Me the king is reportin', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 08:42:52', NULL, NULL, '2025-05-01 08:42:52'),
(15, 29, '', 'Theft reported in pavel vai area', 'pavel vai', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 08:59:19', NULL, NULL, '2025-05-01 08:59:19'),
(16, 30, '', 'Theft reported in Hello area', 'Hello', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 09:56:20', NULL, NULL, '2025-05-01 09:56:20'),
(17, 31, '', 'Theft reported in My vai area', 'My vai', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-01 11:48:50', NULL, NULL, '2025-05-01 11:48:50'),
(18, 32, '', 'Theft reported in new report area', 'new report', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 17:04:22', NULL, NULL, '2025-05-05 17:04:22'),
(19, 33, '', 'Theft reported in Bonna2-01 area', 'Bonna2-01', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 17:15:54', NULL, NULL, '2025-05-05 17:15:54'),
(20, 34, '', 'Theft reported in Boona reporting 04 area', 'Boona reporting 04', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 17:18:59', NULL, NULL, '2025-05-05 17:18:59'),
(21, 35, '', 'Theft reported in reportin from mirpur area', 'reportin from mirpur', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 17:41:17', NULL, NULL, '2025-05-05 17:41:17'),
(22, 36, '', 'Theft reported in reporting from dinajpur 11 50 area', 'reporting from dinajpur 11 50', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 17:50:31', NULL, NULL, '2025-05-05 17:50:31'),
(23, 37, '', 'Theft reported in 12 22 area', '12 22', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 18:23:03', NULL, NULL, '2025-05-05 18:23:03'),
(24, 38, '', 'Theft reported in b2 12 36 area', 'b2 12 36', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 18:36:19', NULL, NULL, '2025-05-05 18:36:19'),
(25, 39, '', 'Theft reported in pavel is reporing from mirpur area', 'pavel is reporing from mirpur', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 19:18:34', NULL, NULL, '2025-05-05 19:18:34'),
(26, 40, '', 'Theft reported in bonaa two from dinajpur is reporing 1 41 area', 'bonaa two from dinajpur is reporing 1 41', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 19:41:48', NULL, NULL, '2025-05-05 19:41:48'),
(27, 41, '', 'Theft reported in Bonna : 1 43 area', 'Bonna : 1 43', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 19:43:59', NULL, NULL, '2025-05-05 19:43:59'),
(28, 42, '', 'Theft reported in 1 45 area', '1 45', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-05 19:45:47', NULL, NULL, '2025-05-05 19:45:47'),
(29, 43, '', 'Theft reported in Darling is reporting. area', 'Darling is reporting.', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-06 15:42:55', NULL, NULL, '2025-05-06 15:42:55'),
(30, 44, '', 'Theft reported in Dhaka Mirput reoring area', 'Dhaka Mirput reoring', '', 'warning', 'active', 'medium', 0, NULL, NULL, NULL, '2025-05-06 16:02:28', NULL, NULL, '2025-05-06 16:02:28');

--
-- Triggers `crime_alerts`
--
DELIMITER $$
CREATE TRIGGER `after_crime_alert_insert` AFTER INSERT ON `crime_alerts` FOR EACH ROW BEGIN
    -- Get the reporter's address of the crime report
    DECLARE reporter_addr VARCHAR(255);
    
    SELECT reporter_address INTO reporter_addr
    FROM crime_reports
    WHERE id = NEW.report_id;
    
    -- Insert into address_based_alerts for all users with matching address
    INSERT INTO address_based_alerts (alert_id, user_id)
    SELECT NEW.id, u.id
    FROM users u
    WHERE 
        -- Match users whose address contains the reporter's address
        -- or the reporter's address contains the user's address (flexible matching)
        (u.address LIKE CONCAT('%', reporter_addr, '%') OR
         reporter_addr LIKE CONCAT('%', u.address, '%'));
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
  `reporter_address` varchar(255) DEFAULT NULL,
  `status` enum('pending','validating','investigating','resolved','closed') NOT NULL DEFAULT 'pending',
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `crime_reports`
--

INSERT INTO `crime_reports` (`id`, `crime_id`, `location`, `time`, `crime_type`, `num_criminals`, `victim_gender`, `armed`, `photos`, `videos`, `created_at`, `reporter_id`, `reporter_address`, `status`, `category_id`) VALUES
(16, 'CR-2025-014', 'report 1 bonna', '2025-04-30 12:05:46', 'theft', 1, 'male', 'yes', '[\"photos/photos-1746014813283-929886420.png\"]', '[]', '2025-04-30 12:06:53', 30, 'Dhaka-Mirpur', 'pending', NULL),
(17, 'CR-2025-015', 'Bonna 2', '2025-04-30 13:03:22', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-04-30 13:03:31', 30, 'Dhaka-Mirpur', 'pending', NULL),
(18, 'CR-2025-016', 'Me Bonna is reporting.', '2025-04-30 13:33:56', 'cybercrime', 1898, 'female', 'no', '[\"photos/photos-1746020131298-741966194.png\"]', '[]', '2025-04-30 13:35:31', 30, 'Dhaka-Mirpur', 'pending', NULL),
(32, 'CR-2025-030', 'new report', '2025-05-05 17:04:14', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 17:04:22', 30, 'Dhaka-Mirpur', 'pending', NULL),
(33, 'CR-2025-031', 'Bonna2-01', '2025-05-05 17:15:40', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 17:15:54', 31, 'Dinajpur-Birol', 'pending', NULL),
(34, 'CR-2025-006', 'Boona reporting 04', '2025-05-05 17:18:35', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 17:18:59', 31, 'Dinajpur-Birol', 'pending', NULL),
(35, 'CR-2025-007', 'reportin from mirpur', '2025-05-05 17:41:06', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 17:41:17', 30, 'Dhaka-Mirpur', 'pending', NULL),
(36, 'CR-2025-008', 'reporting from dinajpur 11 50', '2025-05-05 17:50:14', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 17:50:31', 31, 'Dinajpur-Birol', 'pending', NULL),
(37, 'CR-2025-009', '12 22', '2025-05-05 18:22:53', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 18:23:03', 31, 'Dinajpur-Birol', 'pending', NULL),
(38, 'CR-2025-010', 'b2 12 36', '2025-05-05 18:35:52', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 18:36:19', 31, 'Dinajpur-Birol', 'pending', NULL),
(39, 'CR-2025-011', 'pavel is reporing from mirpur', '2025-05-05 19:18:20', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 19:18:34', 28, 'Dhaka Mirpur', 'pending', NULL),
(40, 'CR-2025-012', 'bonaa two from dinajpur is reporing 1 41', '2025-05-05 19:41:28', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 19:41:48', 31, 'Dinajpur-Birol', 'pending', NULL),
(41, 'CR-2025-013', 'Bonna : 1 43', '2025-05-05 19:43:40', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 19:43:59', 30, 'Dhaka-Mirpur', 'pending', NULL),
(42, 'CR-2025-014', '1 45', '2025-05-05 19:45:36', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-05 19:45:47', 30, 'Dhaka-Mirpur', 'pending', NULL),
(43, 'CR-2025-015', 'Darling is reporting.', '2025-05-06 15:42:35', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-06 15:42:55', 30, 'Dhaka-Mirpur', 'pending', NULL),
(44, 'CR-2025-016', 'Dhaka Mirput reoring', '2025-05-06 16:02:16', 'theft', 1, 'male', 'yes', '[]', '[]', '2025-05-06 16:02:28', 28, 'Dhaka-Mirpur', 'pending', NULL);

--
-- Triggers `crime_reports`
--
DELIMITER $$
CREATE TRIGGER `before_crime_report_insert` BEFORE INSERT ON `crime_reports` FOR EACH ROW BEGIN
  -- Generate crime_id if not provided
  IF NEW.crime_id IS NULL THEN
    SET NEW.crime_id = CONCAT('CR-', YEAR(CURRENT_DATE()), '-', LPAD((SELECT COUNT(*)+1 FROM `crime_reports` WHERE YEAR(created_at) = YEAR(CURRENT_DATE())), 3, '0'));
  END IF;
  
  -- Set reporter_address from users table if reporter_id is provided and reporter_address is NULL
  IF NEW.reporter_id IS NOT NULL AND (NEW.reporter_address IS NULL OR NEW.reporter_address = '') THEN
    SET NEW.reporter_address = (SELECT address FROM users WHERE id = NEW.reporter_id);
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
(52, 28, 'Report Submitted', 'Your crime report #15 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 15, '2025-04-30 11:20:28', '2025-04-30 11:20:28'),
(53, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#15) in Pavel is reporting requires immediate attention.', 'alert', 0, NULL, 15, '2025-04-30 11:20:28', '2025-04-30 11:20:28'),
(54, 30, 'Report Submitted', 'Your crime report #16 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 16, '2025-04-30 12:06:53', '2025-04-30 12:06:53'),
(55, 28, 'New Crime Report', 'A new report about theft in report 1 bonna has been submitted. Stay safe!', 'info', 0, NULL, 16, '2025-04-30 12:06:53', '2025-04-30 12:06:53'),
(56, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#16) in report 1 bonna requires immediate attention.', 'alert', 0, NULL, 16, '2025-04-30 12:06:53', '2025-04-30 12:06:53'),
(57, 30, 'Report Submitted', 'Your crime report #17 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 17, '2025-04-30 13:03:31', '2025-04-30 13:03:31'),
(58, 28, 'New Crime Report', 'A new report about theft in Bonna 2 has been submitted. Stay safe!', 'info', 0, NULL, 17, '2025-04-30 13:03:31', '2025-04-30 13:03:31'),
(59, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#17) in Bonna 2 requires immediate attention.', 'alert', 0, NULL, 17, '2025-04-30 13:03:31', '2025-04-30 13:03:31'),
(60, 30, 'Report Submitted', 'Your crime report #18 has been submitted successfully: Your report about cybercrime has been submitted successfully.', 'success', 0, NULL, 18, '2025-04-30 13:35:31', '2025-04-30 13:35:31'),
(61, 28, 'New Crime Report', 'A new report about cybercrime in Me Bonna is reporting. has been submitted. Stay safe!', 'info', 0, NULL, 18, '2025-04-30 13:35:31', '2025-04-30 13:35:31'),
(62, 28, 'Report Submitted', 'Your crime report #19 has been submitted successfully: Your report about robbery has been submitted successfully.', 'success', 0, NULL, 19, '2025-04-30 16:36:26', '2025-04-30 16:36:26'),
(63, 30, 'New Crime Report', 'A new report about robbery in Notun Bazar , Infonrt of Forazi Hospital has been submitted. Stay safe!', 'info', 0, NULL, 19, '2025-04-30 16:36:26', '2025-04-30 16:36:26'),
(64, 29, 'URGENT: High-Risk Crime Report', 'A robbery report (#19) in Notun Bazar , Infonrt of Forazi Hospital requires immediate attention.', 'alert', 0, NULL, 19, '2025-04-30 16:36:26', '2025-04-30 16:36:26'),
(65, 28, 'Report Submitted', 'Your crime report #20 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 20, '2025-05-01 07:12:05', '2025-05-01 07:12:05'),
(66, 30, 'New Crime Report', 'A new report about theft in pavel 1001 has been submitted. Stay safe!', 'info', 0, NULL, 20, '2025-05-01 07:12:05', '2025-05-01 07:12:05'),
(67, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#20) in pavel 1001 requires immediate attention.', 'alert', 0, NULL, 20, '2025-05-01 07:12:05', '2025-05-01 07:12:05'),
(68, 28, 'Report Submitted', 'Your crime report #21 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 21, '2025-05-01 07:13:16', '2025-05-01 07:13:16'),
(69, 30, 'New Crime Report', 'A new report about theft in pAVEL O11 has been submitted. Stay safe!', 'info', 0, NULL, 21, '2025-05-01 07:13:16', '2025-05-01 07:13:16'),
(70, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#21) in pAVEL O11 requires immediate attention.', 'alert', 0, NULL, 21, '2025-05-01 07:13:16', '2025-05-01 07:13:16'),
(71, 28, 'Report Submitted', 'Your crime report #22 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 22, '2025-05-01 07:13:43', '2025-05-01 07:13:43'),
(72, 30, 'New Crime Report', 'A new report about theft in hELOLKO has been submitted. Stay safe!', 'info', 0, NULL, 22, '2025-05-01 07:13:43', '2025-05-01 07:13:43'),
(73, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#22) in hELOLKO requires immediate attention.', 'alert', 0, NULL, 22, '2025-05-01 07:13:43', '2025-05-01 07:13:43'),
(74, 28, 'Report Submitted', 'Your crime report #23 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 23, '2025-05-01 07:13:52', '2025-05-01 07:13:52'),
(75, 30, 'New Crime Report', 'A new report about theft in hWLLONOSANVLO has been submitted. Stay safe!', 'info', 0, NULL, 23, '2025-05-01 07:13:52', '2025-05-01 07:13:52'),
(76, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#23) in hWLLONOSANVLO requires immediate attention.', 'alert', 0, NULL, 23, '2025-05-01 07:13:52', '2025-05-01 07:13:52'),
(77, 28, 'Report Submitted', 'Your crime report #24 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 24, '2025-05-01 08:33:20', '2025-05-01 08:33:20'),
(78, 30, 'New Crime Report', 'A new report about theft in Fahim vai whre are you> has been submitted. Stay safe!', 'info', 0, NULL, 24, '2025-05-01 08:33:20', '2025-05-01 08:33:20'),
(79, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#24) in Fahim vai whre are you> requires immediate attention.', 'alert', 0, NULL, 24, '2025-05-01 08:33:20', '2025-05-01 08:33:20'),
(80, 28, 'Report Submitted', 'Your crime report #25 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 25, '2025-05-01 08:33:39', '2025-05-01 08:33:39'),
(81, 30, 'New Crime Report', 'A new report about theft in hiononiv has been submitted. Stay safe!', 'info', 0, NULL, 25, '2025-05-01 08:33:39', '2025-05-01 08:33:39'),
(82, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#25) in hiononiv requires immediate attention.', 'alert', 0, NULL, 25, '2025-05-01 08:33:39', '2025-05-01 08:33:39'),
(83, 28, 'Report Submitted', 'Your crime report #26 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 26, '2025-05-01 08:33:50', '2025-05-01 08:33:50'),
(84, 30, 'New Crime Report', 'A new report about theft in ononbofdlbl has been submitted. Stay safe!', 'info', 0, NULL, 26, '2025-05-01 08:33:50', '2025-05-01 08:33:50'),
(85, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#26) in ononbofdlbl requires immediate attention.', 'alert', 0, NULL, 26, '2025-05-01 08:33:50', '2025-05-01 08:33:50'),
(86, 28, 'Report Submitted', 'Your crime report #27 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 27, '2025-05-01 08:42:23', '2025-05-01 08:42:23'),
(87, 30, 'New Crime Report', 'A new report about theft in Hello has been submitted. Stay safe!', 'info', 0, NULL, 27, '2025-05-01 08:42:23', '2025-05-01 08:42:23'),
(88, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#27) in Hello requires immediate attention.', 'alert', 0, NULL, 27, '2025-05-01 08:42:23', '2025-05-01 08:42:23'),
(89, 28, 'Report Submitted', 'Your crime report #28 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 28, '2025-05-01 08:42:52', '2025-05-01 08:42:52'),
(90, 30, 'New Crime Report', 'A new report about theft in Me the king is reportin has been submitted. Stay safe!', 'info', 0, NULL, 28, '2025-05-01 08:42:52', '2025-05-01 08:42:52'),
(91, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#28) in Me the king is reportin requires immediate attention.', 'alert', 0, NULL, 28, '2025-05-01 08:42:52', '2025-05-01 08:42:52'),
(93, 30, 'New Crime Report', 'A new report about theft in pavel vai has been submitted. Stay safe!', 'info', 0, NULL, 29, '2025-05-01 08:59:19', '2025-05-01 08:59:19'),
(94, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#29) in pavel vai requires immediate attention.', 'alert', 0, NULL, 29, '2025-05-01 08:59:19', '2025-05-01 08:59:19'),
(96, 30, 'New Crime Report', 'A new report about theft in Hello has been submitted. Stay safe!', 'info', 0, NULL, 30, '2025-05-01 09:56:20', '2025-05-01 09:56:20'),
(97, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#30) in Hello requires immediate attention.', 'alert', 0, NULL, 30, '2025-05-01 09:56:20', '2025-05-01 09:56:20'),
(98, 28, 'Report Submitted', 'Your crime report #31 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 31, '2025-05-01 11:48:50', '2025-05-01 11:48:50'),
(99, 30, 'New Crime Report', 'A new report about theft in My vai has been submitted. Stay safe!', 'info', 0, NULL, 31, '2025-05-01 11:48:50', '2025-05-01 11:48:50'),
(100, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#31) in My vai requires immediate attention.', 'alert', 0, NULL, 31, '2025-05-01 11:48:50', '2025-05-01 11:48:50'),
(101, 30, 'Report Submitted', 'Your crime report #32 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 32, '2025-05-05 17:04:22', '2025-05-05 17:04:22'),
(102, 28, 'New Crime Report', 'A new report about theft in new report has been submitted. Stay safe!', 'info', 0, NULL, 32, '2025-05-05 17:04:22', '2025-05-05 17:04:22'),
(103, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#32) in new report requires immediate attention.', 'alert', 0, NULL, 32, '2025-05-05 17:04:22', '2025-05-05 17:04:22'),
(104, 31, 'Report Submitted', 'Your crime report #33 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 33, '2025-05-05 17:15:54', '2025-05-05 17:15:54'),
(105, 28, 'New Crime Report', 'A new report about theft in Bonna2-01 has been submitted. Stay safe!', 'info', 0, NULL, 33, '2025-05-05 17:15:54', '2025-05-05 17:15:54'),
(106, 30, 'New Crime Report', 'A new report about theft in Bonna2-01 has been submitted. Stay safe!', 'info', 0, NULL, 33, '2025-05-05 17:15:54', '2025-05-05 17:15:54'),
(107, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#33) in Bonna2-01 requires immediate attention.', 'alert', 0, NULL, 33, '2025-05-05 17:15:54', '2025-05-05 17:15:54'),
(108, 31, 'Report Submitted', 'Your crime report #34 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 34, '2025-05-05 17:18:59', '2025-05-05 17:18:59'),
(109, 28, 'New Crime Report', 'A new report about theft in Boona reporting 04 has been submitted. Stay safe!', 'info', 0, NULL, 34, '2025-05-05 17:18:59', '2025-05-05 17:18:59'),
(110, 30, 'New Crime Report', 'A new report about theft in Boona reporting 04 has been submitted. Stay safe!', 'info', 0, NULL, 34, '2025-05-05 17:18:59', '2025-05-05 17:18:59'),
(111, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#34) in Boona reporting 04 requires immediate attention.', 'alert', 0, NULL, 34, '2025-05-05 17:18:59', '2025-05-05 17:18:59'),
(112, 30, 'Report Submitted', 'Your crime report #35 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 35, '2025-05-05 17:41:17', '2025-05-05 17:41:17'),
(113, 28, 'New Crime Report', 'A new report about theft in reportin from mirpur has been submitted. Stay safe!', 'info', 0, NULL, 35, '2025-05-05 17:41:17', '2025-05-05 17:41:17'),
(114, 31, 'New Crime Report', 'A new report about theft in reportin from mirpur has been submitted. Stay safe!', 'info', 0, NULL, 35, '2025-05-05 17:41:17', '2025-05-05 17:41:17'),
(115, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#35) in reportin from mirpur requires immediate attention.', 'alert', 0, NULL, 35, '2025-05-05 17:41:17', '2025-05-05 17:41:17'),
(116, 31, 'Report Submitted', 'Your crime report #36 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 36, '2025-05-05 17:50:31', '2025-05-05 17:50:31'),
(117, 28, 'New Crime Report', 'A new report about theft in reporting from dinajpur 11 50 has been submitted. Stay safe!', 'info', 0, NULL, 36, '2025-05-05 17:50:31', '2025-05-05 17:50:31'),
(118, 30, 'New Crime Report', 'A new report about theft in reporting from dinajpur 11 50 has been submitted. Stay safe!', 'info', 0, NULL, 36, '2025-05-05 17:50:31', '2025-05-05 17:50:31'),
(119, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#36) in reporting from dinajpur 11 50 requires immediate attention.', 'alert', 0, NULL, 36, '2025-05-05 17:50:31', '2025-05-05 17:50:31'),
(120, 31, 'Report Submitted', 'Your crime report #37 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 37, '2025-05-05 18:23:03', '2025-05-05 18:23:03'),
(121, 28, 'New Crime Report', 'A new report about theft in 12 22 has been submitted. Stay safe!', 'info', 0, NULL, 37, '2025-05-05 18:23:03', '2025-05-05 18:23:03'),
(122, 30, 'New Crime Report', 'A new report about theft in 12 22 has been submitted. Stay safe!', 'info', 0, NULL, 37, '2025-05-05 18:23:03', '2025-05-05 18:23:03'),
(123, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#37) in 12 22 requires immediate attention.', 'alert', 0, NULL, 37, '2025-05-05 18:23:03', '2025-05-05 18:23:03'),
(124, 31, 'Report Submitted', 'Your crime report #38 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 38, '2025-05-05 18:36:19', '2025-05-05 18:36:19'),
(125, 28, 'New Crime Report', 'A new report about theft in b2 12 36 has been submitted. Stay safe!', 'info', 0, NULL, 38, '2025-05-05 18:36:19', '2025-05-05 18:36:19'),
(126, 30, 'New Crime Report', 'A new report about theft in b2 12 36 has been submitted. Stay safe!', 'info', 0, NULL, 38, '2025-05-05 18:36:19', '2025-05-05 18:36:19'),
(127, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#38) in b2 12 36 requires immediate attention.', 'alert', 0, NULL, 38, '2025-05-05 18:36:19', '2025-05-05 18:36:19'),
(128, 28, 'Report Submitted', 'Your crime report #39 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 39, '2025-05-05 19:18:34', '2025-05-05 19:18:34'),
(129, 30, 'New Crime Report', 'A new report about theft in pavel is reporing from mirpur has been submitted. Stay safe!', 'info', 0, NULL, 39, '2025-05-05 19:18:34', '2025-05-05 19:18:34'),
(130, 31, 'New Crime Report', 'A new report about theft in pavel is reporing from mirpur has been submitted. Stay safe!', 'info', 0, NULL, 39, '2025-05-05 19:18:34', '2025-05-05 19:18:34'),
(131, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#39) in pavel is reporing from mirpur requires immediate attention.', 'alert', 0, NULL, 39, '2025-05-05 19:18:34', '2025-05-05 19:18:34'),
(132, 31, 'Report Submitted', 'Your crime report #40 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 1, NULL, 40, '2025-05-05 19:41:48', '2025-05-05 19:42:17'),
(133, 28, 'New Crime Report', 'A new report about theft in bonaa two from dinajpur is reporing 1 41 has been submitted. Stay safe!', 'info', 0, NULL, 40, '2025-05-05 19:41:48', '2025-05-05 19:41:48'),
(134, 30, 'New Crime Report', 'A new report about theft in bonaa two from dinajpur is reporing 1 41 has been submitted. Stay safe!', 'info', 0, NULL, 40, '2025-05-05 19:41:48', '2025-05-05 19:41:48'),
(135, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#40) in bonaa two from dinajpur is reporing 1 41 requires immediate attention.', 'alert', 0, NULL, 40, '2025-05-05 19:41:48', '2025-05-05 19:41:48'),
(136, 30, 'Report Submitted', 'Your crime report #41 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 41, '2025-05-05 19:43:59', '2025-05-05 19:43:59'),
(137, 28, 'New Crime Report', 'A new report about theft in Bonna : 1 43 has been submitted. Stay safe!', 'info', 0, NULL, 41, '2025-05-05 19:43:59', '2025-05-05 19:43:59'),
(138, 31, 'New Crime Report', 'A new report about theft in Bonna : 1 43 has been submitted. Stay safe!', 'info', 0, NULL, 41, '2025-05-05 19:43:59', '2025-05-05 19:43:59'),
(139, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#41) in Bonna : 1 43 requires immediate attention.', 'alert', 0, NULL, 41, '2025-05-05 19:43:59', '2025-05-05 19:43:59'),
(140, 30, 'Report Submitted', 'Your crime report #42 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 42, '2025-05-05 19:45:48', '2025-05-05 19:45:48'),
(141, 28, 'New Crime Report', 'A new report about theft in 1 45 has been submitted. Stay safe!', 'info', 0, NULL, 42, '2025-05-05 19:45:48', '2025-05-05 19:45:48'),
(142, 31, 'New Crime Report', 'A new report about theft in 1 45 has been submitted. Stay safe!', 'info', 0, NULL, 42, '2025-05-05 19:45:48', '2025-05-05 19:45:48'),
(143, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#42) in 1 45 requires immediate attention.', 'alert', 0, NULL, 42, '2025-05-05 19:45:48', '2025-05-05 19:45:48'),
(144, 30, 'Report Submitted', 'Your crime report #43 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 43, '2025-05-06 15:42:55', '2025-05-06 15:42:55'),
(145, 28, 'New Crime Report', 'A new report about theft in Darling is reporting. has been submitted. Stay safe!', 'info', 0, NULL, 43, '2025-05-06 15:42:55', '2025-05-06 15:42:55'),
(146, 31, 'New Crime Report', 'A new report about theft in Darling is reporting. has been submitted. Stay safe!', 'info', 0, NULL, 43, '2025-05-06 15:42:55', '2025-05-06 15:42:55'),
(147, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#43) in Darling is reporting. requires immediate attention.', 'alert', 0, NULL, 43, '2025-05-06 15:42:55', '2025-05-06 15:42:55'),
(148, 28, 'Report Submitted', 'Your crime report #44 has been submitted successfully: Your report about theft has been submitted successfully.', 'success', 0, NULL, 44, '2025-05-06 16:02:28', '2025-05-06 16:02:28'),
(149, 30, 'New Crime Report', 'A new report about theft in Dhaka Mirput reoring has been submitted. Stay safe!', 'info', 0, NULL, 44, '2025-05-06 16:02:28', '2025-05-06 16:02:28'),
(150, 31, 'New Crime Report', 'A new report about theft in Dhaka Mirput reoring has been submitted. Stay safe!', 'info', 0, NULL, 44, '2025-05-06 16:02:28', '2025-05-06 16:02:28'),
(151, 29, 'URGENT: High-Risk Crime Report', 'A ARMED theft report (#44) in Dhaka Mirput reoring requires immediate attention.', 'alert', 0, NULL, 44, '2025-05-06 16:02:28', '2025-05-06 16:02:28'),
(152, 28, 'Report Updated', 'Your crime report #44 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 44, '2025-05-07 14:22:59', '2025-05-07 14:22:59'),
(153, 28, 'Report Updated', 'Your crime report #44 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 44, '2025-05-07 14:30:03', '2025-05-07 14:30:03'),
(154, 28, 'Report Updated', 'Your crime report #44 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 44, '2025-05-07 14:35:22', '2025-05-07 14:35:22'),
(155, 28, 'Report Updated', 'Your crime report #44 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 44, '2025-05-07 14:35:28', '2025-05-07 14:35:28'),
(156, 30, 'Report Updated', 'Your crime report #43 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 43, '2025-05-07 14:35:33', '2025-05-07 14:35:33'),
(157, 28, 'Report Updated', 'Your crime report #44 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 44, '2025-05-07 14:36:02', '2025-05-07 14:36:02'),
(158, 28, 'Report Updated', 'Your crime report #44 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 44, '2025-05-07 14:40:36', '2025-05-07 14:40:36'),
(159, 28, 'Report Updated', 'Your crime report #44 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 44, '2025-05-07 14:40:48', '2025-05-07 14:40:48'),
(160, 28, 'Report Updated', 'Your crime report #44 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 44, '2025-05-07 14:40:53', '2025-05-07 14:40:53'),
(161, 28, 'Report Updated', 'Your crime report #44 has been updated: A community member has confirmed your report.', 'info', 0, NULL, 44, '2025-05-07 15:48:40', '2025-05-07 15:48:40');

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
(6, 'rakin', 'rakib', 'rakib@gmail.com', '4569332154', NULL, '01774071126', '$2b$10$T/owIsT.zn8mofsylmgTXOy8wad2.Ysugad8mhIRRGx4KwOjk9Fk6', 'dhaka-bangladesh', '78', 'cazcxzcvcx', 'acas', 'fg', '2025-04-26', '2025-04-21 16:15:22', '2025-04-21 16:15:22', 4),
(9, 'police-3', 'plc3', 'police3@gmail.com', '15951595159', '55555500', '01774073356', '$2a$10$CAVpF2f3u58VR2lJ5H9o4e55DK8NqRsov4aXetnzSe6/PfFXTw92S', 'Dhaka-vatar', '3695', 'Dhaka-Mirpur', 'ASP', '56-U', '2025-04-18', '2025-04-28 18:58:16', '2025-05-06 16:07:24', NULL),
(10, 'five', 'five', 'police5@gmail.com', '696969696969', '2598525852', '017594995959', '$2a$10$ZcVIpXO1tY2DUw4RUM9ojuSmhRqMEXF94M4a4t.JZp587kfp7ZgC6', 'Dhaka-Mirpur', 'POI-1001', 'Vatara', 'DECS', '7989', '2025-04-19', '2025-04-29 11:09:26', '2025-04-29 11:09:26', NULL);

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
(14, 16, NULL, 'pending', NULL, '2025-04-30 12:06:53', NULL, '2025-04-30 12:06:53'),
(15, 17, NULL, 'pending', NULL, '2025-04-30 13:03:31', NULL, '2025-04-30 13:03:31'),
(28, 32, NULL, 'pending', NULL, '2025-05-05 17:04:22', NULL, '2025-05-05 17:04:22'),
(29, 33, NULL, 'pending', NULL, '2025-05-05 17:15:54', NULL, '2025-05-05 17:15:54'),
(30, 34, NULL, 'pending', NULL, '2025-05-05 17:18:59', NULL, '2025-05-05 17:18:59'),
(31, 35, NULL, 'pending', NULL, '2025-05-05 17:41:17', NULL, '2025-05-05 17:41:17'),
(32, 36, NULL, 'pending', NULL, '2025-05-05 17:50:31', NULL, '2025-05-05 17:50:31'),
(33, 37, NULL, 'pending', NULL, '2025-05-05 18:23:03', NULL, '2025-05-05 18:23:03'),
(34, 38, NULL, 'pending', NULL, '2025-05-05 18:36:19', NULL, '2025-05-05 18:36:19'),
(35, 39, NULL, 'pending', NULL, '2025-05-05 19:18:34', NULL, '2025-05-05 19:18:34'),
(36, 40, NULL, 'pending', NULL, '2025-05-05 19:41:48', NULL, '2025-05-05 19:41:48'),
(37, 41, NULL, 'pending', NULL, '2025-05-05 19:43:59', NULL, '2025-05-05 19:43:59'),
(38, 42, NULL, 'pending', NULL, '2025-05-05 19:45:47', NULL, '2025-05-05 19:45:47'),
(39, 43, NULL, 'pending', NULL, '2025-05-06 15:42:55', NULL, '2025-05-06 15:42:55'),
(40, 44, NULL, 'pending', NULL, '2025-05-06 16:02:28', NULL, '2025-05-06 16:02:28');

-- --------------------------------------------------------

--
-- Table structure for table `police_files`
--

CREATE TABLE `police_files` (
  `id` int(11) NOT NULL,
  `police_id` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `badge_number` varchar(20) NOT NULL,
  `station` varchar(100) NOT NULL,
  `rank` varchar(50) NOT NULL,
  `joining_date` date NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive','suspended','retired') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `police_files`
--

INSERT INTO `police_files` (`id`, `police_id`, `full_name`, `badge_number`, `station`, `rank`, `joining_date`, `contact_number`, `email`, `status`, `created_at`, `updated_at`) VALUES
(1, 'POL-10001', 'John Smith', 'B-1001', 'Central Police Station', 'Inspector', '2010-05-15', '555-1234', 'john.smith@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(2, 'POL-10002', 'Sarah Johnson', 'B-1002', 'Northern District', 'Sergeant', '2012-08-20', '555-2345', 'sarah.j@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(3, 'POL-10003', 'Michael Williams', 'B-1003', 'Southern Precinct', 'Lieutenant', '2008-04-10', '555-3456', 'mwilliams@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(4, 'POL-10004', 'Jessica Brown', 'B-1004', 'Eastern Division', 'Constable', '2015-11-05', '555-4567', 'jessica.b@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(5, 'POL-10005', 'David Miller', 'B-1005', 'Western District', 'Deputy Inspector', '2009-01-25', '555-5678', 'd.miller@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(6, 'POL-10006', 'Jennifer Davis', 'B-1006', 'Central Police Station', 'Constable', '2017-07-14', '555-6789', 'j.davis@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(7, 'POL-10007', 'Robert Wilson', 'B-1007', 'Northern District', 'Inspector', '2011-06-30', '555-7890', 'rwilson@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(8, 'POL-10008', 'Lisa Anderson', 'B-1008', 'Southern Precinct', 'Sergeant', '2013-09-12', '555-8901', 'lisa.a@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(9, 'POL-10009', 'Thomas Taylor', 'B-1009', 'Eastern Division', 'Constable', '2016-02-28', '555-9012', 't.taylor@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(10, 'POL-10010', 'Rebecca Moore', 'B-1010', 'Western District', 'Inspector', '2010-12-08', '555-0123', 'rebecca.m@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(11, 'POL-10011', 'Christopher Jackson', 'B-1011', 'Central Police Station', 'Sergeant', '2014-05-17', '555-1234', 'chris.j@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(12, 'POL-10012', 'Amanda White', 'B-1012', 'Northern District', 'Lieutenant', '2011-08-23', '555-2345', 'a.white@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(13, 'POL-10013', 'Daniel Harris', 'B-1013', 'Southern Precinct', 'Constable', '2018-01-15', '555-3456', 'd.harris@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(14, 'POL-10014', 'Michelle Martin', 'B-1014', 'Eastern Division', 'Deputy Inspector', '2012-10-09', '555-4567', 'michelle.m@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(15, 'POL-10015', 'Matthew Thompson', 'B-1015', 'Western District', 'Inspector', '2009-07-21', '555-5678', 'm.thompson@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(16, 'POL-10016', 'Elizabeth Garcia', 'B-1016', 'Central Police Station', 'Constable', '2019-03-02', '555-6789', 'e.garcia@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(17, 'POL-10017', 'Brandon Martinez', 'B-1017', 'Northern District', 'Sergeant', '2013-12-14', '555-7890', 'b.martinez@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(18, 'POL-10018', 'Stephanie Robinson', 'B-1018', 'Southern Precinct', 'Lieutenant', '2010-09-05', '555-8901', 's.robinson@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(19, 'POL-10019', 'Kevin Clark', 'B-1019', 'Eastern Division', 'Constable', '2017-05-30', '555-9012', 'k.clark@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(20, 'POL-10020', 'Laura Rodriguez', 'B-1020', 'Western District', 'Inspector', '2011-02-18', '555-0123', 'laura.r@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(21, 'POL-10021', 'Steven Lewis', 'B-1021', 'Central Police Station', 'Sergeant', '2015-08-07', '555-1234', 's.lewis@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(22, 'POL-10022', 'Nicole Lee', 'B-1022', 'Northern District', 'Constable', '2018-11-19', '555-2345', 'nicole.l@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(23, 'POL-10023', 'Mark Walker', 'B-1023', 'Southern Precinct', 'Deputy Inspector', '2012-04-23', '555-3456', 'm.walker@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(24, 'POL-10024', 'Emily Hall', 'B-1024', 'Eastern Division', 'Lieutenant', '2009-10-16', '555-4567', 'e.hall@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(25, 'POL-10025', 'Joshua Allen', 'B-1025', 'Western District', 'Constable', '2016-06-08', '555-5678', 'j.allen@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(26, 'POL-10026', 'Catherine Young', 'B-1026', 'Central Police Station', 'Inspector', '2013-01-31', '555-6789', 'c.young@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(27, 'POL-10027', 'Brian King', 'B-1027', 'Northern District', 'Sergeant', '2010-11-22', '555-7890', 'b.king@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(28, 'POL-10028', 'Melissa Wright', 'B-1028', 'Southern Precinct', 'Constable', '2019-07-13', '555-8901', 'm.wright@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(29, 'POL-10029', 'Jonathan Scott', 'B-1029', 'Eastern Division', 'Lieutenant', '2014-09-05', '555-9012', 'j.scott@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(30, 'POL-10030', 'Rachel Green', 'B-1030', 'Western District', 'Inspector', '2011-05-28', '555-0123', 'r.green@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(31, 'POL-10031', 'Patrick Adams', 'B-1031', 'Central Police Station', 'Constable', '2017-12-09', '555-1234', 'p.adams@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(32, 'POL-10032', 'Christine Baker', 'B-1032', 'Northern District', 'Deputy Inspector', '2012-02-14', '555-2345', 'c.baker@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(33, 'POL-10033', 'Gregory Gonzalez', 'B-1033', 'Southern Precinct', 'Sergeant', '2008-08-17', '555-3456', 'g.gonzalez@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(34, 'POL-10034', 'Tiffany Nelson', 'B-1034', 'Eastern Division', 'Constable', '2015-04-03', '555-4567', 't.nelson@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(35, 'POL-10035', 'Adam Carter', 'B-1035', 'Western District', 'Lieutenant', '2013-10-25', '555-5678', 'a.carter@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(36, 'POL-10036', 'Natalie Mitchell', 'B-1036', 'Central Police Station', 'Inspector', '2010-03-11', '555-6789', 'n.mitchell@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(37, 'POL-10037', 'Justin Perez', 'B-1037', 'Northern District', 'Constable', '2018-06-20', '555-7890', 'j.perez@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(38, 'POL-10038', 'Kimberly Roberts', 'B-1038', 'Southern Precinct', 'Sergeant', '2014-12-05', '555-8901', 'k.roberts@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(39, 'POL-10039', 'Brandon Turner', 'B-1039', 'Eastern Division', 'Deputy Inspector', '2011-09-19', '555-9012', 'b.turner@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(40, 'POL-10040', 'Olivia Phillips', 'B-1040', 'Western District', 'Constable', '2016-04-28', '555-0123', 'o.phillips@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(41, 'POL-10041', 'Ethan Campbell', 'B-1041', 'Central Police Station', 'Lieutenant', '2012-07-12', '555-1234', 'e.campbell@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(42, 'POL-10042', 'Hannah Parker', 'B-1042', 'Northern District', 'Inspector', '2009-11-30', '555-2345', 'h.parker@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(43, 'POL-10043', 'Ryan Evans', 'B-1043', 'Southern Precinct', 'Constable', '2017-02-14', '555-3456', 'r.evans@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(44, 'POL-10044', 'Megan Edwards', 'B-1044', 'Eastern Division', 'Sergeant', '2013-05-24', '555-4567', 'm.edwards@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(45, 'POL-10045', 'Jacob Collins', 'B-1045', 'Western District', 'Lieutenant', '2010-08-09', '555-5678', 'j.collins@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(46, 'POL-10046', 'Victoria Stewart', 'B-1046', 'Central Police Station', 'Constable', '2015-01-15', '555-6789', 'v.stewart@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(47, 'POL-10047', 'Andrew Morris', 'B-1047', 'Northern District', 'Deputy Inspector', '2012-06-27', '555-7890', 'a.morris@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(48, 'POL-10048', 'Samantha Rogers', 'B-1048', 'Southern Precinct', 'Inspector', '2008-12-11', '555-8901', 's.rogers@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(49, 'POL-10049', 'Tyler Reed', 'B-1049', 'Eastern Division', 'Constable', '2019-04-06', '555-9012', 't.reed@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41'),
(50, 'POL-10050', 'Lauren Cook', 'B-1050', 'Western District', 'Sergeant', '2014-10-22', '555-0123', 'l.cook@police.gov', 'active', '2025-04-28 19:33:41', '2025-04-28 19:33:41');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `points` int(11) DEFAULT 0,
  `user_level` varchar(50) DEFAULT 'Bronze'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `public`
--

INSERT INTO `public` (`id`, `full_name`, `username`, `email`, `national_id`, `passport`, `mobile_no`, `password`, `address`, `created_at`, `updated_at`, `points`, `user_level`) VALUES
(2, 'Jarin Tasnim', 'jarin', 'jarinmoni@gmail.com', '9632587410', '321654', '01775963352', '$2b$10$CxxuwZo4yV0n5FaTZ.qSu.lcrvjixAfrAiHvpwRQjsAFTrfNmPIwi', 'Dinajpur-Birol', '2025-03-28 15:56:40', '2025-03-28 15:56:40', 0, 'Bronze'),
(4, 'Mr.one', 'one', 'one@gmail.com', '5555555553', '1239999', '0177345678', '$2a$10$h6fq8658j1jhI3b1PgBSauMYUJZth9NdIAobyosFjgi.YniCMEs7m', 'Dhaka-Mirpur', '2025-04-27 21:14:17', '2025-04-27 21:14:17', 0, 'Bronze'),
(5, 'Mr.two', 'two', 'two@gmail.com', '5565626262', '333333', '01775692261', '$2a$10$ZvYIXk/lRR7tuLRbNRbnue0Lo/FshUYyi/U1RSA/vR59x80MAnoVG', 'Dinajpur-Birol', '2025-04-27 21:15:06', '2025-04-28 14:27:50', 0, 'Bronze'),
(6, 'md:pavel', 'pavel12', 'pavel@gmail.com', '213', '42529529592', '01746467979', '$2a$10$oHnxgP147ubzoXo3drhC3ONge.yJc9W/EDdS6VvZk0STVDHnWCpli', 'Dhaka-Mirpur', '2025-04-30 09:16:17', '2025-05-06 15:45:52', 0, 'Bronze'),
(7, 'Bonna Darling', 'bonna1', 'bonna1@gmail.com', '311664615', '54643542350', '01754466112', '$2a$10$9AZ31SqoOBfC49M/7NTRCe.7ReherfNFEn6RT0gOyB8ahiF.46r/S', 'Dhaka-Mirpur', '2025-04-30 12:05:09', '2025-05-06 10:26:32', 0, 'Bronze'),
(8, 'bonna5 to 4', 'bonna2', 'bonna2@gmail.com', '9999999999', '598598598', '01775692264', '$2a$10$XGV1RweUgHrgU.GHUTZTH.2QsABV8rx3jGoRaz0/BhRRnnw85wpAq', 'Dinajpur-Birol', '2025-05-05 17:09:42', '2025-05-06 15:50:40', 0, 'Bronze');

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
  `reset_code_expires` datetime DEFAULT NULL,
  `points` int(11) DEFAULT 0,
  `user_level` varchar(50) DEFAULT 'Bronze'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `username`, `email`, `national_id`, `passport`, `mobile_no`, `password`, `role`, `address`, `status`, `police_id`, `station`, `rank`, `badge_number`, `joining_date`, `created_at`, `updated_at`, `reset_code`, `reset_code_expires`, `points`, `user_level`) VALUES
(26, 'police-3', 'plc3', 'police3@gmail.com', '15951595159', '55555500', '01774073356', '$2a$10$CAVpF2f3u58VR2lJ5H9o4e55DK8NqRsov4aXetnzSe6/PfFXTw92S', 'police', 'Dhaka-vatar', 'approved', '3695', 'Dhaka-Mirpur', 'ASP', '56-U', '2025-04-18', '2025-04-28 18:58:16', '2025-05-06 16:07:24', NULL, NULL, 0, 'Bronze'),
(27, 'five', 'five', 'police5@gmail.com', '696969696969', '2598525852', '017594995959', '$2a$10$ZcVIpXO1tY2DUw4RUM9ojuSmhRqMEXF94M4a4t.JZp587kfp7ZgC6', 'police', 'Dhaka-Mirpur', 'pending', 'POI-1001', 'Vatara', 'DECS', '7989', '2025-04-19', '2025-04-29 11:09:26', '2025-04-29 11:09:26', NULL, NULL, 0, 'Bronze'),
(28, 'md:pavel', 'pavel12', 'pavel@gmail.com', '213', '42529529592', '01746467979', '$2a$10$oHnxgP147ubzoXo3drhC3ONge.yJc9W/EDdS6VvZk0STVDHnWCpli', 'public', 'Dhaka-Mirpur', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-04-30 09:16:17', '2025-05-06 15:45:52', NULL, NULL, 0, 'Bronze'),
(29, 'Fahim Faysal', 'fahim01', 'mfaysal@bscse.uiu.ac.bd', '5858999581', '581518181818', '01774071130', '$2a$10$WatGbgDh7I3vndEw0coecOh1NTAVJK/NoUkKaZ7lNZV2sTOEBqZRC', 'admin', 'Dhaka-Mirpur', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-04-30 10:19:47', '2025-04-30 19:09:18', NULL, NULL, 0, 'Bronze'),
(30, 'Bonna Darling', 'bonna1', 'bonna1@gmail.com', '311664615', '54643542350', '01754466112', '$2a$10$9AZ31SqoOBfC49M/7NTRCe.7ReherfNFEn6RT0gOyB8ahiF.46r/S', 'public', 'Dhaka-Mirpur', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-04-30 12:05:09', '2025-05-06 10:26:32', NULL, NULL, 0, 'Bronze'),
(31, 'bonna5 to 4', 'bonna2', 'bonna2@gmail.com', '9999999999', '598598598', '01775692264', '$2a$10$XGV1RweUgHrgU.GHUTZTH.2QsABV8rx3jGoRaz0/BhRRnnw85wpAq', 'public', 'Dinajpur-Birol', 'approved', NULL, NULL, NULL, NULL, NULL, '2025-05-05 17:09:42', '2025-05-06 15:50:40', NULL, NULL, 0, 'Bronze');

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
-- Dumping data for table `validations`
--

INSERT INTO `validations` (`id`, `report_id`, `user_id`, `is_valid`, `comment`, `created_at`, `updated_at`) VALUES
(1, 44, 26, 1, NULL, '2025-05-07 14:22:59', '2025-05-07 15:48:40'),
(2, 44, 28, 1, NULL, '2025-05-07 14:30:03', '2025-05-07 14:35:28'),
(3, 43, 28, 1, NULL, '2025-05-07 14:35:33', '2025-05-07 14:35:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `address_based_alerts`
--
ALTER TABLE `address_based_alerts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_alert` (`alert_id`,`user_id`),
  ADD KEY `fk_address_alert_id` (`alert_id`),
  ADD KEY `fk_address_user_id` (`user_id`);

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
-- Indexes for table `crime_alerts`
--
ALTER TABLE `crime_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_alert_report` (`report_id`),
  ADD KEY `fk_alert_created_by` (`created_by`),
  ADD KEY `fk_alert_assigned_to` (`assigned_to`);

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
-- Indexes for table `police_files`
--
ALTER TABLE `police_files`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `police_id` (`police_id`);

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
-- AUTO_INCREMENT for table `address_based_alerts`
--
ALTER TABLE `address_based_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- AUTO_INCREMENT for table `crime_alerts`
--
ALTER TABLE `crime_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT for table `police`
--
ALTER TABLE `police`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `police_alerts`
--
ALTER TABLE `police_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `police_files`
--
ALTER TABLE `police_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `police_stations`
--
ALTER TABLE `police_stations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `public`
--
ALTER TABLE `public`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `validations`
--
ALTER TABLE `validations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `address_based_alerts`
--
ALTER TABLE `address_based_alerts`
  ADD CONSTRAINT `fk_address_alert_id` FOREIGN KEY (`alert_id`) REFERENCES `crime_alerts` (`id`) ON DELETE CASCADE;

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
