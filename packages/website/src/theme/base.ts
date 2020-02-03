import * as CSS from 'csstype';

export interface LineHeights {
  body: CSS.LineHeightProperty<number>;
  heading: CSS.LineHeightProperty<number>;
}

export interface FontWeights {
  light: CSS.FontWeightAbsolute;
  body: CSS.FontWeightAbsolute;
  bold: CSS.FontWeightAbsolute;
}

export interface Breakpoints {
  small: string;
  medium: string;
  large: string;
  xLarge: string;
}

export interface Sizes {
  xxSmall: string;
  xSmall: string;
  small: string;
  medium: string;
  large: string;
  xLarge: string;
  xxLarge: string;
  xxxLarge: string;
}

export interface Fonts {
  body: string;
  heading: string;
  monospace: string;
}

export interface Base {
  breakpoints: Breakpoints;
  fonts: Fonts;
  fontSizes: Sizes;
  fontWeights: FontWeights;
  lineHeights: LineHeights;
  space: Sizes;
}

const base: Base = {
  breakpoints: {
    small: '36rem',
    medium: '48rem',
    large: '64rem',
    xLarge: '75rem',
  },
  fonts: {
    body: '"Fright Text Pro", freight-text-pro, serif',
    heading: '"Proxima Nova", proxima-nova, sans-serif',
    monospace: 'monospace',
  },
  fontSizes: {
    xxSmall: '0.625rem',
    xSmall: '0.75rem',
    small: '0.875rem',
    medium: '1rem',
    large: '1.38rem',
    xLarge: '1.65rem',
    xxLarge: '2rem',
    xxxLarge: '2.25rem',
  },
  fontWeights: {
    light: 300,
    body: 400,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  space: {
    xxSmall: '0rem',
    xSmall: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
    xLarge: '4rem',
    xxLarge: '8rem',
    xxxLarge: '16rem',
  },
};

export default base;
