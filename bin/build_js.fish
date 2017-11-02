#!/usr/bin/fish

begin
	set -l scripts (find app/scripts -type f -name '*.js' | env LC_COLLATE=C sort)

	uglifyjs $scripts \
		--compress \
		--source-map "includeSources,url='fa.js.map'" \
		--output build/scripts/fa.js
end
