TARGETS=sv_SE.js

translation: clean $(TARGETS)

.PHONY: locale/webshop.pot
locale/webshop.pot:
	xgettext --omit-header --no-location -o $@ --from-code utf-8 webshop.js

locale/%.po: locale/webshop.pot
	msgmerge -U $@ $<

%.js: locale/%.po
	(echo -n "translations = " && ./pojson.py -p $<) > $@

clean:
	rm -f $(TARGETS)
