import React from 'react';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';

import ThemeProvider from '../theme';
import Navbar from './navbar';
import Footer from './footer';

const Layout = ({ children }) => {
  return (
    <StaticQuery
      query={graphql`
        query HeadingQuery {
          site {
            siteMetadata {
              title,
              description,
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
          </Helmet>
          <ThemeProvider>
            <Navbar siteTitle={data.site.siteMetadata.title} />
            {children}
            <Footer />
          </ThemeProvider>
        </main>
      )}
    />
  );
};

export default Layout;
