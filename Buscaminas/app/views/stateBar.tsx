import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useChrono } from '@/hooks/useChrono';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface StateBarProps {
    initTime: Date;
    bombsLeft: number;
    endTime: Date | null;
    onEndGame: (won: boolean) => void;
}

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

/**
 * Componente que muestra el número de bombas restantes por marcar.
 * @param bombsLeft - Número de bombas que aún no han sido marcadas.
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