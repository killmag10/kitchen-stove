#!/bin/bash

##### INIT ######
# Get the include dir path.
ETL_BIN_INCLUDE_DIR=`printf '%s' "$BASH_SOURCE" | sed 's#/\?[^/]*$##' | sed 's#^./##'`;
if [[ ! "$ETL_BIN_INCLUDE_DIR" =~ ^/ ]]; then
    ETL_BIN_INCLUDE_DIR=`printf '%s' "$PWD/$ETL_BIN_INCLUDE_DIR" | sed 's#/\.\?$##'`;
fi
# Get the absolute path.
ETL_BIN_INCLUDE_DIR="`readlink -f "$ETL_BIN_INCLUDE_DIR"`"

##### CONFIG #####
# Repository configuration.
export ETL_KETTLE_REPOSITORY_ID=''
export ETL_KETTLE_REPOSITORY_USER=''
export ETL_KETTLE_REPOSITORY_PASSWORD=''

# Path configuration.
export ETL_CONFIG_DIR="$ETL_BIN_INCLUDE_DIR/../../config"
export ETL_LOG_DIR="$ETL_BIN_INCLUDE_DIR/../../log"
export ETL_LIB_DIR="$ETL_BIN_INCLUDE_DIR/../../library/etl"
export ETL_TMP_DIR="$ETL_BIN_INCLUDE_DIR/../../temp"
export ETL_JNDI_ROOT="$ETL_BIN_INCLUDE_DIR/../../config/database/jdbc"
export ETL_LOG_FILE="$ETL_LOG_DIR/etl.log"

export LIB_JAVASCRIPT_DIR="$ETL_BIN_INCLUDE_DIR/../../library/javascript"

# Kettle configuration.
export ETL_KETTLE_MEMORY_MAX=1024

# JavaScript configuration.
export NODESCHNAPS_PATH="$ETL_BIN_INCLUDE_DIR/../../resource/javascript:$LIB_JAVASCRIPT_DIR/node_modules:$LIB_JAVASCRIPT_DIR/node_modules/nodeschnaps/lib"
export NODESCHNAPS_LOADER_FILE="$LIB_JAVASCRIPT_DIR/node_modules/nodeschnaps/loader.js"
export NODESCHNAPS_MODIFIER="fridge-freezer/lib/Spoon/Nodeschnaps"

# Additional variables.
export ETL_RESOURCE_DIR="$ETL_BIN_INCLUDE_DIR/../../resource"
export ETL_SHARE_DIR="$ETL_RESOURCE_DIR/share"

if [ -e "$ETL_CONFIG_DIR/environment.generated.config.sh" ]; then
    . "$ETL_CONFIG_DIR/environment.generated.config.sh" || exit 1
fi

export ETL_ENV_VARS="
ETL_RESOURCE_DIR=$ETL_RESOURCE_DIR
ETL_SHARE_DIR=$ETL_SHARE_DIR
"
