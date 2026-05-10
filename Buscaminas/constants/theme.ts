/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0f766e';
const tintColorDark = '#34d399';

export const Colors = {
  light: {
    text: '#13212b',
    textMuted: '#4f6170',
    background: '#f4f7f9',
    backgroundSoft: '#e9eff3',
    surface: '#ffffff',
    surfaceAlt: '#f2f6f9',
    tint: tintColorLight,
    tintSoft: '#dff6f1',
    border: '#d4dde4',
    danger: '#d64545',
    success: '#178f58',
    icon: '#6a7985',
    tabIconDefault: '#7a8a97',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#e6edf3',
    textMuted: '#9caaba',
    background: '#0d1318',
    backgroundSoft: '#121d24',
    surface: '#15222b',
    surfaceAlt: '#1b2b36',
    tint: tintColorDark,
    tintSoft: '#1f3f3a',
    border: '#233744',
    danger: '#ff6b6b',
    success: '#34d399',
    icon: '#92a0ad',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  web: {
    sans: "'Avenir Next', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
