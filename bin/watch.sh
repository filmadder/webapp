#!/bin/bash
rm -rf build
mkdir -p build
mkdir -p build/styles
mkdir -p build/scripts

cp -r app/fonts -t build
cp -r app/images -t build

bin/build_html.sh
bin/build_css.sh
bin/build_js.sh
bin/build_vendor.sh

concurrently --raw --kill-others \
	"chokidar 'app/templates/*.html' -c 'bin/build_html.sh'" \
	"chokidar 'app/styles/*.less' -c 'bin/build_css.sh'" \
	"chokidar 'app/scripts/**/*.js' -c 'bin/build_js.sh'" \
	"ecstatic --root build --port 9000 --cache 0"
