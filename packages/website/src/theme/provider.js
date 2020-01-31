import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { DarkTheme, LightTheme, GlobalTheme } from './global';

// manually changing for now for development
const getBrowserTheme = () => {
  // const mql = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')) || undefined;

  // return mql && mql.matches ? 'dark' : 'light';
  return 'light';
};

const ThemeProvider = ({ children }) => {
  return (
    <StyledThemeProvider theme={getBrowserTheme() === 'dark' ? DarkTheme : LightTheme}>
      <GlobalTheme />
      {children}
    </StyledThemeProvider>
  )
}

export default ThemeProvider;
