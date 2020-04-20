[![Chat on Discord](https://img.shields.io/discord/700803887132704931?Label=Discord)](https://discord.gg/4PyXfb)

## Development

### Installation

1. Clone this repository `git clone git@github.com:thefrontside/bigtest.git`
2. Run `yarn`

### Building

Many of the packages in this repository depend on each other in order
to function. However, being assembled from TypeScript and HTML
webapps, these packages need to be built before they can be
consumed. In order to build dependencies

``` shell
$ yarn prepack
```

This will compile each package into the state in which it will
ultimately appear on NPM.

### Running tests

1. Run `yarn` to ensure that all dependencies are installed
2. Run `yarn test` to run automated tests
