module.exports = {
  siteMetadata: {
    title: `BigTest`,
    description: `Bigtest Description Beep`,
    author: `Frontside Inc.`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
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
    `gatsby-plugin-styled-components`,
    {
      resolve: "gatsby-plugin-postcss",
      options: {
        postCssPlugins: [
          require("precss")
        ]
      }
    },
  ],
}
