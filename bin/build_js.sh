#!/bin/bash
cat \
app/scripts/_init.js \
app/scripts/logs.js \
app/scripts/assert.js \
app/scripts/conn.js \
app/scripts/films.js \
app/scripts/users.js \
app/scripts/auth.js \
app/scripts/views.js \
app/scripts/routing.js \
> build/scripts/fa.js
