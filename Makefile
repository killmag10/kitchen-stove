MAKEFLAGS:= --warn-undefined-variables --no-print-directory $(MAKEFLAGS)

# Commands
MAKE := make
MKDIR := mkdir
TAR := tar
GIT := git
RM := rm
TEST := test
CP := cp
WGET := wget
CD := cd
FALSE := false
TRUE := true
CAT := cat
PASTE := paste

# Configuration
USE_JDBC_CONFIG_GENERATOR := 1

# Downloads
# Mysql
DOWNLOAD_URL_MYSQL_CONNECTOR ?= 'http://files.dietrich-hosting.de/public/mysql/mysql-connector-java-5.0.8.tar.gz'
PACKAGE_PATH_MYSQL_CONNECTOR ?= $(DOWNLOAD_DIR)/mysql-connector.tar.gz
# Mongo
DOWNLOAD_URL_MONGO_DRIVER ?= http://files.dietrich-hosting.de/public/mongo/mongo-java-driver-2.12.4.jar
PACKAGE_PATH_MONGO_DRIVER ?= $(DOWNLOAD_DIR)/mongo-java-driver.jar

# Directories
LIB_DIR := library
LIB_ETL_DIR := $(LIB_DIR)/etl
CONFIG_DIR := config
CONFIG_JDBC_FILE := $(CONFIG_DIR)/database/jdbc/jdbc.properties
DOWNLOAD_DIR := download
TEMP_DIR := temp

JS_JAR_FILE = $(LIB_DIR)/javascript/node_modules/nodeschnaps/deps/rhino/js.jar

# TOOLS
TOOL_REPLACER := $(LIB_ETL_DIR)/tool/replacer
TOOL_JDBC_FILE_GENERATOR := $(LIB_ETL_DIR)/tool/jdbcFileGenerator

# Defaults
APPLICATION_ENV ?= development

# Macros
IS_INSTALLED = $(shell $(TEST) -d $(LIB_ETL_DIR)/application/pentaho-kettle && printf '1')

.PHONY: \
	.installFolders \
	.downloadMysqlConnector \
	.downloadMongoDriver \
	.patchKettle \
	all \
	install \
	uninstall \
	configure \
	clean

.installFolders:
	# Create temp directory.
	@$(TEST) -d $(TEMP_DIR) || $(MKDIR) $(TEMP_DIR)
	# Create download directory.
	@$(TEST) -d $(DOWNLOAD_DIR) || $(MKDIR) $(DOWNLOAD_DIR)

.downloadMysqlConnector:
	##### Download Mysql-Connector #####
	# Download from: $(DOWNLOAD_URL_MYSQL_CONNECTOR)
	$(WGET) -O $(PACKAGE_PATH_MYSQL_CONNECTOR) $(DOWNLOAD_URL_MYSQL_CONNECTOR) 2>&1

.downloadMongoDriver:
	##### Download Mysql-Connector #####
	# Download from: $(DOWNLOAD_URL_MONGO_DRIVER)
	$(WGET) -O $(PACKAGE_PATH_MONGO_DRIVER) $(DOWNLOAD_URL_MONGO_DRIVER) 2>&1

.patchKettle:
	@$(TEST) -f $(PACKAGE_PATH_MYSQL_CONNECTOR) || $(MAKE) .downloadMysqlConnector
	@$(TEST) -f $(PACKAGE_PATH_MONGO_DRIVER) || $(MAKE) .downloadMongoDriver
	##### Patch Kettle #####
	# Install mysql connector.
	@$(TAR) -xa --to-stdout --wildcards \
		-f $(PACKAGE_PATH_MYSQL_CONNECTOR) \
		'mysql-connector-java-*-bin.jar' \
		> $(LIB_ETL_DIR)/application/pentaho-kettle/lib/mysql-connector-java-bin.jar
	# Install mongo driver.
	@$(CP) $(PACKAGE_PATH_MONGO_DRIVER) \
		$(LIB_ETL_DIR)/application/pentaho-kettle/lib/mongo-java-driver.jar
	# Install rhino.
	@$(RM) $(LIB_ETL_DIR)/application/pentaho-kettle/lib/js-*.jar
	@$(CP) $(JS_JAR_FILE) \
		$(LIB_ETL_DIR)/application/pentaho-kettle/lib/

# External targets
all:
	##### Overview #####
	# install:		Downlaod and install the application.
	# uninstall:	uninstall the application.
	# configure:	Write the config files.
	# clean:		Cleanup the temporary files.

install:
	##### Install #####
ifeq ($(IS_INSTALLED),1)
	# Already installed
else
	# Setup folders.
	@$(MAKE) .installFolders
	# Install etl library
	@$(MAKE) -C $(LIB_ETL_DIR) install
	# Patch kettle
	@$(MAKE) .patchKettle
	@$(MAKE) configure
endif

uninstall:
	##### Uninstall #####
	@$(MAKE) -C $(LIB_ETL_DIR) uninstall

configure:
	##### Configure #####
	# Copy default application.conf.$(APPLICATION_ENV) if not exists.
	@$(TEST) -f $(CONFIG_DIR)/application.conf.$(APPLICATION_ENV) \
		|| $(CP) \
			$(CONFIG_DIR)/application.conf.$(APPLICATION_ENV).dist \
			$(CONFIG_DIR)/application.conf.$(APPLICATION_ENV)
	# Copy default .spoonrc if not exists.
	@$(TEST) -f $(CONFIG_DIR)/kettle/.kettle/.spoonrc \
		|| $(CP) \
			$(CONFIG_DIR)/kettle/.kettle/.spoonrc.default \
			$(CONFIG_DIR)/kettle/.kettle/.spoonrc
	# Concat config files:
	#	application.conf.$(APPLICATION_ENV)
	#	application.default.conf
	@$(CP) $(CONFIG_DIR)/application.conf.$(APPLICATION_ENV) \
		$(CONFIG_DIR)/application.conf
	# Generate environment.generated.config.sh
	@$(TOOL_REPLACER) \
		$(CONFIG_DIR)/environment.config.sh \
		$(CONFIG_DIR)/application.conf \
		> $(CONFIG_DIR)/environment.generated.config.sh
	# Generate kettle.properties.
	@$(PASTE) --serial --delimiters='\n' \
		$(CONFIG_DIR)/kettle/.kettle/kettle.properties.template \
		$(CONFIG_DIR)/application.conf \
		> $(CONFIG_DIR)/kettle/.kettle/kettle.properties
	# Generate jdbc database config:
ifeq ($(USE_JDBC_CONFIG_GENERATOR),1)
	#	With jdbc file generator.
	@$(TOOL_JDBC_FILE_GENERATOR) \
		< $(CONFIG_DIR)/application.conf \
		> $(CONFIG_JDBC_FILE)
else
	#	With config replacer.
	@$(TOOL_REPLACER) \
		$(CONFIG_DIR)/database/jdbc.properties.template \
		$(CONFIG_DIR)/application.conf \
		> $(CONFIG_JDBC_FILE)
endif

clean:
	@$(MAKE) -C $(LIB_ETL_DIR) clean
	##### Cleanup #####
	# Remove temp directory.
	@$(RM) -r $(TEMP_DIR)
	# Remove download directory.
	@$(RM) -r $(DOWNLOAD_DIR)
	@$(MAKE) .installFolders

start-gui: configure
ifeq ($(IS_INSTALLED),1)
	##### Start GUI #####
	@./bin/gui
else
	# !!! NOT INSTALLED !!!
	# Please run make install first.
endif
