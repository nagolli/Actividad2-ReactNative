
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Cell, cloneBoard, countFlags, createBoard, hasWonByAnyRule, normalizeBombCount, revealConnectedArea } from '@/utils/mine-logic';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

const MIN_CELL_SIZE = 18;
const MAX_CELL_SIZE = 40;
const FLAG_SYMBOL = '⚑';
const BOMB_SYMBOL = '✹';


/**
 * Props para el componente MineArea que renderiza el tablero de juego.
 */
export interface MineAreaProps {
    /**
     * Configuración inicial del tablero
     * @property bombs - Número total de bombas a distribuir en el tablero
     * @property columns - Número de columnas del tablero
     * @property rows - Número de filas del tablero
     */
    initData: {
        bombs: number
        columns: number
        rows: number
    }
    /**
     * Callback para actualizar el número de bombas restantes por marcar.
     * Se invoca cada vez que el jugador marca o desmarca una bomba.
     */
    setBombsLeft: (bombsLeft: number) => void
    /**
     * Callback que se ejecuta cuando el jugador activa uma bomba y pierde el juego.
     * Se encarga de manejar la lógica visual de fin de juego (mostrar todas las bombas, etc).
     */
    onDie: () => void
    /**
     * Callback que se ejecuta cuando el jugador ha descubierto todas las casillas sin bombas.
     * Indica una victoria en el juego.
     */
    onWin: () => void
    /**
     * Indica si el juego ha terminado.
     * - Si es true: el tablero se muestra totalmente revelado sin interacciones
     * - Si es false: el tablero está activo permitiendo interacciones del jugador
     */
    ended: boolean
    /**
     * Espacio inferior reservado para elementos superpuestos (por ejemplo la barra de tabs).
     */
    bottomReservedSpace?: number
}

/**
 * Componente que renderiza el área de juego del Buscaminas.
 * 
 * Responsabilidades:
 * - Generar y gestionar el tablero de juego con bombas distribuidas aleatoriamente
 * - Manejar las interacciones del usuario (toca para revelar, mantén para marcar como bomba)
 * - Calcular información de casillas (número de bombas adyacentes, etc)
 * - Detectar condiciones de victoria (todas las casillas no-bomba reveladas)
 * - Detectar condiciones de derrota (bomba activada)
 * - Mantener el estado del tablero durante el juego
 * 
 * @param initData - Configuración del tablero (bombas, filas, columnas)
 * @param setBombsLeft - Función callback para actualizar bombas restantes
 * @param onDie - Callback cuando se activa una bomba
 * @param onWin - Callback cuando se gana el juego
 * @param ended - Indica si el juego ya ha terminado
 */
export default function MineArea({ initData, setBombsLeft, onDie, onWin, ended, bottomReservedSpace = 0 }: MineAreaProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { width, height } = useWindowDimensions();
    const [exploded, setExploded] = useState(false);

    const totalBombs = useMemo(() => {
        return normalizeBombCount(initData.rows, initData.columns, initData.bombs);
    }, [initData.bombs, initData.columns, initData.rows]);

    const [board, setBoard] = useState<Cell[][]>(() =>
        createBoard(initData.rows, initData.columns, totalBombs)
    );

    const cellSize = useMemo(() => {
        const horizontalPadding = 24;
        const boardBorder = 2;
        const availableWidth = Math.max(0, width - horizontalPadding - boardBorder);
        const availableHeight = Math.max(0, (height * 0.62) - boardBorder - bottomReservedSpace);

        const sizeByWidth = Math.floor(availableWidth / Math.max(1, initData.columns));
        const sizeByHeight = Math.floor(availableHeight / Math.max(1, initData.rows));
        const adaptiveSize = Math.min(sizeByWidth, sizeByHeight);

        return Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, adaptiveSize));
    }, [width, height, initData.columns, initData.rows, bottomReservedSpace]);

    const cellFontSize = useMemo(() => Math.max(11, Math.floor(cellSize * 0.42)), [cellSize]);

    useEffect(() => {
        setBoard(createBoard(initData.rows, initData.columns, totalBombs));
        setBombsLeft(totalBombs);
        setExploded(false);
    }, [initData.columns, initData.rows, setBombsLeft, totalBombs]);

    const revealAllBombs = (nextBoard: Cell[][]) => {
        for (const row of nextBoard) {
            for (const cell of row) {
                if (cell.hasBomb) cell.revealed = true;
            }
        }
    };

    const onPressCell = (row: number, col: number) => {
        if (ended || exploded) return;

        const cell = board[row][col];
        if (cell.revealed || cell.flagged) return;

        const nextBoard = cloneBoard(board);
        const nextCell = nextBoard[row][col];

        if (nextCell.hasBomb) {
            revealAllBombs(nextBoard);
            setBoard(nextBoard);
            setExploded(true);
            onDie();
            return;
        }

        revealConnectedArea(nextBoard, row, col);
        setBoard(nextBoard);

        if (hasWonByAnyRule(nextBoard, totalBombs)) {
            onWin();
        }
    };

    const onLongPressCell = (row: number, col: number) => {
        if (ended || exploded) return;

        const cell = board[row][col];
        if (cell.revealed) return;

        const nextBoard = cloneBoard(board);
        nextBoard[row][col].flagged = !nextBoard[row][col].flagged;

        setBoard(nextBoard);
        const flags = countFlags(nextBoard);
        setBombsLeft(totalBombs - flags);

        if (hasWonByAnyRule(nextBoard, totalBombs)) {
            onWin();
        }
    };

    const showAll = ended || exploded;

    return (
        <View style={[styles.wrapper, { paddingBottom: 12 + bottomReservedSpace }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalContent}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.verticalContent}>
                    <View style={styles.board}>
                        {board.map((row, rowIndex) => (
                            <View key={`row-${rowIndex}`} style={styles.row}>
                                {row.map((cell, colIndex) => {
                                    const isVisible = showAll || cell.revealed;
                                    const isBombVisible = isVisible && cell.hasBomb;

                                    let displayText = '';
                                    if (cell.flagged && !isVisible) displayText = FLAG_SYMBOL;
                                    if (isBombVisible) displayText = BOMB_SYMBOL;
                                    if (isVisible && !cell.hasBomb && cell.neighborBombs > 0) {
                                        displayText = String(cell.neighborBombs);
                                    }

                                    const numberColor =
                                        displayText === FLAG_SYMBOL ? theme.danger :
                                        displayText === '1' ? '#2f80ed' :
                                            displayText === '2' ? '#219653' :
                                                displayText === '3' ? '#f2994a' :
                                                    displayText === '4' ? '#9b51e0' :
                                                        theme.text;

                                    return (
                                        <TouchableOpacity
                                            key={`cell-${rowIndex}-${colIndex}`}
                                            activeOpacity={0.75}
                                            onPress={() => onPressCell(rowIndex, colIndex)}
                                            onLongPress={() => onLongPressCell(rowIndex, colIndex)}
                                            delayLongPress={220}
                                            disabled={showAll}
                                            style={[
                                                styles.cell,
                                                { width: cellSize, height: cellSize },
                                                {
                                                    borderColor: theme.border,
                                                    backgroundColor: isVisible ? theme.backgroundSoft : theme.surface,
                                                },
                                                cell.flagged && !isVisible && { backgroundColor: theme.tintSoft },
                                                isBombVisible && styles.bombCell,
                                            ]}>
                                            <Text
                                                style={[
                                                    styles.cellText,
                                                    { fontSize: cellFontSize },
                                                    { color: isBombVisible ? '#fff' : numberColor },
                                                ]}>
                                                {displayText}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        paddingHorizontal: 12,
    },
    horizontalContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verticalContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: '100%',
    },
    board: {
        borderWidth: 1,
        borderRadius: 16,
        overflow: 'hidden',
        borderColor: '#7a8791',
        backgroundColor: '#d5dee5',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bombCell: {
        backgroundColor: '#d64545',
    },
    cellText: {
        fontWeight: '700',
        fontFamily: Fonts?.rounded,
    },
});

