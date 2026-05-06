import { useEffect, useState } from "react"
import { MineArea } from "./mineArea"
import { StateBar } from "./stateBar"

export interface GameViewProps {
    bombs: number
    columns: number
    rows: number
}

export const GameView = ({ bombs, columns, rows }: GameViewProps) => {
    const [initTime] = useState(new Date())
    const [bombsLeft, setBombsLeft] = useState(bombs)
    const [endTime, setEndTime] = useState<Date | null>(null)

    useEffect(() => {
        if (bombsLeft === 0) {
            onWin()
        }
    }, [bombsLeft])

    /**
     * Función que se ejecuta cuando el jugador gana el juego.
     * Marca el tiempo final y llama a onEndGame con resultado de victoria.
     */
    const onWin = () => {
        onEndGame(true)
    }

    /**
     * Función que se ejecuta cuando el jugador pisa una bomba y pierde.
     * Establece el tiempo final, revela el tablero y deshabilita interacciones,
     * pero no llama inmediatamente a onEndGame para permitir al usuario ver el tablero.
     */
    const onDie = () => {
        setEndTime(new Date());
        //Revelar el tablero, inhabilitar interaccion

        //No llamar a onEndGame, permitir al usuario ver el tablero antes de volver al menu principal
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

    }

    return <>
        <StateBar initTime={initTime} bombsLeft={bombsLeft} onEndGame={onEndGame} />
        <MineArea initData={{ bombs, columns, rows }} setBombsLeft={setBombsLeft} onDie={onDie} ended={!!endTime} />
    </>
}

