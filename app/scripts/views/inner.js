fa.views.inner = (function() {

	"use strict";


	//
	// helpers
	//

	// returns the last string of the breadcrumb trail of the current title
	var getTitleEnd = function() {
		if(document.title.indexOf(' | ') > -1) {
			return document.title.split(' | ').pop();
		} else {
			return '';
		}
	};


	//
	// views
	//

	// inits an inner view
	// 
	// includes the navigation, the search form, and the #view element that is
	// the container of all inner views
	var createInner = function(elem) {
		var navLinks;
		var movableElem, navElem, isNavOpen, view, searchIcon, searchBtn;
		var searchForm, queryField, doSearchButton, isSearchOpen;
		var showNav, hideNav, showSearch, hideSearch;
		var marker;
		var heading;

		fa.views.render(elem, 'inner', {user: fa.auth.getUser()});

		// change heading
		heading = fa.dom.get('h1');

		fa.views.scrolledFarDown.add(function() {
			heading.textContent = getTitleEnd();
		});
		fa.views.scrolledBackUp.add(function() {
			heading.textContent = 'film adder';
		});

		// nav: active links
		navLinks = fa.dom.filter('header nav a', elem);
		fa.nav.reg(navLinks);

		// nav: open and close
		movableElem = fa.dom.get('.header-inner', elem);
		navElem = fa.dom.get('.nav', elem);
		isNavOpen = false;

		showNav = function() {
			navElem.classList.remove('hidden');
			movableElem.classList.add('move-left');
			view.classList.add('uninteractive');
			isNavOpen = true;
		};
		hideNav = function() {
			navElem.classList.add('hidden');
			movableElem.classList.remove('move-left');
			view.classList.remove('uninteractive');
			isNavOpen = false;
		}

		// the nav shows when the snake is clicked (1) and hides when isNavOpen
		// is true and either the snake (2), the view (3) or a nav link(4) is
		// clicked
		fa.dom.on(fa.dom.get('.nav-opener', elem), 'click', function() {
			if(!isNavOpen) showNav();  // (1)
			else hideNav();  // (2)
		});
		fa.dom.on(fa.dom.get('#view', elem), 'click', function() {
			if(isNavOpen) hideNav();  // (3)
		});
		fa.dom.on(navLinks, 'click', hideNav);  // (4)

		// search form
		searchForm = fa.dom.get('#search-form', elem);
		queryField = fa.dom.get('[name=q]', searchForm);
		doSearchButton = fa.dom.get('button[type=submit]', searchForm);
		view = fa.dom.get('#view', elem);
		searchIcon = fa.dom.get('.search');
		searchBtn = fa.dom.get('.search-btn');
		isSearchOpen = false;

		showSearch = function() {
			searchForm.classList.remove('hidden');
			doSearchButton.classList.remove('hidden');
			movableElem.classList.add('move-right');
			searchIcon.classList.remove('search');
			searchIcon.classList.remove('icon');
			searchIcon.classList.add('reset');
			view.classList.add('foggy');
			view.classList.add('uninteractive');
			isSearchOpen = true;
		};
		hideSearch = function() {
			searchForm.classList.add('hidden');
			movableElem.classList.remove('move-right');
			doSearchButton.classList.add('hidden');
			searchIcon.classList.remove('reset');
			searchIcon.classList.add('search');
			searchIcon.classList.add('icon');
			view.classList.remove('foggy');
			view.classList.remove('uninteractive');
			isSearchOpen = false;
		};

		// the search form shows when search btn is clicked (1) and hides when
		// isSearchOpen is true and the search btn is clicked (2) and the form
		// is submitted (3)
		fa.dom.on(searchBtn, 'click', function() {
			if(!isSearchOpen) {  // (1)
				showSearch();
				queryField.focus();
			} else {  // (2)
				hideSearch();
			}
		});
		fa.dom.on(fa.dom.get('body'), 'keypress', function(e) {
			if (e.which === 0) {
				hideSearch();
			}
		});
		// no reset btn for now
		fa.dom.on(searchForm, 'submit', function(e) {
			e.preventDefault();
			if(queryField.value) {
				fa.routing.go('search/?q='+encodeURIComponent(queryField.value));
				queryField.blur();
				queryField.value = '';
				hideSearch();  // (3)
			}
		});

		// unread updates marker
		marker = fa.dom.get('.notification-marker', elem);

		fa.models.updates.changedStatus.add(function(status) {
			if(status == 'has-unread') {
				marker.classList.remove('hidden');
			} else {
				marker.classList.add('hidden');
			}
		});

		// logout
		fa.dom.on('[data-fn=logout]', 'click', function() {
			fa.auth.logout();
			fa.routing.go('login');
		});

		// the view object
		return Promise.resolve({
			remove: function() {
				fa.models.updates.changedStatus.removeAll();

				fa.nav.unreg(navLinks);

				fa.views.scrolledFarDown.removeAll();
				fa.views.scrolledBackUp.removeAll();
			}
		});
	};


	//
	// exports
	//

	return createInner;

}());
