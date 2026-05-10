import { getActiveProfile, insertGame } from "@/db/database"
import { useState } from "react"
import { navigateToView, Views } from "../(tabs)/viewsEnum"
import MineArea from "./mineArea"
import StateBar from "./stateBar"

/**
 * Props para el componente GameView que gestiona la lógica principal del juego.
 * @property bombs - Número total de bombas a distribuir en el tablero
 * @property columns - Número de columnas del tablero
 * @property rows - Número de filas del tablero
 */
export interface GameViewProps {
    bombs: number
    columns: number
    rows: number
}

/**
 * Componente principal que gestiona el flujo de una partida de Buscaminas.
 * 
 * Coordina:
 * - El estado del tablero (bombas, casillas reveladas, marcas)
 * - El contador de tiempo y bombas restantes
 * - Maneja el evento cuando el jugador pisa una bomba y pierde el juego.
*/

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

    /**Maneja el fin del juego, ya sea por victoria (todas las casillas no-bomba reveladas) o derrota (bomba activada).
     * 
     * Realiza las siguientes acciones:
     * 1. Calcula el tiempo total de juego
     * 2. Guarda el registro de la partida en la base de datos (con resultado y tiempo)
     * 3. Navega de vuelta a la pantalla de perfil del jugador
     * 
     * @param won - true si el jugador ganó, false si perdió
     */
    const onEndGame = (won: boolean) => {
        const finalTime = endTime ?? new Date()
        const totalTime = Math.floor((finalTime.getTime() - initTime.getTime()) / 1000)
        insertGame({
            bombs,
            columns,
            rows,
            result: won ? 1 : 0,
            playedAt: finalTime.toISOString(),
            time: totalTime,
            profileId: getActiveProfile()?.id ?? 1,
        }).catch(error => {
            console.error('Error al guardar el registro de la partida:', error);
        });

        // Volver al menu principal
        navigateToView(Views.Profile);

    }

    return <>
        <StateBar initTime={initTime} endTime={endTime} bombsLeft={bombsLeft} onEndGame={onEndGame} />
        <MineArea initData={{ bombs, columns, rows }} setBombsLeft={setBombsLeft} onDie={onDie} onWin={() => onEndGame(true)} ended={!!endTime} />
    </>
}

