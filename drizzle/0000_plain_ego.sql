CREATE TABLE `booking_requests` (
	`id` varchar(36) NOT NULL,
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`arrival_date` date NOT NULL,
	`departure_date` date NOT NULL,
	`guest_count` int NOT NULL,
	`indicative_total_cents` int NOT NULL,
	`customer_name` varchar(160) NOT NULL,
	`customer_email` varchar(254) NOT NULL,
	`customer_phone` varchar(40),
	`customer_message` text,
	`private_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `booking_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `booking_requests_valid_dates` CHECK(`booking_requests`.`departure_date` > `booking_requests`.`arrival_date`),
	CONSTRAINT `booking_requests_valid_guests` CHECK(`booking_requests`.`guest_count` > 0),
	CONSTRAINT `booking_requests_nonnegative_total` CHECK(`booking_requests`.`indicative_total_cents` >= 0)
);
--> statement-breakpoint
CREATE TABLE `calendar_entries` (
	`id` varchar(36) NOT NULL,
	`type` enum('blocked','reserved') NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`booking_request_id` varchar(36),
	`note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calendar_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `calendar_entries_booking_request_unique` UNIQUE(`booking_request_id`),
	CONSTRAINT `calendar_entries_valid_dates` CHECK(`calendar_entries`.`end_date` > `calendar_entries`.`start_date`),
	CONSTRAINT `calendar_entries_reserved_has_booking` CHECK(`calendar_entries`.`type` = 'blocked' OR `calendar_entries`.`booking_request_id` IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE `seasonal_rates` (
	`id` varchar(36) NOT NULL,
	`label` varchar(120) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`nightly_rate_cents` int NOT NULL,
	`minimum_stay` int NOT NULL DEFAULT 1,
	`maximum_guests` int NOT NULL DEFAULT 6,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seasonal_rates_id` PRIMARY KEY(`id`),
	CONSTRAINT `seasonal_rates_valid_dates` CHECK(`seasonal_rates`.`end_date` >= `seasonal_rates`.`start_date`),
	CONSTRAINT `seasonal_rates_positive_price` CHECK(`seasonal_rates`.`nightly_rate_cents` > 0),
	CONSTRAINT `seasonal_rates_valid_minimum_stay` CHECK(`seasonal_rates`.`minimum_stay` > 0),
	CONSTRAINT `seasonal_rates_valid_guest_limit` CHECK(`seasonal_rates`.`maximum_guests` > 0)
);
--> statement-breakpoint
ALTER TABLE `calendar_entries` ADD CONSTRAINT `calendar_entries_booking_request_id_booking_requests_id_fk` FOREIGN KEY (`booking_request_id`) REFERENCES `booking_requests`(`id`) ON DELETE cascade ON UPDATE no action;