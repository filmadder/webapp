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
	app/scripts/views.js \
	app/scripts/routing.js \
	--compress \
	--lint \
	--source-map build/scripts/fa.js.map \
	--output build/scripts/fa.js
