# Config

ETL_LIB_LIB_DIR := library
ETL_LIB_APPLICATION_DIR := application
ETL_LIB_PATCH_DIR := patch
ETL_LIB_PATCH_DIR_KETTLE := $(ETL_LIB_PATCH_DIR)/application/pentaho-kettle
ETL_KETTLE_APPLICATION_DIR := $(ETL_LIB_APPLICATION_DIR)/pentaho-kettle

# Set default package download path.
ifeq ($(ETL_KETTLE_DOWNLOAD_PATH),)
	ETL_KETTLE_DOWNLOAD_PATH:= http://files.dietrich-hosting.de/public/pentaho/kettle/pdi-ce-5.2.0.0-209.tar.gz
endif

# Set default package file path.
ifeq ($(ETL_KETTLE_PACKAGE_FILE),)
	ETL_KETTLE_PACKAGE_FILE := $(ETL_LIB_APPLICATION_DIR)/pentaho-kettle.download.tar.gz
endif

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
WGET := wget

.PHONY: \
	all \
	install \
	downloadKettle \
	installKettle \
	installKettleUnpack \
	uninstall \
	clean

all:

install: installExternals installKettle

downloadKettle:
	##### Download Kettle #####
	# Download Kettle from: $(KETTLE_DOWNLOAD_PATH)
	@$(TEST) -f $(ETL_KETTLE_PACKAGE_FILE) \
		|| $(WGET) -O $(ETL_KETTLE_PACKAGE_FILE) $(ETL_KETTLE_DOWNLOAD_PATH) 2>&1

installKettle:
	@$(TEST) -f $(ETL_KETTLE_PACKAGE_FILE) || $(MAKE) downloadKettle
	##### Install Kettle #####
	# Check if installed.
	@$(TEST) ! -d $(ETL_KETTLE_APPLICATION_DIR) || $(MAKE) uninstallKettle
	# Create Kettle application directory.
	@$(MKDIR) $(ETL_KETTLE_APPLICATION_DIR)
	# Unpack Kettle.
	@$(TAR) -xaf $(ETL_KETTLE_PACKAGE_FILE) -C $(ETL_KETTLE_APPLICATION_DIR) data-integration/
	@$(MV) $(ETL_KETTLE_APPLICATION_DIR)/data-integration/* $(ETL_KETTLE_APPLICATION_DIR)/
	@$(RMDIR) $(ETL_KETTLE_APPLICATION_DIR)/data-integration

uninstall:
	##### Uninstall Kettle #####
	$(RM) -rf $(ETL_KETTLE_APPLICATION_DIR)

clean:
	##### Cleanup Kettle installation #####
	@$(TEST) ! -f $(ETL_KETTLE_PACKAGE_FILE) || $(RM) $(ETL_KETTLE_PACKAGE_FILE)
