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
