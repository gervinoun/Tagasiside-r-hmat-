CREATE OR REPLACE TABLE `tagasiside` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`eesnimi` VARCHAR(255),
	`perenimi` VARCHAR(255),
	`grupp` VARCHAR(255),
	`hinne` INTEGER,
	`kommentaar` VARCHAR(255),
	PRIMARY KEY(`id`)
);
