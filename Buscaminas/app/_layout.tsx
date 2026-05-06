import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { initDatabase } from '../db/database';

/**
 * Configuración de Expo Router para establecer la pantalla de anclaje.
 * Define que la navegación por tabs debe ser la estructura raíz de la aplicación.
 */
export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Layout raíz de la aplicación.
 * Responsabilidades:
 * - Inicializar la base de datos SQLite al cargar la aplicación
 * - Aplicar el tema de colores (claro/oscuro) según la preferencia del sistema
 * - Configurar la estructura de navegación Stack con la navegación por Tabs
 * - Gestionar el StatusBar de la aplicación
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  /**
   * Inicializa la base de datos al montar el componente.
   * Crea las tablas necesarias (settings, profiles, games) si no existen.
   */
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
