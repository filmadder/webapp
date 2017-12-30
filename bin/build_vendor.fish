#!/usr/bin/fish

begin
	cat \
	node_modules/loglevel/dist/loglevel.min.js \
	node_modules/signals/dist/signals.min.js \
	node_modules/hasher/dist/js/hasher.min.js \
	node_modules/crossroads/dist/crossroads.min.js \
	node_modules/mustache/mustache.min.js \
	node_modules/whatwg-fetch/fetch.js \
	node_modules/functional.js/functional.js \
	node_modules/datetime/build/datetime.js \
	node_modules/hier/src/hier.js \
	node_modules/hammerjs/hammer.min.js \
	> build/scripts/vendor.js
end
