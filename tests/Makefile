all: test

.PHONY: test
test: node_modules
	./node_modules/.bin/istanbul cover \
		  --include-all-sources \
		  --root ../ \
		  node_modules/.bin/_mocha *.spec.js
	./node_modules/.bin/istanbul report text

node_modules: package.json
	npm update || (rm -rf node_modules; exit 1)
	touch node_modules
