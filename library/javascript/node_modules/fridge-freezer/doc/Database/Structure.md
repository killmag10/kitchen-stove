# fridge-freezer

## Database/Structure
Class for database versioning.

### File Structure

*Version* - is integer started by 1.

VERSION.forward.sql:

* Plain SQL to execute for the version.
* Required: YES

VERSION.backward.sql:

* Plain SQL to rewind the version.
* Required: NO
* Currently **not implemented**.

VERSION.description.txt:

* Description text for the version.
* Required: YES


### Properties

* *Options* [Database/Structure/Options](Structure/Options.md)

### Methods

### new Structure(options)

Create the Structure object.

* *options* [Database/Structure/Options](Structure/Options.md) - A options object.

Return: The created object.

### migrate([version])

Migrate the database to the given version or to the newest.

Currently only forward migration is supported.

* *version* Number - The version to migrate to.

Return: Nothing.

#### close()

Close all used resources. (Database connections)

Return: Nothing.

### Migration
#### Changelog
Migration steps for the changelog table.

##### Version 1 to 2

Replace "**${tableName}**" with your changelog table name in the sql query.
Then run the query on your database.

```sql
ALTER TABLE `${tableName}`
CHANGE COLUMN `startedAt` `startedAt` DATETIME NOT NULL ,
CHANGE COLUMN `appliedAt` `appliedAt` DATETIME NULL DEFAULT NULL;

UPDATE `${tableName}` SET description = TRIM(TRIM("\n" FROM TRIM(description)));

ALTER TABLE `${tableName}` COMMENT = 'Holds the changes of the database structure.\nVersion: 2';
```
