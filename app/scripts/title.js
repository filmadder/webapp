fa.title = (function() {

	"use strict";


	// the <title> elem
	var dom = fa.dom.get('title');

	// the breadcrumb trail of the current title
	// does not include the ubiquitous "film adder"
	var trail = [];

	// the api
	var title = {};

	// changes the title to the given array/string
	title.set = function(arg) {
		if(fjs.isArray(arg)) {
			trail = arg.slice();
		} else if(arg) {
			trail = [arg.toString()];
		} else {
			trail = [];
		}

		if(trail.length > 0) {
			dom.textContent = 'film adder | '+ trail.join(' | ');
		} else {
			dom.textContent = 'film adder';
		}
	};

	// returns the last string of the current breadcrumb trail
	title.getLastBit = function() {
		if(trail.length > 0) {
			return trail[trail.length-1];
		} else {
			return '';
		}
	};


	return title;

}());
