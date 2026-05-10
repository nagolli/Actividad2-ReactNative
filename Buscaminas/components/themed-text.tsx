import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts?.sans,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: Fonts?.rounded,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
    fontFamily: Fonts?.rounded,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 21,
    fontWeight: '700',
    fontFamily: Fonts?.rounded,
  },
  link: {
    lineHeight: 24,
    fontSize: 16,
    color: '#0f766e',
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
    fontFamily: Fonts?.sans,
  },
});
