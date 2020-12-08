module.exports = {
  interactors: [
    'interactors/quick-start',
    'interactors/built-in-dom',
    'interactors/locators-filters-actions',
    'interactors/write-your-own',
    'interactors/integrations'
  ],
  platform: [
    'platform/installation',
    'platform/writing-your-first-test',
    'platform/running-tests'
  ],
  bigtest: require('./sidebars/typedoc-bigtest-sidebar'),
  interactor: require('./sidebars/typedoc-interactor-sidebar'),
  suite: require('./sidebars/typedoc-suite-sidebar')
};