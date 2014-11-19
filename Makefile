# Commands
MAKE := make --no-print-directory
TAR := tar
GIT := git
RM := rm
TEST := test
CP := cp

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

.PHONY: all configure install uninstall clean

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
	@$(MAKE) -C $(LIB_ETL_DIR) install
	@$(MAKE) configure

uninstall:
	##### Uninstall #####
	@$(MAKE) -C $(LIB_ETL_DIR) uninstall

configure:
	##### Configure #####
	# Copy default application.conf.$(APPLICATION_ENV) if not exists.
	@$(TEST) -f $(CONFIG_DIR)/kettle/.kettle/.spoonrc \
		|| @$(CP) \
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
	@$(RM) -r $(TEMP_DIR)/*
	@$(RM) -r $(DOWNLOAD_DIR)/*
