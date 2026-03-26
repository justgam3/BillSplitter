import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#212121',           // Dark Grey - Main accent
    secondary: '#BDBDBD',         // Light Grey - Secondary accent
    error: '#D32F2F',             // Red - Error color
    surface: '#FFFFFF',           // White - Cards, dialogs, sheets
    background: '#F5F5F5',        // Very Light Grey - Background
    onPrimary: '#FFFFFF',         // White text on primary
    onSecondary: '#000000',       // Black text on secondary
    onSurface: '#000000',         // Text on surface
    onBackground: '#000000',      // Text on background
    outline: '#BDBDBD',           // Outlines and borders
  },
  roundness: 8,
};

export default theme;
