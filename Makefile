senchaver = 4.0.2.67
senchaarch = x64
sencha = $(shell pwd)/bin/sencha/Sencha/Cmd/$(senchaver)/sencha
seleniumver = 2.39.0
selenium = $(shell pwd)/bin/selenium/selenium-server-standalone-$(seleniumver).jar

resources = http://theraft.openend.se/~autotest/resources

senchaopts = --nologo --time

bootstrap.js = bootstrap.js
compiled.html = compiled.html


.PHONY: bootstrap
bootstrap: $(sencha)
	$(sencha) $(senchaopts) compile --ignore ext/src/Ext-more.js \
		exclude -f test/*.js and \
		metadata -o $(bootstrap.js) --alternates and \
		metadata -o $(bootstrap.js) --alias --append and \
		metadata -o $(bootstrap.js) --loader-paths --append


.PHONY: compile
compile: $(sencha) clean
	$(sencha) $(senchaopts) compile \
		page -str -in index.html -out _$(compiled.html)
	mv _$(compiled.html) $(compiled.html)

.PHONY: translation
translation:
	make -C webshop/ translation


.PHONY: theme
theme:
	cd packages/ext-theme-bokf/ && $(sencha) package build

.PHONY: clean
clean:
	rm -f $(compiled.html)
	rm -f all-classes.js

$(sencha):
	mkdir -p bin/sencha/
	wget -q -P bin/sencha -nc $(resources)/SenchaCmd-$(senchaver)-linux-$(senchaarch).run.zip
	unzip -u -d bin/sencha/ bin/sencha/SenchaCmd-$(senchaver)-linux-$(senchaarch).run.zip
	chmod +x bin/sencha/SenchaCmd-$(senchaver)-linux-$(senchaarch).run
	bin/sencha/SenchaCmd-$(senchaver)-linux-$(senchaarch).run --mode unattended --prefix bin/sencha/
	chmod +x $(sencha)

.PHONY: sencha
sencha: $(sencha)

.PHONY: selenium
selenium: vpython/lib/python2.7/site-packages/selenium

vpython:
	# there is a bug in virtualenv which skips installing needed
	# executables (pip, py.test) if --system-site-packages is
	# used, so install a fresh vpython first, and upgrade it to
	# include system site-packages later
	virtualenv -v vpython
	vpython/bin/pip install $(resources)/py-1.4.20.tar.gz
	vpython/bin/pip install $(resources)/pytest-2.5.2.tar.gz
	virtualenv -v --system-site-packages vpython

vpython/lib/python2.7/site-packages/selenium: vpython
	vpython/bin/pip install $(resources)/selenium-2.40.0.tar.gz

.PHONY: sencha-clean
sencha-clean:
	rm -rf bin/sencha

.PHONY: selenium-clean
selenium-clean:
	rm -rf bin/selenium
	rm -rf vpython/

.PHONY: squeaky-clean
squeaky-clean: sencha-clean selenium-clean clean

.PHONY: all
all: bootstrap compile translation
