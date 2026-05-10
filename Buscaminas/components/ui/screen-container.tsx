import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  lightEndColor?: string;
  darkEndColor?: string;
}

export default function ScreenContainer({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  lightEndColor = '#deeaee',
  darkEndColor,
}: ScreenContainerProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const colors =
    colorScheme === 'dark'
      ? [palette.background, darkEndColor ?? palette.backgroundSoft]
      : [palette.background, lightEndColor];

  return (
    <LinearGradient colors={colors} style={[styles.gradient, style]}>
      {scroll ? (
        <ScrollView contentContainerStyle={contentContainerStyle}>{children}</ScrollView>
      ) : (
        <View style={contentContainerStyle}>{children}</View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
