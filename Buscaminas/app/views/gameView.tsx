import { useEffect, useState } from "react"
import StateBar from "./stateBar"
import MineArea from "./mineArea"
import { navigateToView, Views } from "../(tabs)/viewsEnum"

export interface GameViewProps {
    bombs: number
    columns: number
    rows: number
}

export default function GameView({ bombs, columns, rows }: GameViewProps) {
    const [initTime] = useState(new Date())
    const [bombsLeft, setBombsLeft] = useState(bombs)
    const [endTime, setEndTime] = useState<Date | null>(null)

    /**
     * Función que se ejecuta cuando el jugador pisa una bomba y pierde.
     * Establece el tiempo final, revela el tablero y deshabilita interacciones,
     */
    const onDie = () => {
        setEndTime(new Date());
        //No llamar a onEndGame directamente, permitir al usuario ver el tablero antes de volver al menu principal
    }

    /**
     * Función que maneja el fin del juego, ya sea por victoria o derrota.
     * Calcula el tiempo total jugado y guarda el registro en la base de datos.
     * Finalmente, vuelve al menú principal.
     * @param won - Indica si el jugador ganó (true) o perdió (false).
     */
    const onEndGame = (won: boolean) => {
        const finalTime = endTime ?? new Date()
        const totalTime = Math.floor((finalTime.getTime() - initTime.getTime()) / 1000)
        //Guardar registro en BBDD -> Tiempo y resultado (ganado o perdido)
        console.log(`Juego terminado. Ganado: ${won}, Tiempo total: ${totalTime} segundos`)

        //Volver al menu principal
        navigateToView(Views.Profile);

    }

    return <>
        <StateBar initTime={initTime} endTime={endTime} bombsLeft={bombsLeft} onEndGame={onEndGame} />
        <MineArea initData={{ bombs, columns, rows }} setBombsLeft={setBombsLeft} onDie={onDie} onWin={() => onEndGame(true)} ended={!!endTime} />
    </>
}

