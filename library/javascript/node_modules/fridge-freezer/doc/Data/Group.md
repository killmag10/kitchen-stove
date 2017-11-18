# fridge-freezer

## Data/Group
Class to group data (as example Spoon rows).
Group data by a ordered key.

### Properties

* *prototype*
  * *currentKey* String - The current key.
  * *buffer* Array - The data buffer.
  * *length* String - Current length of the buffer.

### Methods

#### new Group(flushCallback)

Create the Structure object.

* *flushCallback* Function - callback for grouped data

Return: The created object.

#### push(key, row)

Create the Structure object.

* *key* String - The group key.
* *row* Object - A data row.

Return: Number - The buffer length.

#### flush()

Flush the data out of the buffer.

#### clear()

Clear the buffer.

#### close()

Close all open resources
Must be called at the end.
