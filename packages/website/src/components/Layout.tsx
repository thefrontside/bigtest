import React from 'react';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';

import ThemeProvider from '../theme';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <StaticQuery
      query={graphql`
        query HeadingQuery {
          site {
            siteMetadata {
              title
              description
            }
          }
        }
      `}
      render={data => (
        <main>
          <Helmet>
            <html lang="en" />
            <title>{data.site.siteMetadata.title}</title>
            <meta name="description" content={data.site.siteMetadata.description} />
            <link rel="stylesheet" href="https://use.typekit.net/gyc5wys.css"></link>
          </Helmet>
          <ThemeProvider>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </main>
      )}
    />
  );
};

export default Layout;
