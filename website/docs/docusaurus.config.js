module.exports = {
  title: 'BigTest',
  tagline: 'Truly cross-browser testing',
  url: 'https://bigtestjs.io',
  baseUrl: '/',
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
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/',
            }
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
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
  ]
};
