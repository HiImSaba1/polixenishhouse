CREATE TABLE `external_calendar_events` (
	`id` varchar(36) NOT NULL,
	`provider` enum('booking_com') NOT NULL,
	`external_uid_hash` varchar(64) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`last_synced_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `external_calendar_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `external_calendar_provider_uid_unique` UNIQUE(`provider`,`external_uid_hash`),
	CONSTRAINT `external_calendar_valid_dates` CHECK(`external_calendar_events`.`end_date` > `external_calendar_events`.`start_date`)
);--> statement-breakpoint
CREATE INDEX `external_calendar_active_dates_idx` ON `external_calendar_events` (`active`,`start_date`,`end_date`);
