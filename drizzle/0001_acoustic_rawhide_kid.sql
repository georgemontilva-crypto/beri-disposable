CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`name` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `auth_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auth_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `query_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(128) NOT NULL,
	`result` enum('valid','not_found') NOT NULL,
	`ip` varchar(64),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `query_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slot` varchar(128) NOT NULL,
	`section` varchar(128),
	`title` varchar(255),
	`storageKey` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`width` int,
	`height` int,
	`sizeBytes` bigint,
	`mimeType` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wholesale_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`company` varchar(255),
	`email` varchar(320) NOT NULL,
	`phone` varchar(64),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wholesale_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wholesale_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255),
	`name` varchar(255),
	`company` varchar(255),
	`phone` varchar(64),
	`status` enum('pending','approved','active','rejected') NOT NULL DEFAULT 'pending',
	`registrationToken` varchar(128),
	`registrationTokenExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	CONSTRAINT `wholesale_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `wholesale_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `auth_code_idx` ON `auth_codes` (`code`);--> statement-breakpoint
CREATE INDEX `log_code_idx` ON `query_logs` (`code`);--> statement-breakpoint
CREATE INDEX `log_result_idx` ON `query_logs` (`result`);--> statement-breakpoint
CREATE INDEX `image_slot_idx` ON `site_images` (`slot`);--> statement-breakpoint
CREATE INDEX `image_section_idx` ON `site_images` (`section`);--> statement-breakpoint
CREATE INDEX `inquiry_status_idx` ON `wholesale_inquiries` (`status`);--> statement-breakpoint
CREATE INDEX `inquiry_email_idx` ON `wholesale_inquiries` (`email`);--> statement-breakpoint
CREATE INDEX `wholesale_status_idx` ON `wholesale_users` (`status`);--> statement-breakpoint
CREATE INDEX `wholesale_token_idx` ON `wholesale_users` (`registrationToken`);