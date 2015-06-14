# fridge-freezer

## Database/Structure
Class for database versioning.

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
