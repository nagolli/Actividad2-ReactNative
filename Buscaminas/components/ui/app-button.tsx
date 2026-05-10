import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'accent' | 'danger' | 'soft';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AppButton({
  label,
  onPress,
  variant = 'accent',
  style,
  textStyle,
}: AppButtonProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const backgroundColor =
    variant === 'danger' ? palette.danger :
      variant === 'soft' ? palette.tintSoft :
        palette.tint;

  const borderWidth = variant === 'soft' ? 1 : 0;
  const borderColor = palette.border;
  const color = variant === 'soft' ? palette.text : '#ffffff';

  return (
    <Pressable
      style={[styles.button, { backgroundColor, borderWidth, borderColor }, style]}
      onPress={onPress}>
      <Text style={[styles.buttonText, { color }, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts?.rounded,
  },
});
