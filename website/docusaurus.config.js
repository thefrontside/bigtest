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
              label: 'Docs',
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
        // TypeDoc options
        // https://typedoc.org/guides/options/
        target: 'esnext',
        // https://typedoc.org/guides/options/#mode
        // we may want to try library mode at some point
        // but our plugins don't support it yet
        mode: 'file',
        // parse the .d.ts files?
        includeDeclarations: false,
        // Prevent externally resolved
        // TypeScript files from being documented
        excludeExternals: true,
        // removes local symbols from the generated documentation
        // doesn't seem to work?
        excludeNotExported: true,
        // within a class, ignore private
        excludePrivate: true,
        // within a class, ignore protected
        excludeProtected: true,
        // remove anything with @internal
        stripInternal: true,
        // we get errors for types in deps
        // just ignore them, as it should
        // compile for us at by PR merge
        ignoreCompilerErrors: true,
        includeVersion: true,
        disableSources: false,
        // more for APIs, not really used but be explicit
        excludeTags: false,
        readme: 'none',
        // on the Index page, group within each
        // by the groups defined in the typedoc
        // comments, order by categoryOrder
        categorizeByGroup: true,
        defaultCategory: 'Other',
        categoryOrder: [
          'Interactors',
          'Init',
          'Helper',
          '*',
          'Other'
        ],

        // docusaurus options
        out: 'interactors/api',
        sidebar: {
          sidebarFile: './sidebars/typedoc-interactor-sidebar.js',
          fullNames: true,
          readmeLabel: 'none',
          globalsLabel: 'Index',
        },
        // this options makes the plugin use a
        // different renderer / grouping which seems
        // to give us a better results than false
        allReflectionsHaveOwnDocument: true,
      }
    ]
  ]
};
