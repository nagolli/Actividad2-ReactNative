import { useChrono } from "@/hooks/useChrono"

export interface StateBarProps {
    initTime: Date
    bombsLeft: number
    onEndGame: (won: boolean) => void
}

export const StateBar = ({ initTime, bombsLeft, onEndGame }: StateBarProps) => {
    return <>
        <BombsLeft bombsLeft={bombsLeft} />
        <EndGame onEndGame={onEndGame} />
        <TimeCounter initTime={initTime} />
    </>
}

/**
 * Componente que muestra el contador de tiempo transcurrido desde el inicio del juego.
 * Utiliza el hook useChrono para actualizar el contador cada segundo.
 * @param initTime - Fecha de inicio del juego.
 */
const TimeCounter = ({ initTime }: { initTime: Date }) => {
    useChrono(1);
    return <>
        {Math.floor((Date.now() - initTime.getTime()) / 1000)}
    </>
}

/**
 * Componente que muestra el número de bombas restantes por marcar.
 * @param bombsLeft - Número de bombas que aún no han sido marcadas.
 */
const BombsLeft = ({ bombsLeft }: { bombsLeft: number }) => {
    return <>
        {bombsLeft}
    </>
}

/**
 * Componente que proporciona un botón para terminar el juego manualmente.
 * @param onEndGame - Función callback para manejar el fin del juego con resultado de derrota.
 */
const EndGame = ({ onEndGame }: { onEndGame: (won: boolean) => void }) => {
    return <button onClick={() => onEndGame(false)}>End Game</button>
}