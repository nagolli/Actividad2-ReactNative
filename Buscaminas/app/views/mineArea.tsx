
export interface MineAreaProps {
    initData: {
        bombs: number
        columns: number
        rows: number
    }
    setBombsLeft: (bombsLeft: number) => void
    onDie: () => void
    onWin: () => void
    ended: boolean
}

/**
 * @initData Objeto que contiene la configuración inicial del tablero, incluyendo el número de bombas, columnas y filas. Se utiliza para generar el tablero de juego al inicio.
 * @param setBombsLeft Función que actualiza el número de bombas restantes. Se llama cada vez que el jugador marca o desmarca una casilla como bomba.
 * @param onDie Función que se ejecuta cuando el jugador activa una bomba y pierde el juego. Se encarga de manejar la lógica de fin de juego por derrota.
 * @param onWin Función que se ejecuta cuando el jugador gana el juego. Se encarga de manejar la lógica de fin de juego por victoria.
 * @param ended Indica si el juego ha terminado (ya sea por victoria o derrota). Si es true, el tablero se muestra revelado y sin interacciones. Si es false, el tablero se muestra oculto y con interacciones habilitadas. 
 */
export default function MineArea({ initData, setBombsLeft, onDie, onWin, ended }: MineAreaProps) {
    return <>
    </>
}

