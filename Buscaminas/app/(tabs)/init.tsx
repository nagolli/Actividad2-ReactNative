import React from 'react';
import SelectMode from '../views/selectMode';

/**
 * Pantalla de inicio de la aplicación.
 * Renderiza el componente SelectMode que permite al usuario seleccionar
 * la dificultad del juego (presets) o personalizar la configuración.
 */
export default function InitScreen() {
    return (
        <SelectMode />
    );
}