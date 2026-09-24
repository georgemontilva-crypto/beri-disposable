CREATE TABLE `partner_news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`published` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(512),
	`url` varchar(1024) NOT NULL,
	`category` varchar(64) DEFAULT 'General',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `partner_news_published_idx` ON `partner_news` (`published`);--> statement-breakpoint
CREATE INDEX `partner_resources_category_idx` ON `partner_resources` (`category`);