#!/usr/bin/fish

begin
	# set -l scripts (find app/scripts -type f -name '*.js' | env LC_COLLATE=C sort)

	# uglifyjs $scripts \
	# 	--compress \
	# 	--source-map "includeSources,url='fa.js.map'" \
	# 	--output build/scripts/fa.js

	uglifyjs \
		app/scripts/_init.js \
		app/scripts/http.js \
		app/scripts/ws.js \
		app/scripts/dom.js \
		app/scripts/films.js \
		app/scripts/tags.js \
		app/scripts/users.js \
		app/scripts/updates.js \
		app/scripts/feed.js \
		app/scripts/search.js \
		app/scripts/history.js \
		app/scripts/auth.js \
		app/scripts/forms.js \
		app/scripts/title.js \
		app/scripts/views/_init.js \
		app/scripts/views/feed.js \
		app/scripts/views/film.js \
		app/scripts/views/outer.js \
		app/scripts/views/search.js \
		app/scripts/views/settings.js \
		app/scripts/views/tag.js \
		app/scripts/views/updates.js \
		app/scripts/views/user.js \
		app/scripts/routing.js \
		--compress \
		--source-map "includeSources,url='fa.js.map'" \
		--output build/scripts/fa.js
end
