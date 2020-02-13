module.exports = {
  siteMetadata: {
    title: `BigTest`,
    description: `Bigtest Description Beep`,
    author: `Frontside Inc.`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-plugin-mailchimp`,
      options: {
        endpoint: 'https://bigtestjs.us4.list-manage.com/subscribe/post?u=dbd3b1801544458c2dc306723&amp;id=10a2fa1562',
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `bigtest`,
        short_name: `bigtest`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/frontside/bigtest-icon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        postCssPlugins: [require('precss')],
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-typescript`,
    `gatsby-transformer-sharp`,
    {
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        typekit: {
          id: 'gyc5wys'
        }
      }
    },
    `gatsby-plugin-netlify`
  ],
};
