all: help

## test: run tests
.PHONY: test
test:
	cd tests && make

.PHONY: coverage
coverage:
	cd tests && make coverage

.PHONY: help
help:
	@echo
	@sed -n 's/^##//p' Makefile
	@echo
