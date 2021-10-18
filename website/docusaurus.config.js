module.exports = {
  title: 'Bigtest',
  tagline: 'Truly cross-browser testing',
  url: 'https://frontside.com/',
  baseUrl: '/bigtest/',
  onBrokenLinks: 'throw',
  favicon: 'images/favicon-bigtest.png',
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
      title: 'Bigtest',
      logo: {
        alt: 'Bigtest',
        src: 'images/bigtest-logo.svg'
      },
      items: [
        {
          to: '/docs',
          label: 'Docs',
          position: 'right',
        }, {
          to: '/about',
          label: 'Philosophy',
          position: 'right',
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
          title: 'About',
          items: [
            {
              label: "Maintained by Frontside",
              href: "https://fronside.com/",
            },
          ]
        },
        {
          title: "OSS Projects",
          items: [
            {
              label: "Interactors",
              href: "https://frontside.com/interactors",
            },
            {
              label: "Bigtest",
              to: "/",
            },
            {
              label: "Effection",
              href: "https://frontside.com/effection",
            },
          ],
        },
        {
          title: 'Bigtest Platform',
          items: [
            {
              label: 'About Bigtest',
              to: 'about/',
            },
            {
              label: 'Architecture',
              to: 'about#architecture',
            },
            {
              label: 'Projects',
              to: 'about#projects',
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
    image: 'images/meta-bigtest.png'
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          versions: {
            current: {
              banner: "none",
            },
          }
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  stylesheets: [
    'https://use.typekit.net/ugs0ewy.css'
  ],
  plugins: [
    [
      require.resolve("./plugins/docusaurus-plugin-vanilla-extract"),
      {
        /* options */
      },
    ],
  ],
  scripts: [
    {
      src: 'https://plausible.io/js/plausible.js',
      async: true,
      defer: true,
      'data-domain': 'frontside.com/bigtest'
    }
  ]
};
