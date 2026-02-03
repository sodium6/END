-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 04, 2025 at 05:24 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rmutk`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `user_id`, `name`, `type`, `start_date`, `end_date`, `description`, `created_at`) VALUES
(4, 3, 'Test', 'แข่งขันกีฬา', '2025-09-15', '2025-09-19', 'Test', '2025-09-20 06:20:19'),
(5, 3, 'Test2', 'กิจกรรมอาสาสมัคร', '2025-09-18', '2025-09-21', NULL, '2025-09-20 06:23:44');

-- --------------------------------------------------------

--
-- Table structure for table `activity_upload`
--

CREATE TABLE `activity_upload` (
  `id` int NOT NULL,
  `activity_id` int NOT NULL,
  `user_id` int NOT NULL,
  `image_path` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_upload`
--

INSERT INTO `activity_upload` (`id`, `activity_id`, `user_id`, `image_path`) VALUES
(10, 4, 3, '/uploads/portfolio_image/S__19800114_20251001154820960.jpg'),
(11, 4, 3, '/uploads/portfolio_image/logoo_20251002050652643.png');

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` int UNSIGNED NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('superadmin','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'admin',
  `status` enum('active','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`admin_id`, `username`, `email`, `password_hash`, `full_name`, `role`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'superadmin', 'superadmin@example.com', '$2b$10$inAv/T7pr9zZ3QBF8py.j.raqiyuezRy0j3imGlyo3N7Q5i17P43C', 'System Super Admin', 'superadmin', 'active', NULL, '2025-09-29 15:55:38', '2025-10-04 17:05:19'),
(2, 'admin', 'admin@example.com', '$2b$10$1PHO7s63Uo8aZZ/D9ZM7BuEAhQmyZQkpMTSWTpWz9/YicEuRqvyNy', 'Content Administrator', 'admin', 'active', '2025-10-04 17:19:52', '2025-09-29 15:55:38', '2025-10-04 17:19:52');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `cer_id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`cer_id`, `user_id`, `title`, `description`, `file_url`, `create_at`) VALUES
(2, 3, 'T', '', '/uploads/certificates/1759380811234-f6c5b90oq8j.jpg', '2025-10-02 04:53:31'),
(3, 3, 'Tt', '', '/uploads/certificates/1759381471812-f69jottyoqv.jpg', '2025-10-02 05:04:31'),
(4, 3, 'ธ', '', '/uploads/certificates/1759381693013-lykbvfezvzh.png', '2025-10-02 05:08:13'),
(5, 3, 'ธ', 'T', '/uploads/certificates/1759381999357-pu8wujpr2jf.png', '2025-10-02 05:09:47');

-- --------------------------------------------------------

--
-- Table structure for table `email_broadcasts`
--

CREATE TABLE `email_broadcasts` (
  `broadcast_id` int UNSIGNED NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `audience` enum('all','custom') COLLATE utf8mb4_unicode_ci DEFAULT 'all',
  `recipients_json` longtext COLLATE utf8mb4_unicode_ci,
  `recipient_count` int UNSIGNED DEFAULT '0',
  `status` enum('pending','sent','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_by` int UNSIGNED DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `file_upload`
--

CREATE TABLE `file_upload` (
  `id` int NOT NULL,
  `wk_id` int NOT NULL,
  `user_id` int NOT NULL,
  `file_path` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `file_upload`
--

INSERT INTO `file_upload` (`id`, `wk_id`, `user_id`, `file_path`) VALUES
(14, 3, 3, '/uploads/portfolio_image/รูปภาพ1_20250920102030118.png'),
(17, 2, 3, '/uploads/portfolio_image/สนเน_20250927075950209.png'),
(18, 4, 3, '/uploads/portfolio_image/รูปภาพ1_20250930153013137.png');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `news_id` int UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` int UNSIGNED NOT NULL,
  `status` enum('draft','published') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `featured_image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`news_id`, `title`, `content`, `admin_id`, `status`, `category`, `featured_image_url`, `created_at`, `updated_at`) VALUES
(2, '[แจ้งเตือนความปลอดภัย]', '[แจ้งเตือนความปลอดภัย] โปรดระวังลิงก์แปลกในการรับอีเมล\r\n\r\nเรียนผู้รับข่าวสาร,\r\nโปรดระมัดระวังลิงก์ในอีเมล โดยเฉพาะลิงก์น่าสงสัยหรือจากผู้ส่งที่ไม่คุ้นเคย\r\nแนวทางก่อนคลิกลิงก์:\r\n- วางเมาส์บนลิงก์เพื่อดู URL จริง\r\n- ตรวจสอบโดเมนให้ถูกต้องและเป็น HTTPS\r\n- หลีกเลี่ยงการดาวน์โหลดไฟล์แนบจากต้นทางที่ไม่รู้จัก\r\n- อย่าให้ข้อมูลพาสเวิร์ด/OTP เมื่อถูกเร่งรัด\r\n\r\nลิงก์ทดสอบ:\r\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1\r\n\r\nหากพบอีเมลที่น่าสงสัย กรุณาอย่าคลิกลิงก์/ไฟล์แนบ และแจ้งทีมงานทันที\r\n(อีเมลฉบับนี้ใช้เพื่อทดสอบระบบ)\r\n', 2, 'published', 'news', '/uploads/news/1759222626180-90865--.png', '2025-09-30 08:57:06', '2025-10-01 08:46:57'),
(3, 'Test', 'test', 2, 'published', 'announcement', NULL, '2025-09-30 15:36:36', '2025-09-30 16:50:06');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscriptions`
--

CREATE TABLE `newsletter_subscriptions` (
  `id` int UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `newsletter_subscriptions`
--

INSERT INTO `newsletter_subscriptions` (`id`, `email`, `created_at`) VALUES
(5, 'archetypesodium@gmail.com', '2025-09-30 16:10:59'),
(6, 'hirunchatcharoensawat@gmail.com', '2025-10-01 08:26:27');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_otps`
--

CREATE TABLE `password_reset_otps` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `code_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `verified_at` datetime DEFAULT NULL,
  `reset_token_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  `ip` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_otps`
--

INSERT INTO `password_reset_otps` (`id`, `user_id`, `code_hash`, `expires_at`, `attempts`, `verified_at`, `reset_token_hash`, `reset_token_expires`, `used_at`, `ip`, `created_at`) VALUES
(2, 2, '$2b$10$KUYmXwr3MwGhMegmyts/JuCwbwEMbzq0F0nY0gZtwg9BT8NelAhGa', '2025-10-01 18:34:07', 1, '2025-10-01 18:24:33', '$2b$10$SfAXjQX2S5BUxHkv0tlAK.5Bz2VbuZTANVBwciO0z1zrl1X/YCAl2', '2025-10-01 18:39:33', '2025-10-01 18:24:40', '::1', '2025-10-01 11:24:06');

-- --------------------------------------------------------

--
-- Table structure for table `sports`
--

CREATE TABLE `sports` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date DEFAULT NULL,
  `result` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sports`
--

INSERT INTO `sports` (`id`, `user_id`, `name`, `type`, `date`, `result`, `description`, `created_at`) VALUES
(3, 3, 'Basketball 3x3', 'ฟุตบอล', '2025-09-19', 'รองชนะเลิศอันดับ 1', 'Test', '2025-09-20 06:20:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `title` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name_th` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name_th` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `phone` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type` enum('student','alumni') COLLATE utf8mb4_unicode_ci DEFAULT 'student',
  `education` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `st_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `st_id_canonical` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','active','suspended','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approved_at` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `title`, `first_name_th`, `last_name_th`, `first_name_en`, `last_name_en`, `user_desc`, `phone`, `email`, `education`, `password`, `created_at`, `st_id`, `st_id_canonical`, `status`, `approved_at`, `last_login`, `password_changed_at`, `updated_at`) VALUES
(2, 'นางสาว', 'ทด', 'สอบ', 'ะ', 'test', NULL, '0645497841', 'archetypesodium@gmail.com', 'ปวช.', '$2b$12$86WhjCXoU1i5j4TQfYCWcOQn/Qbw4/PCk5unqLfBWSCAIGP4i2kgS', '2025-09-18 16:11:21', '66605100039-4', '666051000394', 'active', NULL, '2025-10-01 11:43:04', '2025-10-01 11:24:40', '2025-10-01 11:43:04'),
(3, 'นางสาว', 'สมัคร', 'สอบ', 'Smack', 'Sob', 'TestTesttttttttttttttttttTestTesttttttttttttttttttTestTesttttttttttttttttttTestTesttttttttttttttttttTestTestttttttttttttttttt\nTestTesttttttttttttttttttTestTesttttttttttttttttttTestTesttttttttttttttttttTestTesttttttttttttttttttTestTestttttttttttttttttt\nTestTesttttttttttttttttttTestTesttttttttttttttttttTestTesttttttttttttttttttTestTesttttttttttttttttttTestTesttttttttttttttttt', '0645497841', 'test@gmail.com', 'ม.6', '$2b$10$ozznfOMBRdeIVPRJ.TtgRuGI.XfoeLskZs7UpibQeECDuvk3nuGBm', '2025-09-19 11:57:06', '66605100039-5', '666051000395', 'active', NULL, '2025-10-04 17:07:37', NULL, '2025-10-04 17:07:37');

-- --------------------------------------------------------

--
-- Table structure for table `work_experiences`
--

-- --------------------------------------------------------

--
-- Table structure for table `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` int NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `work_experiences`
--

CREATE TABLE `work_experiences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `job_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `job_description` text COLLATE utf8mb4_unicode_ci,
  `portfolio_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_experiences`
--

INSERT INTO `work_experiences` (`id`, `user_id`, `job_title`, `start_date`, `end_date`, `job_description`, `portfolio_link`, `created_at`) VALUES
(2, 3, 'บริษัททดสอบ ตำแหน่ง Earth ควย', '2025-09-19', '2025-09-21', 'ควย', 'ควย', '2025-09-20 06:43:01'),
(3, 3, 'บริษัท ABC ตำแหน่ง SE', '2025-09-13', '2025-09-21', 'Testtt', NULL, '2025-09-20 08:09:30'),
(4, 3, 'ธำหะ', '2025-09-26', '2025-10-11', 'Test', NULL, '2025-09-30 15:30:13'),
(5, 3, 'Te', '2025-09-12', '2025-09-25', 'test', 'tt', '2025-09-30 15:30:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `activity_upload`
--
ALTER TABLE `activity_upload`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`cer_id`);

--
-- Indexes for table `email_broadcasts`
--
ALTER TABLE `email_broadcasts`
  ADD PRIMARY KEY (`broadcast_id`);

--
-- Indexes for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email` (`email`);

--
-- Indexes for table `file_upload`
--
ALTER TABLE `file_upload`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`news_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `newsletter_subscriptions`
--
ALTER TABLE `newsletter_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `password_reset_otps`
--
ALTER TABLE `password_reset_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `expires_at` (`expires_at`),
  ADD KEY `reset_token_expires` (`reset_token_expires`);

--
-- Indexes for table `sports`
--
ALTER TABLE `sports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `work_experiences`
--
ALTER TABLE `work_experiences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `activity_upload`
--
ALTER TABLE `activity_upload`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `admin_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `cer_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `email_broadcasts`
--
ALTER TABLE `email_broadcasts`
  MODIFY `broadcast_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `file_upload`
--
ALTER TABLE `file_upload`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `news_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `newsletter_subscriptions`
--
ALTER TABLE `newsletter_subscriptions`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `password_reset_otps`
--
ALTER TABLE `password_reset_otps`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sports`
--
ALTER TABLE `sports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `work_experiences`
--
ALTER TABLE `work_experiences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `news`
--
ALTER TABLE `news`
  ADD CONSTRAINT `news_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sports`
--
ALTER TABLE `sports`
  ADD CONSTRAINT `sports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_experiences`
--
ALTER TABLE `work_experiences`
  ADD CONSTRAINT `work_experiences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
