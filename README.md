# @bigtest/server

To run the server:

``` sh
$ yarn start
```

Then open the following URL in a browser:

<http://localhost:24004/index.html?orchestrator=ws%3A%2F%2Flocalhost%3A24003>


To run the tests:

``` sh
$ yarn test
```

During development, you can use the `watch` script to watch any
process and restart it when the source files are changed. To watch and
restart a running server:

``` sh
$ yarn watch yarn start
```

To watch and restart the tests:

``` sh
$ yarn watch yarn test
```
