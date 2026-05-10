import ActionModal from '@/components/ui/action-modal';
import AppButton from '@/components/ui/app-button';
import SurfaceCard from '@/components/ui/surface-card';
import { Colors, Fonts } from '@/constants/theme';
import { getGameSettings, isGameInProgress, saveGameSettings } from '@/db/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { navigateToView, Views } from '@/utils/viewsEnum';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
    palette,
}: {
    onApplyPreset: (preset: GameSettings) => void;
    palette: typeof Colors.light;
}) {
    return (
        <View style={styles.presets}>
            {Object.entries(presets).map(([label, preset]) => (
                <PresetButton
                    key={label}
                    label={label}
                    onPress={() => onApplyPreset(preset)}
                    palette={palette}
                />
            ))}
        </View>
    );
}

function PresetButton({
    label,
    onPress,
    palette,
}: {
    label: string;
    onPress: () => void;
    palette: typeof Colors.light;
}) {
    return (
        <Pressable style={[styles.presetButton, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]} onPress={onPress}>
            <Text style={[styles.presetButtonText, { color: palette.text }]}>{label}</Text>
        </Pressable>
    );
}

function FieldRow({
    label,
    value,
    onChange,
    palette,
}: {
    label: string;
    value: string;
    onChange: (text: string) => void;
    palette: typeof Colors.light;
}) {
    return (
        <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
            <TextInput
                style={[styles.input, { borderColor: palette.border, backgroundColor: palette.surface, color: palette.text }]}
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                placeholderTextColor={palette.textMuted}
            />
        </View>
    );
}

function StartButtonRow({ onPress, palette }: { onPress: () => void; palette: typeof Colors.light }) {
    return (
        <AppButton label="Iniciar partida" onPress={onPress} variant="accent" style={styles.primaryButton} />
    );
}

export default function SelectMode() {
    const colorScheme = useColorScheme();
    const palette = Colors[colorScheme ?? 'light'];
    const [gameSettings, setGameSettings] = useState<GameSettings | undefined>(
        undefined
    );
    const [bombs, setBombs] = useState('10');
    const [columns, setColumns] = useState('9');
    const [rows, setRows] = useState('9');
    const [showNewGameConfirmModal, setShowNewGameConfirmModal] = useState(false);
    const [pendingSettings, setPendingSettings] = useState<GameSettings | null>(null);

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

        const settingsChanged =
            !!gameSettings &&
            (settings.bombs !== gameSettings.bombs ||
                settings.columns !== gameSettings.columns ||
                settings.rows !== gameSettings.rows);

        if (isGameInProgress() && settingsChanged) {
            setPendingSettings(settings);
            setShowNewGameConfirmModal(true);
            return;
        }

        await saveGameSettings(settings);
        navigateToView(Views.Game);
    };

    if (!gameSettings) {
        return <Loading />;
    }

    return (
        <LinearGradient
            colors={colorScheme === 'dark' ? ['#0d1318', '#121d24'] : ['#f4f7f9', '#deeaee']}
            style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SurfaceCard style={styles.card}>
                    <Text style={[styles.title, { color: palette.text }]}>Selecciona modo</Text>
                    <Text style={[styles.subtitle, { color: palette.textMuted }]}>Configura dificultad o crea tu propia partida</Text>

                    <ProfileButtonRow onPress={goToProfile} palette={palette} />
                    <PresetGroup onApplyPreset={applyPreset} palette={palette} />
                    <FieldRow label="Bombas" value={bombs} onChange={setBombs} palette={palette} />
                    <FieldRow label="Filas" value={rows} onChange={setRows} palette={palette} />
                    <FieldRow label="Columnas" value={columns} onChange={setColumns} palette={palette} />
                    <StartButtonRow onPress={startGame} palette={palette} />
                </SurfaceCard>
            </ScrollView>

            <ActionModal
                visible={showNewGameConfirmModal}
                title="Comenzar nueva partida"
                subtitle="Hay una partida en curso. Si continuas con estos ajustes, empezaras una nueva partida."
                primaryLabel="Continuar"
                onPrimaryPress={async () => {
                    if (!pendingSettings) return;
                    await saveGameSettings(pendingSettings);
                    setShowNewGameConfirmModal(false);
                    setPendingSettings(null);
                    navigateToView(Views.Game);
                }}
                secondaryLabel="Cancelar"
                onSecondaryPress={() => {
                    setShowNewGameConfirmModal(false);
                    setPendingSettings(null);
                }}
                primaryVariant="danger"
            />
        </LinearGradient>
    );
}

function ProfileButtonRow({ onPress, palette }: { onPress: () => void; palette: typeof Colors.light }) {
    return (
        <AppButton label="Seleccionar perfil" onPress={onPress} variant="soft" style={styles.secondaryButton} />
    );
}


const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 18,
        paddingBottom: 96,
    },
    card: {
        borderRadius: 24,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
    },
    title: {
        fontSize: 30,
        marginBottom: 6,
        textAlign: 'left',
        fontFamily: Fonts?.rounded,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 18,
        fontFamily: Fonts?.sans,
    },
    presets: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 18,
    },
    presetButton: {
        minWidth: 96,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    presetButtonText: {
        fontSize: 14,
        textAlign: 'center',
        fontFamily: Fonts?.rounded,
        fontWeight: '600',
    },
    secondaryButton: {
        marginBottom: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    field: {
        marginBottom: 12,
    },
    label: {
        marginBottom: 6,
        fontSize: 13,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        fontFamily: Fonts?.sans,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        fontFamily: Fonts?.sans,
    },
    primaryButton: {
        marginTop: 14,
        paddingVertical: 14,
    },
});