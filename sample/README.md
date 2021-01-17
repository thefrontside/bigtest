# BigTest Sample

## Getting Started
You'll need to run `npm install` to be able to execute any of the scripts inside the `bin/` directory.

## Start App
```
$ npm start
```
This script `cd`'s into `app/` and executes `start-dev.js` script which will make a copy of `app-pkg.json` as `package.json`, install its dependencies, and then start the app.

The reason why we're using `cd` instead of `--cwd app/` is because that syntax is only available when using `yarn`.

## Run Tests
```
$ npm run test:jest
$ npm run test:cypress
$ npm run test:bigtest
```

## Install Published App
Install the app using npx:
```
$ npx bigtest-sample
```

You can use `--yarn` or `-Y` flags to use yarn instead:
```
$ npx bigtest-sample --yarn
```