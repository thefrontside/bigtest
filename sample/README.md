# BigTest Sample App

The BigTest Sample app shows some examples of using BigTest and Interactors to programatically test a web app.

This repository contains the files that are created when someone runs the command `npx bigtest-sample` to generate their own app, as they are following along with [the Quick Start](https://frontside.com/bigtest/docs/interactors).

## Getting Started
You'll need to run `npm install` to be able to execute any of the scripts inside the `bin/` directory.

## Start App
```
$ npm start
```
This script `cd`'s into `app/` and executes `start-dev.js` script which will make a copy of `app-pkg.json` as `package.json`, install its dependencies, and then start the app.

The reason why we're using `cd` instead of `--cwd app/` is because that syntax is only available when using `yarn`.

### Modifying Sample App
To add dependencies to the sample app, you will need to modify `./app/app-pkg.json` because `./app/package.json` does not get published.

## Run Tests

This sample app has multiple testing libraries installed so that you can see how Interactors fit into your existing test suite.

```
$ npm run test:bigtest
$ npm run test:jest
$ npm run test:cypress
```

## Install Published App

Generate a new sample app using npx:
```
$ npx bigtest-sample
```

You can use `--yarn` or `-Y` flags to use yarn instead:
```
$ npx bigtest-sample --yarn
```

## Publishing BigTest Sample

This is a note for the project maintainers.
If you make changes to this package, please bump the package version manually.