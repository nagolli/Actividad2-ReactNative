import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChrono } from '@/hooks/useChrono';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type AppTheme = typeof Colors.light;

/**
 * Props para el componente StateBar que muestra el estado del juego.
 * @property initTime - Momento en que se inició el juego
 * @property bombsLeft - Número de bombas aún no marcadas
 * @property endTime - Momento en que terminó el juego (null si sigue activo)
 * @property onEndGame - Callback para terminar el juego manualmente
 */
export interface StateBarProps {
    initTime: Date;
    bombsLeft: number;
    endTime: Date | null;
    onEndGame: (won: boolean) => void;
    onRequestSurrender?: () => void;
    onRestart?: () => void;
}

/**
 * Componente que muestra la barra de estado del juego.
 * Presenta tres secciones: bombas restantes, tiempo transcurrido y botón para rendirse.
 * 
 * @param initTime - Fecha y hora de inicio del juego
 * @param endTime - Fecha y hora de finalización del juego (null si sigue activo)
 * @param bombsLeft - Número de bombas que aún no han sido marcadas
 * @param onEndGame - Función callback que recibe si el jugador ganó o perdió
 */
export default function StateBar({ initTime, endTime, bombsLeft, onEndGame, onRequestSurrender, onRestart }: StateBarProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isEnded = endTime !== null;

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <BombsLeft bombsLeft={bombsLeft} theme={theme} />
            <EndGame onEndGame={onEndGame} onRequestSurrender={onRequestSurrender} onRestart={onRestart} isEnded={isEnded} theme={theme} />
            <TimeCounter initTime={initTime} endTime={endTime} theme={theme} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        marginHorizontal: 12,
        marginTop: 12,
        marginBottom: 10,
        borderRadius: 18,
        borderWidth: 1,
        shadowColor: '#091018',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    label: {
        fontSize: 11,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.45,
        fontFamily: Fonts?.sans,
        fontWeight: '600',
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Fonts?.rounded,
    },
    dangerButton: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    dangerButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: Fonts?.rounded,
    },
});

/**
 * Componente que muestra el contador de tiempo transcurrido desde el inicio del juego.
 * Utiliza el hook useChrono para actualizar el contador cada segundo.
 * @param initTime - Fecha de inicio del juego.
 * @param endTime - Fecha de finalización del juego.
 */
const TimeCounter = ({ initTime, endTime, theme }: { initTime: Date, endTime: Date | null, theme: AppTheme }) => {
    useChrono(1, !endTime);
    return <View style={styles.item}>
        <Text style={[styles.label, { color: theme.icon }]}>Tiempo</Text>
        <Text style={[styles.value, { color: theme.text }]}>
            {endTime ? Math.floor((endTime.getTime() - initTime.getTime()) / 1000) : Math.floor((Date.now() - initTime.getTime()) / 1000)}
        </Text>
    </View>
}

/**Actualiza dinámicamente conforme el jugador marca o desmarca casillas.
 * 
 * @param bombsLeft - Número de bombas que aún no han sido marcadas
 * @param theme - Objeto con colores del tema actual (light/dark)
 */
const BombsLeft = ({ bombsLeft, theme }: { bombsLeft: number; theme: AppTheme }) => {
    return <View style={styles.item}>
        <Text style={[styles.label, { color: theme.icon }]}>Bombas</Text>
        <Text style={[styles.value, { color: theme.text }]}>{bombsLeft}</Text>
    </View>
}

/**
 * Componente que proporciona un botón para terminar el juego manualmente.
 * @param onEndGame - Función callback para manejar el fin del juego con resultado de derrota.
 */
const EndGame = ({ onEndGame, onRequestSurrender, onRestart, isEnded, theme }: {
    onEndGame: (won: boolean) => void;
    onRequestSurrender?: () => void;
    onRestart?: () => void;
    isEnded: boolean;
    theme: AppTheme;
}) => {
    return <View style={styles.item}>
        <Text style={[styles.label, { color: theme.icon }]}>Juego</Text>
        <Pressable
            style={[styles.dangerButton, { backgroundColor: isEnded ? theme.tint : theme.danger }]}
            onPress={() => {
                if (isEnded) {
                    onRestart?.();
                    return;
                }
                if (onRequestSurrender) {
                    onRequestSurrender();
                    return;
                }
                onEndGame(false);
            }}>
            <Text style={styles.dangerButtonText}>{isEnded ? 'Reiniciar' : 'Rendirse'}</Text>
        </Pressable>
    </View>
}