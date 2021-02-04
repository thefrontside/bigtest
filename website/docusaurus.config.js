module.exports = {
  title: 'BigTest',
  tagline: 'Truly cross-browser testing',
  url: 'https://frontside.com',
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
    prism: {
      theme: require('prism-react-renderer/themes/nightOwl'),
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
    googleAnalytics: {
      trackingID: 'UA-44597640-4'
    },
    image: 'images/meta-image.png'
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
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
};
