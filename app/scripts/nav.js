fa.nav = (function() {

	"use strict";


	//
	// vars
	//

	// the constructed object
	var nav = {};

	// nav key: [link elem,]
	var registry = {};


	//
	// helpers
	//

	var validateKey = function(key) {
		if(key.indexOf(':') < 1) {
			throw new Error('The data-nav should include a colon: '+ linkElem.toString());
		}

		return key;
	};

	var getNavKey = function(linkElem) {
		var key = linkElem.dataset.nav;

		if(!key) {
			throw new Error('Could not find data-nav: '+ linkElem.toString());
		}

		return validateKey(key);
	};

	var addClass = function(linkElem) {
		linkElem.classList.add('selected');
	};

	var removeClass = function(linkElem) {
		linkElem.classList.remove('selected');
	};


	//
	// api
	//

	// adds the given link(s) to the registry
	// the arg might be either a single <a> elem, or an array of those
	nav.reg = function(links) {
		var i, key;

		if(!fjs.isArray(links)) links = [links];

		for(i = 0; i < links.length; i++) {
			try {
				key = getNavKey(links[i]);
			} catch (error) {
				log.error(error);
			}

			if(!registry.hasOwnProperty(key)) {
				registry[key] = [];
			}

			registry[key].push(links[i]);
		}
	};

	// removes the given link(s) to the registry
	// the arg might be either a single <a> elem, or an array of those
	nav.unreg = function(links) {
		var i, key;

		if(!fjs.isArray(links)) links = [links];

		for(i = 0; i < links.length; i++) {
			try {
				key = getNavKey(links[i]);
			} catch (error) {
				log.error(error);
			}

			if(registry.hasOwnProperty(key)) {
				registry[key] = fjs.filter(function(x) {
					return x != links[i];
				}, registry[key]);
			}
		}
	};

	// marks the registered links that match the given nav key by adding the
	// class 'selected'
	//
	// the registered links that do not match but share the same namespace (the
	// key up to the colon), are unmarked
	nav.mark = function(navKey) {
		navKey = validateKey(navKey);

		nav.unmark(navKey.split(':')[0]);

		if(registry.hasOwnProperty(navKey)) {
			fjs.map(addClass, registry[navKey]);
		}
	};

	// removes the class 'selected' from the registered links that match the
	// given nav key
	//
	// the latter could also be just a namespace, i.e. the part of the key up
	// to the colon (:)
	nav.unmark = function(navKey) {
		if(navKey.indexOf(':') > -1) {
			if(registry.hasOwnProperty(navKey)) {
				fjs.map(removeClass, registry[navKey]);
			}
		} else {
			fjs.map(function(key) {
				if(key.split(':')[0] == navKey) {
					fjs.map(removeClass, registry[key]);
				}
			}, Object.keys(registry));
		}
	};

	// unmarks all the links and empties the registry
	nav.reset = function() {
		registry = {};
	};


	return nav;

}());
