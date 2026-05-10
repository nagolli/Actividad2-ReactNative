import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChrono } from '@/hooks/useChrono';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

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
export default function StateBar({ initTime, endTime, bombsLeft, onEndGame }: StateBarProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.icon }]}>
            <BombsLeft bombsLeft={bombsLeft} theme={theme} />
            <EndGame onEndGame={onEndGame} theme={theme} />
            <TimeCounter initTime={initTime} endTime={endTime} theme={theme} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        margin: 12,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
    },
});

/**
 * Componente que muestra el contador de tiempo transcurrido desde el inicio del juego.
 * Utiliza el hook useChrono para actualizar el contador cada segundo.
 * @param initTime - Fecha de inicio del juego.
 * @param endTime - Fecha de finalización del juego.
 */
const TimeCounter = ({ initTime, endTime, theme }: { initTime: Date, endTime: Date | null, theme: any }) => {
    useChrono(1);
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
const BombsLeft = ({ bombsLeft, theme }: { bombsLeft: number; theme: any }) => {
    return <View style={styles.item}>
        <Text style={[styles.label, { color: theme.icon }]}>Bombas</Text>
        <Text style={[styles.value, { color: theme.text }]}>{bombsLeft}</Text>
    </View>
}

/**
 * Componente que proporciona un botón para terminar el juego manualmente.
 * @param onEndGame - Función callback para manejar el fin del juego con resultado de derrota.
 */
const EndGame = ({ onEndGame, theme }: { onEndGame: (won: boolean) => void; theme: any }) => {
    return <View style={styles.item}>
        <Text style={[styles.label, { color: theme.icon }]}>Juego</Text>
        <Button title="Rendirse" onPress={() => onEndGame(false)} />
    </View>
}