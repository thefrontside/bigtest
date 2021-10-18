import { keyframes, style } from "@vanilla-extract/css";
import vars, {
  laptopQuery,
  desktopQuery,
  darkThemeQuery,
} from "./frontside-theme.css";
import './docusaurus.css';
import { heroText } from "./page.css";

export const heroDemo = style([{
  textAlign: 'left',
  marginTop: vars.space.md,
  '@media': {
    [laptopQuery]: {
      flexShrink: 0,
      width: '50%',
      marginTop: 0,
    }
  }
}]);

const iframeLoading = keyframes({
  '0%': {
    background: '#091a35',
  },
  '50%': {
    background: '#153a75',
  },
  '100%': {
    background: '#040e1f',
  },
});

export const iframeDemo = style([{
  width: '535px',
  height: '665px',
  outline: 'none',
  border: 'none',
  overflow: 'hidden',
  background: '#091a35',
  borderRadius: '10px',
  animation: `1s 1 ${iframeLoading}`,
  marginRight: 'auto',
  marginLeft: 'auto',
  display: 'block',
}]);

export const centeredHeroText = style([heroText, {
  justifyContent: 'center',
  display: 'flex',
  flexFlow: 'column nowrap',
  alignItems: 'flex-start'
}]);
