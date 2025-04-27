-- Fix the AUTO_INCREMENT issue in crime_reports table
-- First, we'll check if there's a record with id=0
DELETE FROM crime_reports WHERE id = 0;

-- Reset the AUTO_INCREMENT value to ensure it starts after the max id
ALTER TABLE crime_reports AUTO_INCREMENT = 4; 