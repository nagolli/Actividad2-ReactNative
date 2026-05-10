
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Cell = {
    hasBomb: boolean;
    revealed: boolean;
    flagged: boolean;
    neighborBombs: number;
};

const CELL_SIZE = 32;

const createBoard = (rows: number, columns: number, bombs: number): Cell[][] => {
    const board: Cell[][] = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => ({
            hasBomb: false,
            revealed: false,
            flagged: false,
            neighborBombs: 0,
        }))
    );

    const totalCells = rows * columns;
    const bombCount = Math.max(1, Math.min(bombs, totalCells - 1));
    const bombIndexes = new Set<number>();

    while (bombIndexes.size < bombCount) {
        bombIndexes.add(Math.floor(Math.random() * totalCells));
    }

    for (const index of bombIndexes) {
        const row = Math.floor(index / columns);
        const col = index % columns;
        board[row][col].hasBomb = true;
    }

    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
            if (board[row][col].hasBomb) continue;

            let nearbyBombs = 0;
            for (let r = row - 1; r <= row + 1; r += 1) {
                for (let c = col - 1; c <= col + 1; c += 1) {
                    if (r === row && c === col) continue;
                    if (r < 0 || c < 0 || r >= rows || c >= columns) continue;
                    if (board[r][c].hasBomb) nearbyBombs += 1;
                }
            }
            board[row][col].neighborBombs = nearbyBombs;
        }
    }

    return board;
};

const cloneBoard = (board: Cell[][]): Cell[][] => board.map((row) => row.map((cell) => ({ ...cell })));

const revealConnectedArea = (board: Cell[][], startRow: number, startCol: number) => {
    const rows = board.length;
    const columns = board[0].length;
    const queue: [number, number][] = [[startRow, startCol]];

    while (queue.length > 0) {
        const next = queue.shift();
        if (!next) break;

        const [row, col] = next;
        const cell = board[row][col];

        if (cell.revealed || cell.flagged) continue;
        cell.revealed = true;

        if (cell.neighborBombs !== 0) continue;

        for (let r = row - 1; r <= row + 1; r += 1) {
            for (let c = col - 1; c <= col + 1; c += 1) {
                if (r === row && c === col) continue;
                if (r < 0 || c < 0 || r >= rows || c >= columns) continue;

                const neighbor = board[r][c];
                if (!neighbor.revealed && !neighbor.hasBomb && !neighbor.flagged) {
                    queue.push([r, c]);
                }
            }
        }
    }
};

const hasWon = (board: Cell[][]) => {
    for (const row of board) {
        for (const cell of row) {
            if (!cell.hasBomb && !cell.revealed) {
                return false;
            }
        }
    }
    return true;
};

const countFlags = (board: Cell[][]) => {
    let total = 0;
    for (const row of board) {
        for (const cell of row) {
            if (cell.flagged) total += 1;
        }
    }
    return total;
};

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
export default function MineArea({ initData, setBombsLeft, onDie, onWin, ended }: MineAreaProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [exploded, setExploded] = useState(false);

    const totalBombs = useMemo(() => {
        const cells = initData.rows * initData.columns;
        return Math.max(1, Math.min(initData.bombs, cells - 1));
    }, [initData.bombs, initData.columns, initData.rows]);

    const [board, setBoard] = useState<Cell[][]>(() =>
        createBoard(initData.rows, initData.columns, totalBombs)
    );

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

        if (hasWon(nextBoard)) {
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
    };

    const showAll = ended || exploded;

    return (
        <View style={styles.wrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.board}>
                        {board.map((row, rowIndex) => (
                            <View key={`row-${rowIndex}`} style={styles.row}>
                                {row.map((cell, colIndex) => {
                                    const isVisible = showAll || cell.revealed;
                                    const isBombVisible = isVisible && cell.hasBomb;

                                    let displayText = '';
                                    if (cell.flagged && !isVisible) displayText = 'F';
                                    if (isBombVisible) displayText = 'X';
                                    if (isVisible && !cell.hasBomb && cell.neighborBombs > 0) {
                                        displayText = String(cell.neighborBombs);
                                    }

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
                                                {
                                                    borderColor: theme.icon,
                                                    backgroundColor: isVisible ? '#d8d8d8' : theme.background,
                                                },
                                                isBombVisible && styles.bombCell,
                                            ]}>
                                            <Text
                                                style={[
                                                    styles.cellText,
                                                    { color: isBombVisible ? '#fff' : theme.text },
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
        paddingBottom: 12,
    },
    board: {
        borderWidth: 1,
        borderColor: '#7a7a7a',
        backgroundColor: '#9b9b9b',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bombCell: {
        backgroundColor: '#d43c3c',
    },
    cellText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

