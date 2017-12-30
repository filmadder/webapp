#!/usr/bin/fish

begin
	rm -rf build
	mkdir -p build
	mkdir -p build/styles
	mkdir -p build/scripts

	cp -r app/fonts -t build
	cp -r app/images -t build

	bin/build_html.fish
	bin/build_css.fish
	bin/build_js.fish
	bin/build_vendor.fish
end
