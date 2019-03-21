module.exports = {
  pathPrefix: '/tippyjs',
  siteMetadata: {
    title: `Tippy.js`,
    description: `A simple, easy-to-use vanilla JavaScript library for creating tooltips and popovers to use in web sites and apps. The flat-level option API makes customizing a tooltip and popover as easy as adding a single object property or data attribute. Make tooltips follow the mouse cursor, have an arrow, change duration and delay, have custom themes and animations, HTML content, touch support, and more...`,
    author: `@atomiks`,
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
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/favicon.png`,
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-61550002-7',
        head: false,
      },
    },
    `gatsby-plugin-catch-links`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.app/offline
    // 'gatsby-plugin-offline',
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-mdx`,
      options: {
        defaultLayouts: {
          default: require.resolve('./src/components/Layout.js'),
        },
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: 'language-',
              inlineCodeMarker: null,
              aliases: {},
            },
          },
        ],
      },
    },
  ],
}
