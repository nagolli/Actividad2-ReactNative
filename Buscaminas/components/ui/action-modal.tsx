import AppButton from '@/components/ui/app-button';
import SurfaceCard from '@/components/ui/surface-card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface ActionModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel: string;
  onSecondaryPress: () => void;
  primaryVariant?: 'accent' | 'danger';
  onRequestClose?: () => void;
  showCloseButton?: boolean;
  dismissOnBackdropPress?: boolean;
  onDismiss?: () => void;
}

export default function ActionModal({
  visible,
  title,
  subtitle,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  primaryVariant = 'accent',
  onRequestClose,
  showCloseButton = false,
  dismissOnBackdropPress = false,
  onDismiss,
}: ActionModalProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const handleDismiss = onDismiss ?? onSecondaryPress;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onRequestClose ?? onSecondaryPress}>
      <View style={styles.backdrop}>
        {dismissOnBackdropPress ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
        ) : null}

        <SurfaceCard style={styles.modalCard}>
          {showCloseButton ? (
            <Pressable style={styles.closeButton} onPress={handleDismiss}>
              <Text style={[styles.closeButtonText, { color: palette.textMuted }]}>✕</Text>
            </Pressable>
          ) : null}

          <Text style={[styles.modalTitle, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.modalSubtitle, { color: palette.textMuted }]}>{subtitle}</Text>

          <AppButton
            label={primaryLabel}
            onPress={onPrimaryPress}
            variant={primaryVariant === 'danger' ? 'danger' : 'accent'}
            style={styles.primaryButton}
          />

          <AppButton
            label={secondaryLabel}
            onPress={onSecondaryPress}
            variant="soft"
            style={styles.secondaryButton}
          />
        </SurfaceCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 14, 20, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 27,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  primaryButton: {
    marginBottom: 10,
  },
  secondaryButton: {
    paddingVertical: 13,
  },
});
