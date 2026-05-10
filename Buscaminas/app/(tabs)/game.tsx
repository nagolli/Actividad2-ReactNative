import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { getGameSettings } from '@/db/database';
import { UnmountOnBlur } from '@/hooks/unmountOnBlur';
import GameView from '../views/gameView';
import Loading from '../views/loading';

/**
 * Componente interno que carga y renderiza la pantalla del juego.
 * Se desmonta cuando la pantalla pierde el enfoque.
 */
export default function GameScreen() {
    const [gameSettings, setGameSettings] = useState<{ bombs: number; columns: number; rows: number } | undefined>(undefined);

    const loadSettings = useCallback(() => {
        const settings = getGameSettings();
        if (settings) setGameSettings(settings);
    }, []);

    /**
     * Carga la configuración del juego desde la base de datos al montar el componente.
     */
    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    // Asegura que al volver desde Ajustes se use siempre la configuración más reciente.
    useFocusEffect(
        useCallback(() => {
            loadSettings();
        }, [loadSettings])
    );

    if (!gameSettings) {
        return <Loading />;
    }
    return (
        <UnmountOnBlur>
            <GameView
                bombs={gameSettings.bombs}
                columns={gameSettings.columns}
                rows={gameSettings.rows}
            />
        </UnmountOnBlur>
    );
}
