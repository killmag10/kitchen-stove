ALTER TABLE `${tableName}`
CHANGE COLUMN `startedAt` `startedAt` DATETIME NOT NULL ,
CHANGE COLUMN `appliedAt` `appliedAt` DATETIME NULL DEFAULT NULL;

UPDATE `${tableName}` SET description = TRIM(TRIM("\n" FROM TRIM(description)));

ALTER TABLE `${tableName}` COMMENT = 'Holds the changes of the database structure.\nVersion: 2';
