ALTER TABLE `wholesale_inquiries` ADD `firstName` varchar(128);--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `lastName` varchar(128);--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `shippingAddress` text;--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `businessLicenseUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `tobaccoLicenseUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `wholesale_inquiries` ADD `feinUrl` varchar(1024);