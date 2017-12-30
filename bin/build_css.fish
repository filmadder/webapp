#!/usr/bin/fish

begin
	lessc app/styles/style.less \
	| postcss --use autoprefixer --no-map \
	| cleancss -O1 specialComments:0 \
	> build/styles/style.css
end
