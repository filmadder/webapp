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
		var heading, navLinks;
		var viewElem, navElem, movableElem;
		var searchForm, queryField, doSearchButton, searchIcon, searchBtn;
		var showNav, hideNav, showSearch, hideSearch;
		var isNavOpen = false, isSearchOpen = false;
		var marker, hammerManager;

		fa.views.render(elem, 'inner', {user: fa.auth.getUser()});

		// nav: active links
		navLinks = fa.dom.filter('header nav a', elem);
		fa.nav.reg(navLinks);

		// change heading
		heading = fa.dom.get('h1');

		fa.views.scrolledFarDown.add(function() {
			heading.textContent = getTitleEnd();
		});
		fa.views.scrolledBackUp.add(function() {
			heading.textContent = 'film adder';
		});

		// nav: open and close
		movableElem = fa.dom.get('.header-inner', elem);
		navElem = fa.dom.get('.nav', elem);
		viewElem = fa.dom.get('#view', elem);

		showNav = function() {
			if(!isNavOpen) {
				navElem.classList.remove('hidden');
				movableElem.classList.add('move-left');
				viewElem.classList.add('uninteractive');
				isNavOpen = true;
			}
		};
		hideNav = function() {
			if(isNavOpen) {
				navElem.classList.add('hidden');
				movableElem.classList.remove('move-left');
				viewElem.classList.remove('uninteractive');
				isNavOpen = false;
			}
		};

		fa.dom.on(fa.dom.get('.nav-opener', elem), 'click', function() {
			if(!isNavOpen) showNav();
			else hideNav();
		});
		fa.dom.on(viewElem, 'click', hideNav);
		fa.dom.on(navLinks, 'click', hideNav);

		// hammer js
		hammerManager = new Hammer.Manager(elem);
		hammerManager.add(new Hammer.Swipe({
			direction: Hammer.DIRECTION_HORIZONTAL
		}));
		hammerManager.on('swiperight', showNav);
		hammerManager.on('swipeleft', hideNav);

		// search form
		searchForm = fa.dom.get('#search-form', elem);
		queryField = fa.dom.get('[name=q]', searchForm);
		doSearchButton = fa.dom.get('button[type=submit]', searchForm);
		searchIcon = fa.dom.get('.search', elem);
		searchBtn = fa.dom.get('.search-btn', elem);

		showSearch = function() {
			searchForm.classList.remove('hidden');
			doSearchButton.classList.remove('hidden');
			movableElem.classList.add('move-right');
			searchIcon.classList.remove('search');
			searchIcon.classList.remove('icon');
			searchIcon.classList.add('reset');
			viewElem.classList.add('foggy');
			viewElem.classList.add('uninteractive');
			isSearchOpen = true;
		};
		hideSearch = function() {
			searchForm.classList.add('hidden');
			movableElem.classList.remove('move-right');
			doSearchButton.classList.add('hidden');
			searchIcon.classList.remove('reset');
			searchIcon.classList.add('search');
			searchIcon.classList.add('icon');
			viewElem.classList.remove('foggy');
			viewElem.classList.remove('uninteractive');
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

		fa.dom.on(document.body, 'keypress', function(e) {
			if (e.which === 0) {
				hideSearch();
			}
		});

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
				hammerManager.destroy();

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
