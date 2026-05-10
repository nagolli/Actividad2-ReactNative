import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { navigateToView, Views } from '@/utils/viewsEnum';

/**
 * Componente reutilizable que renderiza un botón de pestaña personalizado.
 * Proporciona feedback táctil al presionar y muestra un ícono con color dinámico.
 * 
 * @param icon - Nombre del ícono a mostrar (debe ser un nombre válido de IconSymbol)
 * @param label - Etiqueta descriptiva del botón (accesibilidad)
 * @param onPress - Función callback que se ejecuta al presionar el botón
 * @param color - Color del ícono
 */
const TabButton = ({ icon, label, onPress, color }: { icon: string; label: string; onPress: () => void; color: string }) => {
  return (
    <Pressable
      onPress={onPress}
      style={styles.tabButton}
    >
      <IconSymbol size={28} name={icon as any} color={color} />
    </Pressable>
  );
};

/**
 * Layout de navegación por pestañas (Tabs) de la aplicación.
 * Proporciona tres pestañas principales:
 * 1. Inicio: Selección de modo y configuración del juego
 * 2. Juego: Pantalla principal de juego
 * 3. Perfil: Gestión de perfiles y estadísticas
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      initialRouteName="init"
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="init"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="wrench.fill" color={color} />,
          tabBarButton: (props) => (
            <TabButton
              icon="wrench.fill"
              label="Inicio"
              onPress={() => {
                navigateToView(Views.Init);
              }
              }
              color={tintColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Juego',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="play.fill" color={color} />,
          tabBarButton: (props) => (
            <TabButton
              icon="play.fill"
              label="Juego"
              onPress={() => {
                navigateToView(Views.Game);
              }}
              color={tintColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          tabBarButton: (props) => (
            <TabButton
              icon="person.fill"
              label="Perfil"
              onPress={() => {
                navigateToView(Views.Profile);
              }}
              color={tintColor}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});