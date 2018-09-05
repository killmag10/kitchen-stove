# Config

ETL_LIB_LIB_DIR := library
ETL_LIB_APPLICATION_DIR := application
ETL_LIB_PATCH_DIR := patch
ETL_LIB_PATCH_DIR_KETTLE := $(ETL_LIB_PATCH_DIR)/application/pentaho-kettle
ETL_KETTLE_APPLICATION_DIR := $(ETL_LIB_APPLICATION_DIR)/pentaho-kettle

VERBOSE?= 0

# Set default package download path.
ETL_KETTLE_DOWNLOAD_PATH?= https://files.dietrich-hosting.de/public/pentaho/kettle/pdi-ce-8.0.0.0-28.tar.gz

# Set default package file path.
ETL_KETTLE_PACKAGE_FILE?= $(ETL_LIB_APPLICATION_DIR)/pentaho-kettle.download.tar.gz


# Commands
CP := cp
ECHO := echo
MAKE := make
MKDIR := mkdir
MV := mv
RMDIR := rmdir
RM := rm
RSYNC := rsync
TAR := tar
TEST := test
TR := tr

ifneq ($(VERBOSE),0)
WGET := wget
else
WGET := wget -q
endif

.PHONY: \
	all \
	install \
	downloadKettle \
	installKettle \
	installKettleUnpack \
	uninstall \
	clean

all:

install: installKettle

downloadKettle:
	# Download Kettle from: $(ETL_KETTLE_DOWNLOAD_PATH)
	# Download Kettle to: $(abspath $(ETL_KETTLE_PACKAGE_FILE))
	@$(WGET) -O $(ETL_KETTLE_PACKAGE_FILE) $(ETL_KETTLE_DOWNLOAD_PATH) 2>&1

installKettle:
	@$(TEST) -f $(ETL_KETTLE_PACKAGE_FILE) || $(MAKE) downloadKettle
	##### Install Kettle #####
	# Create Kettle application directory.
	@$(TEST) -d $(ETL_KETTLE_APPLICATION_DIR) \
		|| $(MKDIR) $(ETL_KETTLE_APPLICATION_DIR)
	# Unpack Kettle.
	@$(TAR) -xaf $(ETL_KETTLE_PACKAGE_FILE) -C $(ETL_KETTLE_APPLICATION_DIR) data-integration/
	@$(MV) $(ETL_KETTLE_APPLICATION_DIR)/data-integration/* $(ETL_KETTLE_APPLICATION_DIR)/
	@$(RMDIR) $(ETL_KETTLE_APPLICATION_DIR)/data-integration

uninstall:
	##### Uninstall Kettle #####
	@$(RM) -rf $(ETL_KETTLE_APPLICATION_DIR)

clean:
	##### Cleanup Kettle installation #####
	@$(TEST) ! -f $(ETL_KETTLE_PACKAGE_FILE) || $(RM) $(ETL_KETTLE_PACKAGE_FILE)
