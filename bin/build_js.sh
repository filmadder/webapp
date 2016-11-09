#!/bin/bash
find app/scripts/ -name '*.js' -print | \
	env LC_COLLATE=C sort | \
	xargs cat > build/scripts/fa.js
