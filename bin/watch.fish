#!/usr/bin/fish

begin
	bin/build.fish

	concurrently --raw --kill-others \
		"chokidar 'app/templates/**/*.html' -c 'bin/build_html.fish'" \
		"chokidar 'app/styles/**/*.less' -c 'bin/build_css.fish'" \
		"chokidar 'app/scripts/**/*.js' -c 'bin/build_js.fish'" \
		"ecstatic --root build --port 9000 --cache 0"
end
