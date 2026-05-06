import { router } from 'expo-router';

/**
 * Enumeración con las diferentes vistas disponibles en la aplicación.
 * Utilizadas para la navegación entre pantallas usando Expo Router.
 */
export enum Views {
    /**
     * Vista de inicialización/selección de modo (pantalla de selección de dificultad)
     */
    Init = './init',
    /**
     * Vista principal del juego (tablero y estado del juego en vivo)
     */
    Game = "./game",
    /**
     * Vista del perfil del jugador (historial, gestión de perfiles)
     */
    Profile = "./profile"
}

/**
 * Navega a una vista específica usando Expo Router.
 * Utiliza router.replace para cambiar la vista actual sin añadir a la pila de navegación.
 * 
 * @param view - Vista a la cual navegar (debe ser un valor del enum Views)
 */
export const navigateToView = (view: Views) => {
    router.replace(view);
}