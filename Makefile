

MAKEFLAGS:= --warn-undefined-variables --no-print-directory $(MAKEFLAGS)
VERBOSE?= 0
CONTAINER_NAMESPACE := test

# Commands
MAKE := make
MKDIR := mkdir
TAR := tar
GIT := git
RM := rm
TEST := test
CP := cp
CD := cd
FALSE := false
TRUE := true
CAT := cat
PASTE := paste
NPM := npm
DOCKER := docker


ifneq ($(VERBOSE),0)
WGET := wget
else
WGET := wget -q
endif

# Configuration
USE_JDBC_CONFIG_GENERATOR := 1

# Downloads
# Mysql
DOWNLOAD_URL_MYSQL_CONNECTOR ?= 'http://files.dietrich-hosting.de/public/mysql/mysql-connector-java-5.1.38.tar.gz'
PACKAGE_PATH_MYSQL_CONNECTOR ?= $(DOWNLOAD_DIR)/mysql-connector.tar.gz
# Mongo
DOWNLOAD_URL_MONGO_DRIVER ?= http://files.dietrich-hosting.de/public/mongo/mongo-java-driver-2.12.4.jar
PACKAGE_PATH_MONGO_DRIVER ?= $(DOWNLOAD_DIR)/mongo-java-driver.jar


# Kettle
ETL_KETTLE_PACKAGE_FILE ?= $(DOWNLOAD_DIR)/pentaho-kettle.download.tar.gz

# Directories
LIB_DIR := library
LIB_ETL_DIR := $(LIB_DIR)/etl
CONFIG_DIR := config
CONFIG_JDBC_FILE := $(CONFIG_DIR)/database/jdbc/jdbc.properties
DOWNLOAD_DIR := download
TEMP_DIR := temp
PATH_NODE_MODULES := $(LIB_DIR)/javascript/node_modules

# Files
JS_JAR_FILE = $(LIB_DIR)/javascript/node_modules/nodeschnaps/deps/rhino/lib/rhino-1.7.7.1.jar
CONFIG_APPLICATION_GENERATED = $(CONFIG_DIR)/application.generated.conf

# TOOLS
TOOL_REPLACER := $(LIB_ETL_DIR)/tool/replacer
TOOL_JDBC_FILE_GENERATOR := $(LIB_ETL_DIR)/tool/jdbcFileGenerator

# Defaults
APPLICATION_ENV ?= development

# Macros
IS_INSTALLED = $(shell $(TEST) -d $(LIB_ETL_DIR)/application/pentaho-kettle && printf '1')

.PHONY: \
	.install-folders \
	.download-mysql-connector \
	.download-mongo-driver \
	.patch-kettle \
	all \
	install \
	uninstall \
	configure \
	clean

.install-folders:
	# Create temp directory.
	@$(TEST) -d $(TEMP_DIR) || $(MKDIR) $(TEMP_DIR)
	# Create download directory.
	@$(TEST) -d $(DOWNLOAD_DIR) || $(MKDIR) $(DOWNLOAD_DIR)

.download-mysql-connector:
	# Download Mysql-Connector from: $(DOWNLOAD_URL_MYSQL_CONNECTOR)
	@$(WGET) -O $(PACKAGE_PATH_MYSQL_CONNECTOR) $(DOWNLOAD_URL_MYSQL_CONNECTOR) 2>&1

.download-mongo-driver:
	# Download Mongo driver from: $(DOWNLOAD_URL_MONGO_DRIVER)
	@$(WGET) -O $(PACKAGE_PATH_MONGO_DRIVER) $(DOWNLOAD_URL_MONGO_DRIVER) 2>&1

.patch-kettle: install-node-modules install-library-etl .download-mysql-connector .download-mongo-driver
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

install: .install-header
ifeq ($(IS_INSTALLED),1)
	# Already installed
else
	# Install dependencies.
	@$(MAKE) install-dependencies .patch-kettle
	@$(MAKE) configure
endif

.install-header:
	##### Install #####

install-dependencies: install-library-etl

install-library-etl: .install-folders
	# Install etl library
	@$(MAKE) -C $(LIB_ETL_DIR) install

install-node-modules:
	@#  Install node modules
	@# @cd $(PATH_NODE_MODULES)/.. && $(NPM) install >/dev/null

uninstall: uninstall-header uninstall-node-modules uninstall-dependencies

uninstall-header:
	##### Uninstall #####

uninstall-dependencies: uninstall-library-etl

uninstall-library-etl:
	@$(MAKE) -C $(LIB_ETL_DIR) uninstall

uninstall-node-modules:
	@# # Uninstall node modules
	@# @rm -rf $(PATH_NODE_MODULES)

configure: .configure-head .configure-generate-main .configure-kettle .configure-database

.configure-head:
	##### Configure #####

.configure-generate-main:
	# Copy default application.conf if not exists.
	@$(TEST) -f $(CONFIG_DIR)/application.conf \
		|| $(CP) \
			$(CONFIG_DIR)/application.conf.dist \
			$(CONFIG_DIR)/application.conf
	# Combine config files.
	@$(PASTE) --serial --delimiters='\n' \
		$(CONFIG_DIR)/application.default.conf \
		$(CONFIG_DIR)/application.conf \
		> $(CONFIG_APPLICATION_GENERATED)
	# Generate environment.generated.config.sh
	@$(TOOL_REPLACER) \
		$(CONFIG_DIR)/environment.config.sh \
		$(CONFIG_APPLICATION_GENERATED) \
		> $(CONFIG_DIR)/environment.generated.config.sh

.configure-kettle: .configure-generate-main
	# Copy default .spoonrc if not exists.
	@$(TEST) -f $(CONFIG_DIR)/kettle/.kettle/.spoonrc \
		|| $(CP) \
			$(CONFIG_DIR)/kettle/.kettle/.spoonrc.default \
			$(CONFIG_DIR)/kettle/.kettle/.spoonrc
	# Generate kettle.properties.
	@$(PASTE) --serial --delimiters='\n' \
		$(CONFIG_DIR)/kettle/.kettle/kettle.properties.template \
		$(CONFIG_APPLICATION_GENERATED) \
		> $(CONFIG_DIR)/kettle/.kettle/kettle.properties

.configure-database: .configure-generate-main
	# Generate jdbc database config:
ifeq ($(USE_JDBC_CONFIG_GENERATOR),1)
	#	With jdbc file generator.
	@$(TOOL_JDBC_FILE_GENERATOR) \
		< $(CONFIG_APPLICATION_GENERATED) \
		> $(CONFIG_JDBC_FILE)
else
	#	With config replacer.
	@$(TOOL_REPLACER) \
		$(CONFIG_DIR)/database/jdbc.properties.template \
		$(CONFIG_DIR)/application.conf \
		> $(CONFIG_JDBC_FILE)
endif

clean: clean-dependencies
	##### Cleanup #####
	# Remove temp directory.
	@$(RM) -rf $(TEMP_DIR)
	# Remove download directory.
	@$(RM) -rf $(DOWNLOAD_DIR)
	@$(MAKE) .install-folders

clean-dependencies:
	@$(MAKE) -C $(LIB_ETL_DIR) clean

start-gui: configure
ifeq ($(IS_INSTALLED),1)
	##### Start GUI #####
	@./bin/gui
else
	# !!! NOT INSTALLED !!!
	# Please run make install first.
endif

docker-image: configure
	$(DOCKER) build -t $(CONTAINER_NAMESPACE) .
# now docker run $(CONTAINER_NAMESPACE) /home/etl/bin/transformation Project/Test/simpleTest
