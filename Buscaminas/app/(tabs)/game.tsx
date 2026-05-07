import { useEffect, useState } from 'react';

import GameView from '../views/gameView';
import { getGameSettings } from '@/db/database';
import Loading from '../views/loading';
import { UnmountOnBlur } from '../hooks/UnmountOnBlur';

/**
 * Componente interno que carga y renderiza la pantalla del juego.
 * Se desmonta cuando la pantalla pierde el enfoque.
 */
export default function GameScreen() {
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
        <UnmountOnBlur>
            <GameView
                bombs={gameSettings.bombs}
                columns={gameSettings.columns}
                rows={gameSettings.rows}
            />
        </UnmountOnBlur>
    );
}
