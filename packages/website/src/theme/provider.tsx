import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { DarkTheme, LightTheme, GlobalTheme } from './global';

const getBrowserTheme = (): string => {
  // const mql = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')) || undefined;
  // return mql && mql.matches ? 'dark' : 'light';
  return 'light';
};

const ThemeProvider: React.FC = ({ children }) => {
  return (
    <StyledThemeProvider theme={getBrowserTheme() === 'dark' ? DarkTheme : LightTheme}>
      <GlobalTheme />
      {children}
    </StyledThemeProvider>
  )
}

export default ThemeProvider;
