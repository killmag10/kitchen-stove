# Kitchen-Stove

Kitchen-Stove is a bootstrap example and library
for Pentaho Data-Integration (Kettle).

## Features

Includes
* [nodeschnaps](https://github.com/killmag10/nodeschnaps/) (node compatibility layer).
* [fridge-freezer](https://github.com/killmag10/fridge-freezer) (A pentaho kettle javascript library for nodeschnaps.).

## Supported Platforms

### Kettle Versions:
* 6.0.1 (Default)
* 5.4.0
* 5.3.0
* 5.2.0
* 5.1.0

### Operation Systems:
* Linux
* BSD

## Requirements:
* Java >= 7
* Make
* Bash
* NodeJS >= 12 (Only for Node Module installation)

## Installation

Run "make install".

## Configuration

### Environment Variables

Attention: Paths must be absolute.

#### ETL_KETTLE_REPOSITORY_ID

The default kettle repository to use.

#### ETL_CONFIG_DIR

The configuration files
With kettle/.kettle in where.

#### ETL_LOG_DIR

The directory for logging.

#### ETL_TMP_DIR

The temporary directory.

#### ETL_JNDI_ROOT

Directory with the JNDI connection configuration files.

#### ETL_LOG_FILE

The general logging file.
If it is empty logging will be disabled.

#### ETL_KETTLE_MEMORY_MAX

Maximal memory usage for the kettle application.

#### NODESCHNAPS_PATH

Path to search for modules/files (Last must be the nodeschnaps lib folder).

#### NODESCHNAPS_LOADER_FILE

Path to the nodeschnaps loader. (nodeschnaps/loader.js)

## Make

### Variables

If **DOWNLOAD_URL_\*** is not set than the default will be used.

If **PACKAGE_\*** exists download will be skipped.


| Name                          | Description                                  |
| ----------------------------: | :------------------------------------------- |
| DOWNLOAD_URL_MYSQL_CONNECTOR  | URL to mysql connector tar.gz package        |
| PACKAGE_PATH_MYSQL_CONNECTOR  | Local path to mysql connector tar.gz package |
| DOWNLOAD_URL_MONGO_DRIVER     | URL to mongo driver tar.gz package           |
| PACKAGE_PATH_MONGO_DRIVER     | Local path to mongo driver tar.gz package    |
| ETL_KETTLE_DOWNLOAD_PATH      | URL to Kettle tar.gz package                 |
| ETL_KETTLE_PACKAGE_FILE       | Path to Kettle tar.gz package                |
