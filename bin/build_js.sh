#!/bin/bash
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
	--lint \
	--source-map build/scripts/fa.js.map \
	--source-map-url fa.js.map \
	--source-map-include-sources \
	--output build/scripts/fa.js
