# fridge-freezer

## Database/Table/Versioning
Class for database table data versioning.

### Options

* *prototype*
  * *database* String - Database connection name.
  * *schema* String - Database schema if exists.
  * *table* String - Table name.
  * *commitSize* Number - Commit size.
  * *purge* Boolean - Purge not readed rows on the end.
  * *purgeWhere* String - Additional purge condition.
  * *logger* Console - Console compatible logger.
  * *fieldNames* [Database/Table/Versioning/Options/Field/Names](Options/Field/Names.md) - Versioning field names.
  * *fieldDescriptions* [Database/Table/Versioning/Options/Field/Descriptions](Options/Field/Descriptions.md) - Versioning row field descriptions.

### Exmaple

Start script:
```js
LoadScriptFile(getEnvironmentVar('NODESCHNAPS_LOADER_FILE'));

// Load Versioning
var Versioning = require('fridge-freezer')('Database/Table/Versioning');

// Create option Object.
var options = new Versioning.Options();
options.database = 'Example'; // Database connection name.
options.table = 'test'; // Table name.
options.fieldNames.dateLastSeen = 'dateLastSeen'; // Set name of last seen field.
options.purge = true; // Enable purging on finish call.

// Generate row list with default type compare from spoon row meta.
options.fieldDescriptions.fields = Versioning.Options.FieldDescriptions.convertRowMeta(
	rowMeta,
	Versioning.Options.FieldTypes.compare
);

// Change types of over fields
options.fieldDescriptions.fields['id'] = Versioning.Options.FieldTypes.id;
options.fieldDescriptions.fields['update'] = Versioning.Options.FieldTypes.update;

// Set console compatible logger.
options.logger = require('fridge-freezer')('Log');

// Create versioning instance.
var versioning = new Versioning(options);

// Set step to update spoon statistics.
versioning.statistic.setStep(_step_);

NodeJS();
```

Transform script:
```js
try {
    var result = versioning.process(
        // Convert spoon row to javascript object.
        Versioning.convertRow(row, rowMeta)
    );

    // Output result object without data row.
    delete result.row;
    result = JSON.stringify(result, null, 4);
} catch(e) {
    // Release resources if error was occurred.
	versioning.close();
	throw e;
}

NodeJS();
```

End script:
```js
// Say versioning that all is finished.
versioning.finish();

NodeJS();
```

Table exmaple:
```sql
CREATE TABLE `test` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `change` varchar(255) NOT NULL,
  `update` varchar(255) DEFAULT NULL,
  `version` int(11) NOT NULL,
  `dateTo` datetime NOT NULL,
  `dateFrom` datetime NOT NULL,
  `dateLastSeen` datetime DEFAULT NULL, -- if purging is wished
  PRIMARY KEY (`id`,`version`)
) DEFAULT CHARSET=utf8;
```

### Exmaple Rollback Callback
```js
versioning.setRollbackCallback(function(error, uncommitedRows) {
    uncommitedRows.forEach(function(row) {
        _step_.putError(
            rowMeta,
            Versioning.convertRowBack(row, rowMeta)
        );
    });

    return true;
});
```
