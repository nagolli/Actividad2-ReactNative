import { useEffect, useState } from 'react';

import { View, Text } from 'react-native';
import GameView from '../views/gameView';
import { getGameSettings } from '@/db/database';
import { useIsFocused } from '@react-navigation/native';

export default function GameScreen() {
    const isFocused = useIsFocused();

    return isFocused ? <GameScreenUnmountable /> : null;
}

function GameScreenUnmountable() {
    const [gameSettings, setGameSettings] = useState<{ bombs: number; columns: number; rows: number } | undefined>(undefined);

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await getGameSettings();
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

const Loading = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Cargando...</Text>
        </View>
    );
}

