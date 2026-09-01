CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`source` varchar(64) DEFAULT 'home',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `newsletter_email_idx` ON `newsletter_subscribers` (`email`);