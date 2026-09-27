ALTER TABLE `seasonal_rates` ALTER COLUMN `maximum_guests` SET DEFAULT 5;--> statement-breakpoint
UPDATE `seasonal_rates` SET `maximum_guests` = 5 WHERE `maximum_guests` > 5;
