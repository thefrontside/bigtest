import { createGlobalStyle } from 'styled-components';
import * as CSS from 'csstype';
import reset from 'styled-reset-advanced';
import base, { Base } from './base';

interface BrandColors {
  pink: CSS.ColorProperty;
  skyBlue: CSS.ColorProperty;
  darkBlue: CSS.ColorProperty;
}

const brand: BrandColors = {
  pink: '#f74d7b',
  skyBlue: '#26abe8',
  darkBlue: '#14315d',
};

interface ColorTheme {
  brand: BrandColors;
  background: CSS.ColorProperty;
  bodyCopy: CSS.ColorProperty;
  primary: CSS.ColorProperty;
  secondary: CSS.ColorProperty;
  contrast: CSS.ColorProperty;
  disabled: CSS.ColorProperty;
  footer: CSS.ColorProperty;
  didyouknow: CSS.ColorProperty;
}

interface Theme extends Base {
  name: string;
  colors: ColorTheme;
}

const LightTheme: Theme = {
  ...base,
  name: 'light',
  colors: {
    brand,
    background: '#ffffff',
    bodyCopy: '#1a1a1a',
    primary: brand.darkBlue,
    secondary: brand.skyBlue,
    contrast: brand.pink,
    disabled: '#C0C0C0',
    footer: '#E7EAEE',
    didyouknow: '#E9F6FD',
  },
};

const DarkTheme: Theme = {
  ...base,
  name: 'dark',
  colors: {
    brand,
    background: '#14191e',
    bodyCopy: '#b3b3b3',
    primary: '#ffffff',
    secondary: brand.skyBlue,
    contrast: brand.pink,
    disabled: '#C0C0C0',
    footer: '#E7EAEE',
    didyouknow: '#E9F6FD',
  },
};

const GlobalTheme = createGlobalStyle<{ theme: Theme }>`
  ${reset};

  body {
    background: ${({ theme }) => theme.colors.background};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 20px;
    line-height: ${({ theme }) => theme.lineHeights.body};
  }
`;

export { GlobalTheme, LightTheme, DarkTheme };
