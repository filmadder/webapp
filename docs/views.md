# views

View constructors expect a dom element, the contents of which will be replaced
with the view's rendered template, and optionally a second argument which is
specific to the view. Apart from rendering a template in its given dom element,
a view function usually also attaches event listeners, inits sub-views, and
return a so-called view object. The latter can have the following properties:

* `nav`: string identifying the view with regards to the navigation; used for
  nav link highlighting; if set to `_`, the latter is cleared.
* `empty`: function that is invoked when the view is destroyed, before the
  sub-views are; often used to set fa.history's state.
* `remove`: function that is invoked when the view is destroyed, after the
  sub-views are; usually ends with `elem.innerHTML = '';`.


## list

- outer
	- login
	- reg

- inner: header, nav
	- user: sub-nav
		- seen, currently watching, watchlist: film lists
		- friends
		- tags
	- film
		- comments
		- tags
	- tag
	- search results
	- feed
	- notifications
	- settings

- error
- message
