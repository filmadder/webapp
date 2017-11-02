#!/usr/bin/fish

begin
	cat app/index.html | sed -e '/<!-- include templates -->/,$d'

	for template in (find app/templates -type f -name '*.html')
		set -l script_id (echo $template | sed \
							-e 's/^app\/templates\///' \
							-e 's/\.html$/-templ/' \
							-e 's/\//-/g')

		echo '<script id="'$script_id'" type="x-mustache">'
		cat $template
		echo '</script>'
	end

	cat app/index.html | sed -e '1,/<!-- include templates -->/d'
end > build/index.html
