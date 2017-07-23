# views

These are the `create*` functions found in `views.js`. Each of these takes as
first argument the dom element that the view will init or operate; they can also
take an optional second argument (most of them do), which is specific to the
view. A view usually renders a template in its given dom element, attaches event
listeners, and inits sub-views. View functions could return a so-called view
object, which can have the following properties:

* `nav`: string identifying the view with regards to the navigation; used for
  nav link highlighting; if set to `_`, the latter is cleared.
* `empty`: function that is invoked when the view is destroyed, before the
  sub-views are; often used to set fa.history's state.
* `remove`: function that is invoked when the view is destroyed, after the
  sub-views are; usually ends with `elem.innerHTML = '';`.
