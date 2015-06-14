CREATE TABLE IF NOT EXISTS `${tableName}` (
  `id` INT(11) UNSIGNED NOT NULL,
  `startedAt` timestamp NOT NULL,
  `appliedAt` timestamp NULL DEFAULT NULL,
  `user` VARCHAR(63) NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
)
DEFAULT CHARSET=utf8
COMMENT='Holds the changes of the database structure';
