#!/bin/bash
cat \
bower_components/normalize-css/normalize.css \
> build/styles/vendor.css

cat \
bower_components/js-signals/dist/signals.min.js \
bower_components/hasher/dist/js/hasher.min.js \
bower_components/crossroads/dist/crossroads.min.js \
bower_components/mustache.js/mustache.min.js \
bower_components/fetch/fetch.js \
bower_components/pythonic-datetime/build/datetime.js \
bower_components/hier/src/hier.js \
> build/scripts/vendor.js
