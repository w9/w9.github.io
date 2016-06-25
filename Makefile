main:
	pug --pretty *.pug

test:
	pug --pretty *.pug && chromium index.html
