# errors

A conceptualisation about the app: stuff goes upstream through promises and
downstream through signals. Errors are what promises are rejected with, and
these should be {code, message} objects.


## error codes

* `forbidden`
* `not_found`
* `bad_input`
* `bug`
* `pending`


## logging

When an error would make it to the user in some form, then calls to `log.trace`
and `log.warn` on its way there should be enough. Use `log.error` when an error
would otherwise silently disappear.
