module.exports = {
  title: 'BigTest',
  tagline: 'Truly cross-browser testing',
  url: 'https://bigtestjs.io',
  baseUrl: '/bigtest/',
  onBrokenLinks: 'throw',
  favicon: 'images/favicon.png',
  organizationName: 'thefrontside',
  projectName: 'bigtest',
  themeConfig: {
    colorMode: {
      disableSwitch: true,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'BigTest',
        src: 'images/bigtest-logo@2x.png',
        srcDark: 'images/logo-dark@2x.png'
      },
      items: [
        {
          to: '/interactors',
          activeBaseRegex: '(interactors)|(docs\/interactors)',
          label: 'Interactors',
          position: 'left',
        },{
          to: '/platform',
          activeBaseRegex: '(platform)|(docs\/platform)',
          label: 'Platform',
          position: 'left',
        }, {
          to: '/about',
          label: 'About',
          position: 'left'
        }, {
          href: 'https://github.com/thefrontside/bigtest',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://discord.gg/r6AvtnU',
          label: 'Discord',
          position: 'right',
        }
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Interactors',
          items: [
            {
              label: 'About Interactors',
              to: 'interactors/',
            },
            {
              label: 'Getting Started',
              to: 'docs/interactors/',
            },
            {
              label: 'API',
              to: 'docs/interactors/',
            }
          ],
        },
        {
          title: 'Platform',
          items: [
            {
              label: 'About the BigTest platform',
              to: 'platform/',
            },
            {
              label: 'Introduction',
              to: 'docs/platform/',
            }
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/r6AvtnU',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/thefrontside/bigtest',
            }
          ],
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The Frontside Software, Inc.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/thefrontside/bigtest/tree/v0/website',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  stylesheets: [
    'https://use.typekit.net/gyc5wys.css'
  ],
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'typedoc-interactor',
        inputFiles: ['../packages/interactor/src'],
        tsconfig: '../packages/interactor/tsconfig.json',
        // TypeDoc options (see typedoc --help)
        out: 'interactors/api',
        readme: '../packages/interactor/API.md',
        ignoreCompilerErrors: true,
        target: 'esnext',
        mode: 'file',
        sidebar: {
          sidebarFile: './sidebars/typedoc-interactor-sidebar.js',
          fullNames: false,
          readmeLabel: 'README',
          globalsLabel: 'Globals',
        },
        includeDeclarations: true,
        excludeExternals: true,
        ignoreCompilerErrors: true,
        allReflectionsHaveOwnDocument: true
      }
    ]
  ]
};
