CREATE TABLE IF NOT EXISTS `${tableName}` (
  `id` INT(11) UNSIGNED NOT NULL,
  `startedAt` datetime NOT NULL,
  `appliedAt` datetime NULL DEFAULT NULL,
  `user` VARCHAR(63) NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
)
DEFAULT CHARSET=utf8
COMMENT='Holds the changes of the database structure.\nVersion: 2';
