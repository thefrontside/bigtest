module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['getting-started/installation', 'getting-started/your-first-test'],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        {
          type: 'category',
          label: 'Interactors',
          items: [
            'interactors/introduction',
            'interactors/built-in',
            'interactors/custom',
          ]
        },
        {
          type: 'category',
          label: 'Development Workflow',
          items: [
            'development/running-tests',
            'development/ci-setup'
          ]
        },
        'browser-config',
        'code-coverage'
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/test-tree',
        'concepts/steps-assertions'
      ]
    }
  ],
};
