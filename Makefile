all: help

## test: run tests
.PHONY: test
test:
	cd tests && make

.PHONY: help
help:
	@echo
	@sed -n 's/^##//p' Makefile
	@echo
