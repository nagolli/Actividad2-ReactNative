import { router, Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import ActionModal from '@/components/ui/action-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { isGameInProgress, setGameInProgress } from '@/db/database';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Layout de navegación por pestañas (Tabs) de la aplicación.
 * Proporciona tres pestañas principales:
 * 1. Inicio: Selección de modo y configuración del juego
 * 2. Juego: Pantalla principal de juego
 * 3. Perfil: Gestión de perfiles y estadísticas
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [showInProgressModal, setShowInProgressModal] = useState(false);

  return (
    <>
      <Tabs
        initialRouteName="init"
        screenOptions={{
          tabBarActiveTintColor: palette.tabIconSelected,
          tabBarInactiveTintColor: palette.tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            height: 74,
            borderTopWidth: 0,
            backgroundColor: palette.surface,
            marginHorizontal: 12,
            marginBottom: 12,
            borderRadius: 22,
            paddingTop: 8,
            paddingBottom: 8,
            position: 'absolute',
            ...styles.shadow,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="init"
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              const state = navigation.getState();
              const currentRouteName = state.routes[state.index]?.name;
              if (currentRouteName === 'init') return;

              if (isGameInProgress()) {
                e.preventDefault();
                setShowInProgressModal(true);
              }
            },
          })}
          options={{
            title: 'Ajustes',
            tabBarIcon: ({ color }) => <IconSymbol size={22} name="wrench.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="game"
          options={{
            title: 'Juego',
            tabBarIcon: ({ color }) => <IconSymbol size={22} name="play.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <IconSymbol size={22} name="person.fill" color={color} />,
          }}
        />
      </Tabs>

      <ActionModal
        visible={showInProgressModal}
        title="Partida en curso"
        subtitle="Si vas a Ajustes, se cerrará la partida actual y comenzarás una nueva configuración."
        primaryLabel="Continuar"
        onPrimaryPress={async () => {
          await setGameInProgress(false);
          setShowInProgressModal(false);
          router.navigate('/(tabs)/init');
        }}
        secondaryLabel="Cancelar"
        onSecondaryPress={() => setShowInProgressModal(false)}
        primaryVariant="danger"
      />
    </>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#0a1118',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
});