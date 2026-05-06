import { useEffect, useState } from 'react';

import GameView from '../views/gameView';
import { getGameSettings } from '@/db/database';
import { useIsFocused } from '@react-navigation/native';
import Loading from '../views/loading';

/**
 * Pantalla principal del juego.
 * Carga la configuración del juego desde la base de datos y renderiza el componente GameView
 * con los parámetros correspondientes (bombas, filas, columnas).
 * 
 * Solo renderiza la pantalla cuando está enfocada para optimizar el rendimiento
 * y evitar cálculos innecesarios cuando la pantalla no es visible.
 */
export default function GameScreen() {
    const isFocused = useIsFocused();

    return isFocused ? <GameScreenUnmountable /> : null;
}

/**
 * Componente interno que carga y renderiza la pantalla del juego.
 * Se desmonta cuando la pantalla pierde el enfoque.
 */
function GameScreenUnmountable() {
    const [gameSettings, setGameSettings] = useState<{ bombs: number; columns: number; rows: number } | undefined>(undefined);

    /**
     * Carga la configuración del juego desde la base de datos al montar el componente.
     */
    useEffect(() => {
        const loadSettings = async () => {
            const settings = getGameSettings();
            if (settings) setGameSettings(settings);
        };
        loadSettings();
    }, []);

    if (!gameSettings) {
        return <Loading />;
    }
    return (
        <GameView
            bombs={gameSettings.bombs}
            columns={gameSettings.columns}
            rows={gameSettings.rows}
        />
    );
}
