module.exports = {
  interactors: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'interactors/getting-started/quick-start',
        'interactors/getting-started/why-bigtest'
      ]
    },
    {
      type: 'category',
      label: 'Interactors',
      items: [
        'interactors/interactors/overview',
        'interactors/interactors/built-in-dom',
        'interactors/interactors/locators-filters-actions',
        'interactors/interactors/write-your-own',
        'interactors/interactors/asynchronous'
      ]
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'interactors/integrations/overview',
        'interactors/integrations/jest',
        'interactors/integrations/cypress'
      ]
    }
  ],
  platform: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'platform/getting-started/installation',
        'platform/getting-started/writing-your-first-test'
      ]
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'platform/guides/running-tests',
        'platform/guides/browser-config',
        'platform/guides/ci-setup',
        'platform/guides/code-coverage'
      ]
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'platform/concepts/test-tree',
        'platform/concepts/steps-assertions'
      ]
    }
  ],
};
