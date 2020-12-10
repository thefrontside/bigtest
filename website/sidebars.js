module.exports = {
  interactors: [
    'interactors/quick-start',
    'interactors/built-in-dom',
    'interactors/locators-filters-actions',
    'interactors/write-your-own',
    'interactors/integrations',
    {
      "type": "category",
      "label": "API",
      "items": require('./sidebars/typedoc-interactor-sidebar')
    },
  ],
  platform: [
    'platform/installation',
    'platform/writing-your-first-test',
    'platform/running-tests',
    'platform/architecture',
  ],
};
