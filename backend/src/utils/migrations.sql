-- =============================================================================
-- DATABASE MIGRATION SCRIPT FOR AIVEN MYSQL / MYSQL 8.0+
-- Adds image_file_id column to products and news tables for ImageKit asset tracking.
-- =============================================================================

-- 1. Add image_file_id column to products table if not exists
ALTER TABLE `products` 
ADD COLUMN `image_file_id` VARCHAR(255) NULL AFTER `image`;

-- 2. Add image_file_id column to news table if not exists
ALTER TABLE `news` 
ADD COLUMN `image_file_id` VARCHAR(255) NULL AFTER `image`;
