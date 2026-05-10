import { getGameSettings, saveGameSettings } from '@/db/database';
import { navigateToView, Views } from '@/utils/viewsEnum';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import Loading from './loading';

/**
 * Tipo que define la estructura de configuración del juego.
 * @property bombs - Número de bombas en el tablero
 * @property columns - Número de columnas
 * @property rows - Número de filas
 */
type GameSettings = {
    bombs: number;
    columns: number;
    rows: number;
};

/**
 * Presets predefinidos de dificultad con sus respectivas configuraciones.
 * Proporciona tres opciones estándar de juego: Fácil, Medio y Difícil.
 */
const presets: Record<string, GameSettings> = {
    Fácil: { bombs: 10, columns: 9, rows: 9 },
    Medio: { bombs: 40, columns: 16, rows: 16 },
    Difícil: { bombs: 99, columns: 16, rows: 30 },
};

/**
 * Componente que renderiza el grupo de botones con presets predefinidos.
 * @param onApplyPreset - Función callback que se ejecuta al seleccionar un preset
 */
function PresetGroup({
    onApplyPreset,
}: {
    onApplyPreset: (preset: GameSettings) => void;
}) {
    return (
        <View style={styles.presets}>
            {Object.entries(presets).map(([label, preset]) => (
                <PresetButton
                    key={label}
                    label={label}
                    onPress={() => onApplyPreset(preset)}
                />
            ))}
        </View>
    );
}

function PresetButton({
    label,
    onPress,
}: {
    label: string;
    onPress: () => void;
}) {
    return (
        <View style={styles.presetButton}>
            <Button title={label} onPress={onPress} />
        </View>
    );
}

function FieldRow({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (text: string) => void;
}) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
            />
        </View>
    );
}

function StartButtonRow({ onPress }: { onPress: () => void }) {
    return (
        <View style={styles.startButton}>
            <Button title="Iniciar partida" onPress={onPress} />
        </View>
    );
}

export default function SelectMode() {
    const [gameSettings, setGameSettings] = useState<GameSettings | undefined>(
        undefined
    );
    const [bombs, setBombs] = useState('10');
    const [columns, setColumns] = useState('9');
    const [rows, setRows] = useState('9');

    useEffect(() => {
        const loadSettings = async () => {
            const settings = getGameSettings();
            if (settings) {
                setGameSettings(settings);
                setBombs(String(settings.bombs));
                setColumns(String(settings.columns));
                setRows(String(settings.rows));
            }
        };
        loadSettings();
    }, []);

    const goToProfile = () => {
        navigateToView(Views.Profile);
    };

    const applyPreset = (preset: GameSettings) => {
        setBombs(String(preset.bombs));
        setColumns(String(preset.columns));
        setRows(String(preset.rows));
    };

    const startGame = async () => {
        const settings: GameSettings = {
            bombs: Number(bombs) || 10,
            columns: Number(columns) || 9,
            rows: Number(rows) || 9,
        };
        await saveGameSettings(settings);
        navigateToView(Views.Game);
    };

    if (!gameSettings) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Selecciona modo</Text>
            <ProfileButtonRow onPress={goToProfile} />
            <PresetGroup onApplyPreset={applyPreset} />
            <FieldRow label="Bombas" value={bombs} onChange={setBombs} />
            <FieldRow label="Filas" value={rows} onChange={setRows} />
            <FieldRow label="Columnas" value={columns} onChange={setColumns} />
            <StartButtonRow onPress={startGame} />
        </View>
    );
}

function ProfileButtonRow({ onPress }: { onPress: () => void }) {
    return (
        <View style={styles.profileButton}>
            <Button title="Seleccionar Perfil" onPress={onPress} />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    presets: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    presetButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    profileButton: {
        marginBottom: 20,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 6,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 16,
    },
    startButton: {
        marginTop: 24,
    },
});