PATH_NODE_MODULES := node_modules
PATH_DOCS := doc
PATH_DOCS_API := $(PATH_DOCS)/api

# Macros
EXISTS_DOCS = $(shell $(TEST) -d $(PATH_DOCS_API) && printf '1')

# Commands
RM := rm
TEST := test

.PHONY: \
	all \
	help \
	install \
	uninstall \
	test \
	.installDependencyNodeSource \
	$(TEST_FILES)

all: help

help:
	########################################
	# Help:
	#	help		Show the help.
	# 	html		Generate the html docs.
	# 	clean		Cleanup the project.
	########################################

clean: .cleanHtml

html: .cleanHtml
	# Create html docs under $(PATH_DOCS)/api
	@$(PATH_NODE_MODULES)/.bin/jsdoc \
		--destination $(PATH_DOCS_API) \
		--recurse \
		lib/

.cleanHtml:
ifeq ($(EXISTS_DOCS),1)
	# Remove html docs
	@$(TEST) ! -d $(PATH_DOCS_API) || $(RM) -r $(PATH_DOCS_API)
endif
