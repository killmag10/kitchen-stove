# Commands
MAKE := make --no-print-directory
MKDIR := mkdir
TAR := tar
GIT := git
RM := rm
TEST := test
CP := cp
WGET := wget

# Downloads
# Mysql
DOWNLOAD_URL_MYSQL_CONNECTOR = 'http://files.dietrich-hosting.de/public/mysql/mysql-connector-java-5.1.34.tar.gz'
PACKAGE_PATH_MYSQL_CONNECTOR = $(DOWNLOAD_DIR)/mysql-connector.tar.gz
# Mongo
DOWNLOAD_URL_MONGO_DRIVER = http://files.dietrich-hosting.de/public/mongo/mongo-java-driver-2.12.4.jar
PACKAGE_PATH_MONGO_DRIVER = $(DOWNLOAD_DIR)/mongo-java-driver.jar

LIB_DIR := library
LIB_ETL_DIR := $(LIB_DIR)/etl
CONFIG_DIR := config
CONFIG_JDBC_FILE := $(CONFIG_DIR)/database/jdbc/jdbc.properties
DOWNLOAD_DIR := download
TEMP_DIR := temp

TOOL_REPLACER := $(LIB_ETL_DIR)/tool/replacer

ifeq ($(APPLICATION_ENV),)
	APPLICATION_ENV=development
endif

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
	@$(TEST) -d $(TEMP_DIR) || $(MKDIR) $(TEMP_DIR)
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


# External targets
all:
	##### Overview #####
	# install:		Downlaod and install the application.
	# uninstall:	uninstall the application.
	# configure:	Write the config files.
	#
	# clean:		Cleanup the temporary files.

install:
	##### Install #####
	@$(MAKE) .installFolders
	@$(MAKE) -C $(LIB_ETL_DIR) install
	@$(MAKE) .patchKettle
	@$(MAKE) configure

uninstall:
	##### Uninstall #####
	@$(MAKE) -C $(LIB_ETL_DIR) uninstall

configure:
	##### Configure #####
	# Copy default application.conf.$(APPLICATION_ENV) if not exists.
	@$(TEST) -f $(CONFIG_DIR)/kettle/.kettle/.spoonrc \
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
	# Generate kettle.properties
	@$(TOOL_REPLACER) \
		$(CONFIG_DIR)/application.conf \
		$(CONFIG_DIR)/kettle/.kettle/kettle.properties.template \
		$(CONFIG_DIR)/kettle/.kettle/kettle.properties
	# Copy database config
	@$(TOOL_REPLACER) \
		$(CONFIG_DIR)/application.conf \
		$(CONFIG_DIR)/database/jdbc.properties.template \
		$(CONFIG_JDBC_FILE)

clean:
	##### Cleanup #####
	@$(MAKE) -C $(LIB_ETL_DIR) clean
	@$(RM) -r $(TEMP_DIR)
	@$(RM) -r $(DOWNLOAD_DIR)
	@$(MAKE) .installFolders
