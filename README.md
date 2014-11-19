# Kitchen-Stove

Kitchen-Stove is a bootstrap example and library
for Pentaho Data-Integration (Kettle).

## Features

Support for [nodeschnaps](https://github.com/killmag10/nodeschnaps/)
(node compatibility layer).

## Supported Platforms

### Kettle Versions:
* 5.2.0 (Default)
* 5.1.0

### Operation Systems:
* Linux

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


