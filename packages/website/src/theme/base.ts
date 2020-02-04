import * as CSS from 'csstype';

export interface LineHeights {
  body: CSS.LineHeightProperty<number>;
  heading: CSS.LineHeightProperty<number>;
};

export interface FontWeights {
  light: CSS.FontWeightAbsolute;
  body: CSS.FontWeightAbsolute;
  bold: CSS.FontWeightAbsolute;
};

export interface Fonts {
  body: string;
  heading: string;
  monospace: string;
};

export interface Base {
  breakpoints: string[];
  fonts: Fonts;
  fontSizes: string[];
  fontWeights: FontWeights;
  lineHeights: LineHeights;
  space: string[];
};

const base: Base = {
  breakpoints: [36, 48, 64, 75].map(n => n + 'rem'),
  fonts: {
    body: '"Fright Text Pro", freight-text-pro, serif',
    heading: '"Proxima Nova", proxima-nova, sans-serif',
    monospace: 'monospace',
  },
  fontSizes: [0.625, 0.75, 0.875, 1, 1.38, 1.65, 2, 2.25].map(n => n + 'rem'),
  fontWeights: {
    light: 300,
    body: 400,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  space: [0, 0.25, 0.5, 1, 2, 4, 8, 16].map(n => n + 'rem'),
};

const breakpointAliases: string[] = ['small', 'medium', 'large', 'xLarge'];
const sizeAliases: string[] = [
  'xxSmall',
  'xSmall',
  'small',
  'medium',
  'large',
  'xLarge',
  'xxLarge',
  'xxxLarge',
];

base.fontSizes.forEach((_: any, index: number): void => {
  base.fontSizes[sizeAliases[index]] = base.fontSizes[index];
});

base.space.forEach((_: any, index: number): void => {
  base.space[sizeAliases[index]] = base.space[index];
});

base.breakpoints.forEach((_, index: number): void => {
  base.breakpoints[breakpointAliases[index]] = base.breakpoints[index];
});

export default base;
