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

export interface Fonts {
  body: string;
  heading: string;
  monospace: string;
}

export interface Base {
  absoluteSize: string;
  breakpoints: string[];
  fonts: Fonts;
  fontSizes: string[];
  fontWeights: FontWeights;
  lineHeights: LineHeights;
  space: string[];
}

const base: Base = {
  absoluteSize: '20px',
  breakpoints: [600, 768, 1280, 1500].map(n => n + 'px'),
  fonts: {
    body: '"Fright Text Pro", freight-text-pro, serif',
    heading: '"Proxima Nova", proxima-nova, sans-serif',
    monospace: 'monospace',
  },
  fontSizes: [0.625, 0.75, 0.875, 1, 1.21, 1.63, 2.06, 2.62].map(n => n + 'rem'),
  fontWeights: {
    light: 300,
    body: 400,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  space: [0, 0.3819, 0.6118, 1, 1.6103, 2.618, 4.236, 6.8541].map(n => n + 'rem'),
};

const breakpointAliases: string[] = ['small', 'medium', 'large', 'xLarge'];

const sizeAliases: string[] = ['xxSmall', 'xSmall', 'small', 'medium', 'large', 'xLarge', 'xxLarge', 'xxxLarge'];

base.fontSizes.forEach((_, index: number): void => {
  base.fontSizes[sizeAliases[index]] = base.fontSizes[index];
});

base.space.forEach((_, index: number): void => {
  base.space[sizeAliases[index]] = base.space[index];
});

base.breakpoints.forEach((_, index: number): void => {
  base.breakpoints[breakpointAliases[index]] = base.breakpoints[index];
});

export default base;
