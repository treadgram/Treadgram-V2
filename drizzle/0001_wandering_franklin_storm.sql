CREATE TABLE `analyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`path` varchar(512),
	`target` varchar(64),
	`clubId` int,
	`userId` int,
	`sessionId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clubId` int NOT NULL,
	`userId` int NOT NULL,
	`proofText` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`moderatorNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clubs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`name` varchar(256) NOT NULL,
	`city` varchar(64) NOT NULL,
	`cityLabel` varchar(64) NOT NULL,
	`sport` varchar(64) NOT NULL,
	`sportLabel` varchar(64) NOT NULL,
	`description` text,
	`shortDescription` varchar(280),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`verified` boolean NOT NULL DEFAULT false,
	`beginnerFriendly` boolean NOT NULL DEFAULT false,
	`pricingType` enum('free','paid','donation') NOT NULL DEFAULT 'free',
	`monthlyFeeInr` int,
	`lat` float,
	`lng` float,
	`address` text,
	`instagramUrl` varchar(512),
	`whatsappUrl` varchar(512),
	`websiteUrl` varchar(512),
	`coverImageUrl` varchar(1024),
	`logoUrl` varchar(1024),
	`submittedBy` int,
	`ownedBy` int,
	`moderatorNote` text,
	`avgRating` decimal(3,2),
	`reviewCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clubs_id` PRIMARY KEY(`id`),
	CONSTRAINT `clubs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clubId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`datetimeUtc` timestamp NOT NULL,
	`isOpen` boolean NOT NULL DEFAULT true,
	`lat` float,
	`lng` float,
	`locationName` varchar(256),
	`registrationUrl` varchar(512),
	`maxParticipants` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clubId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clubId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(8) NOT NULL,
	`endTime` varchar(8),
	`lat` float,
	`lng` float,
	`locationName` varchar(256),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','moderator') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `analyticsEvents` ADD CONSTRAINT `analyticsEvents_clubId_clubs_id_fk` FOREIGN KEY (`clubId`) REFERENCES `clubs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyticsEvents` ADD CONSTRAINT `analyticsEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `claims` ADD CONSTRAINT `claims_clubId_clubs_id_fk` FOREIGN KEY (`clubId`) REFERENCES `clubs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `claims` ADD CONSTRAINT `claims_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clubs` ADD CONSTRAINT `clubs_submittedBy_users_id_fk` FOREIGN KEY (`submittedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clubs` ADD CONSTRAINT `clubs_ownedBy_users_id_fk` FOREIGN KEY (`ownedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_clubId_clubs_id_fk` FOREIGN KEY (`clubId`) REFERENCES `clubs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_clubId_clubs_id_fk` FOREIGN KEY (`clubId`) REFERENCES `clubs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_clubId_clubs_id_fk` FOREIGN KEY (`clubId`) REFERENCES `clubs`(`id`) ON DELETE no action ON UPDATE no action;