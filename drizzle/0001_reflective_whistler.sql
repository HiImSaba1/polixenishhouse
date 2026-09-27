CREATE INDEX `booking_requests_status_dates_idx` ON `booking_requests` (`status`,`arrival_date`,`departure_date`);--> statement-breakpoint
CREATE INDEX `calendar_entries_date_range_idx` ON `calendar_entries` (`start_date`,`end_date`,`type`);--> statement-breakpoint
CREATE INDEX `seasonal_rates_date_range_idx` ON `seasonal_rates` (`start_date`,`end_date`);