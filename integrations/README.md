This directory contains BigTest integration for Cypress. The reason why there is a separate monorepo is so that we can separate the dependencies of this directory from the BigTest core components in order to provide a better developer experience.

## Development
### Install/Build
To develop packages inside the integrations directory, you can run `yarn install` and `yarn prepack` from the root of the BigTest repository and it will install/prepack both the integrations and the BigTest core components.

Or if you would like to install and build only the packages inside integrations, you can run `yarn install:integrations` and `yarn prepack:integrations`.

### Publishing
One feature we were not able to include in this duo-monorepo setup is its versioning and publishing workflow. The changesets github action will only run from the root of the repository so the changesets of packages that are not specified in the workspaces at the root will never be consumed. If you are adding features to any of the integrations packages, you will need to bump the package version manually in your pull request.