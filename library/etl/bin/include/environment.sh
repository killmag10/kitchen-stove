#!/bin/bash

##### INIT ######
# Get the include dir path.
ETL_LIB_BIN_INCLUDE_DIR=`printf '%s' "$BASH_SOURCE" | sed 's#/\?[^/]*$##' | sed 's#^./##'`;
if [[ ! "$ETL_LIB_BIN_INCLUDE_DIR" =~ ^/ ]]; then
    ETL_LIB_BIN_INCLUDE_DIR=`printf '%s' "$PWD/$ETL_LIB_BIN_INCLUDE_DIR" | sed 's#/\.\?$##'`;
fi
# Get the absolute path.
ETL_LIB_BIN_INCLUDE_DIR="`readlink -f "$ETL_LIB_BIN_INCLUDE_DIR"`"
export ETL_LIB_BIN_INCLUDE_DIR;

export ETL_MAIN_PID="$$"
export ETL_LIB_DIR="$ETL_LIB_BIN_INCLUDE_DIR/../..";
export ETL_LIB_BIN_DIR="$ETL_LIB_BIN_INCLUDE_DIR/..";
export ETL_LIB_APPLICATION_DIR="$ETL_LIB_DIR/application";
export ETL_APPLICATION_KETTLE_DIR="$ETL_LIB_APPLICATION_DIR/pentaho-kettle"
export NODESCHNAPS_PATH
export NODESCHNAPS_LOADER_FILE

# USE ETL_LOG_TYPES='NONE' for no logging
[ -z "$ETL_LOG_TYPES" ] && ETL_LOG_TYPES='ERROR OUTPUT';
[ -z "$ETL_KETTLE_LOG_LEVEL" ] && ETL_KETTLE_LOG_LEVEL='Basic';

# List of required environment variables.
declare -a REQUIRED_ENV_VARS;
REQUIRED_ENV_VARS=(
    'ETL_APPLICATION_KETTLE_DIR'
    'ETL_KETTLE_MEMORY_MAX'
    'ETL_CONFIG_DIR'
    'ETL_LIB_DIR'
    'ETL_LIB_BIN_DIR'
    'ETL_LIB_BIN_INCLUDE_DIR'
    'ETL_LOG_DIR'
    'ETL_LIB_APPLICATION_DIR'
    'ETL_LOG_TYPES'
    'ETL_KETTLE_LOG_LEVEL'
    'NODESCHNAPS_PATH'
    'NODESCHNAPS_LOADER_FILE'
)

# List of optional environment variables.
declare -a OPTIONAL_ENV_VARS;
OPTIONAL_ENV_VARS=(
    'ETL_KETTLE_REPOSITORY_ID'
    'ETL_KETTLE_REPOSITORY_USER'
    'ETL_KETTLE_REPOSITORY_PASSWORD'
    'ETL_KETTLE_JNDI_ROOT'
    'ETL_TMP_DIR'
    'ETL_ENV_VARS'
    'ETL_LOG_TYPES'
    'ETL_LOG_FILTER_ACTIVE'
)

# CHECK ENV VARS
ETL_checkRequiredEnvironment()
{
    local name
    for name in ${REQUIRED_ENV_VARS[@]}; do
        if [ -z "${!name}" ]; then
            printf 'Environment variable "%s" not set!\n' "$name" >&2
            exit 1;
        fi
    done
}
ETL_checkRequiredEnvironment

# Create a temp dir if not exists.
if [ ! -e "$ETL_TMP_DIR" ]; then
    mkdir "$ETL_TMP_DIR"
fi

# Create Kettle ENV
export JAVAMAXMEM="$ETL_KETTLE_MEMORY_MAX"
export PENTAHO_JAVA="$ETL_JAVA"
export PENTAHO_DI_JAVA_OPTIONS="-Xmx${JAVAMAXMEM}m"
export KETTLE_REPOSITORY="$ETL_KETTLE_REPOSITORY_ID"
export KETTLE_USER="$ETL_KETTLE_REPOSITORY_USER"
export KETTLE_PASSWORD="$ETL_KETTLE_REPOSITORY_PASSWORD"
export KETTLE_HOME="$ETL_CONFIG_DIR/kettle"

declare -a ETL_KETTLE_GLOBAL_PARAMS
ETL_KETTLE_GLOBAL_PARAMS=(
    "ETL_TMP_DIR=$ETL_TMP_DIR"
    "ETL_CONFIG_DIR=$ETL_CONFIG_DIR"
    "ETL_LOG_DIR=$ETL_LOG_DIR"
    "ETL_LIB_DIR=$ETL_LIB_DIR"
    "NODESCHNAPS_PATH=$NODESCHNAPS_PATH"
    "NODESCHNAPS_LOADER_FILE=$NODESCHNAPS_LOADER_FILE"
)
if [ -n "$ETL_TMP_DIR" ]; then
	ETL_KETTLE_GLOBAL_PARAMS[${#ETL_KETTLE_GLOBAL_PARAMS[@]}]="java.io.tmpdir=$ETL_TMP_DIR"
fi
if [ -n "$ETL_JNDI_ROOT" ]; then
	ETL_KETTLE_GLOBAL_PARAMS[${#ETL_KETTLE_GLOBAL_PARAMS[@]}]="org.osjava.sj.root=$ETL_JNDI_ROOT"
fi
IFS=$'\n'
for param in ${ETL_ENV_VARS}; do
    ETL_KETTLE_GLOBAL_PARAMS[${#ETL_KETTLE_GLOBAL_PARAMS[@]}]="$param";
done

PENTAHO_DI_JAVA_OPTIONS='-Xmx'"$JAVAMAXMEM"'m -Dorg.eclipse.swt.browser.DefaultType=mozilla'
for param in "${ETL_KETTLE_GLOBAL_PARAMS[@]}"; do
    PENTAHO_DI_JAVA_OPTIONS="$PENTAHO_DI_JAVA_OPTIONS -D$param";
done
export PENTAHO_DI_JAVA_OPTIONS

declare -a ETL_filterSpoonLogStrings
ETL_filterSpoonLogStrings=(
    '\[DS\]Getting Connection for url:'
    'Unable to load Hadoop Configuration from'
    'RepositoriesMeta - Reading repositories XML file:'
    'Kitchen - Command Line Options'
)

##
# Filter log messages.
#
# &0    string      message
# &1    string      message
ETL_filterSpoonLog()
{
    local -a removeRegEx
    local regex='\(\)'
    local text

    for text in "${ETL_filterSpoonLogStrings[@]}"; do
        [ -n "$regex" ] && regex+='\|'
        regex+='text'
    done
    regex='\($regEx\)'

    if [ -n "$ETL_LOG_FILTER_ACTIVE" ]; then
        grep -v "$regEx"
    else
        cat -
    fi
}

##
# Read from stdin kettle output to log.
#
# $1    string     log file
# $2    string     type 1:OUTPUT 2:ERROR
ETL_logKettle()
{
    local \
        logFile \
        type \
        typeName

    logFile="$1"

    case "$2" in
        1)
            type='OUTPUT'
            typeName='OUTPUT'
            ;;
        2)
            type='ERROR'
            typeName='ERROR '
            ;;
        *)
            type='UNDEFINED'
            typeName='NONE  '
            ;;
    esac

    local loggingActive=
    local IFS=' '$'\t\n'
    local key
    for key in $ETL_LOG_TYPES; do
        [ "$key" = "$type" ] && loggingActive=1
    done

    if [ -n "$loggingActive" ] && [ -n "$logFile" ]; then
        local line
        ETL_filterSpoonLog \
            | while read line; do
                printf 'PID(%s) %s %s: %s\n' \
                    "`date +'%Y-%m-%d %H:%M:%S'`" \
                    "$ETL_MAIN_PID" \
                    "$typeName" \
                    "$line"
            done | tee -a "$logFile"
    else
        cat -
    fi
}

ETL_startKettle()
{
    mkdir -p "`dirname "$ETL_LOG_FILE"`"

    {
        {
            {
                cd "$ETL_APPLICATION_KETTLE_DIR"
                "$@"
                return $?
            } | ETL_logKettle "$ETL_LOG_FILE" 1
            return ${PIPESTATUS[0]}
        } 2>&1 1>&3 | ETL_logKettle "$ETL_LOG_FILE" 2
        return ${PIPESTATUS[0]}
    } 3>&1

    return $?
}
