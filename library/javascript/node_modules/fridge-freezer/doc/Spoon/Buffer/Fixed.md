# fridge-freezer

## Spoon/Buffer/Fixed

The buffer holds a fixed size of rows in the.
If full it begins to write.
On close it writes all data out of the buffer.

### Methods

#### new Buffer(rowMeta, size)

Construct the Buffer object.

* *rowMeta* [org.pentaho.di.core.row.RowMeta] - A row meta object.

Return: nothing

#### push(row)

Push one row into the buffer.

* *row* [Object] - A parameter object.

Return: nothing
