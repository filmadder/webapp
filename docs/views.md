# views

The views are Crockford-style constructors that expect a dom element, the
contents of which will usually be replaced with a rendered template, and
optionally a second argument which is specific to the view. View constructors
request data, render it, attach event listeners, and init sub-views. Views
should always return a promise that either resolves into the so-called view
object or rejects with a {code, message} error. View objects can have the
following properties:

* `nav`: string identifying the view with regards to the navigation; used for
  nav link highlighting; if set to `_`, the latter is cleared.
* `title`: string or array to be passed onto `fa.title`.
* `empty`: function that is invoked when the view is destroyed, before the
  sub-views are; often used to set fa.history's state.
* `remove`: function that is invoked when the view is destroyed, after the
  sub-views are.


## list

- outer
	- login
	- reg

- inner: header, nav
	- user: sub-nav, friendship controls
		- films (seen, currently watching, watchlist)
		- friends
		- tags
	- film
		- comments
		- tags
	- tag
	- search results
	- feed
	- updates (notifications)
	- settings

- error
- message
