# film adder: the webapp

This is the home of [film adder](https://filmadder.com/)'s
[webapp](https://app.filmadder.com/).


## setup

```sh
npm install
bower install
npm run watch
```

The last one starts a development server at `localhost:9000`.


## tests

There are some `tests`. If you want to run them, the following executables
should find themselves in `bin` (symlinks would also do):

* `bin/selenium-server-standalone-3.4.0.jar`, downloadable from Selenium's
  [downloads page](http://selenium-release.storage.googleapis.com/index.html).
* `bin/geckodriver`, use the latest version downloadable from the geckodriver's
  [releases page on GitHub](https://github.com/mozilla/geckodriver/releases).

Of course, you are welcome to use another WebDriver, but you should change the
`nightwatch.json` configuration accordingly.
