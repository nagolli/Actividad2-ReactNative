import ActionModal from "@/components/ui/action-modal"
import ScreenContainer from "@/components/ui/screen-container"
import { getActiveProfile, insertGame, setGameInProgress } from "@/db/database"
import { navigateToView, Views } from "@/utils/viewsEnum"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useEffect, useState } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
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
    const insets = useSafeAreaInsets()
    const tabBarHeight = useBottomTabBarHeight()
    const [initTime, setInitTime] = useState(new Date())
    const [bombsLeft, setBombsLeft] = useState(bombs)
    const [endTime, setEndTime] = useState<Date | null>(null)
    const [gameFinished, setGameFinished] = useState(false)
    const [gameWon, setGameWon] = useState(false)
    const [finalSeconds, setFinalSeconds] = useState(0)
    const [showEndModal, setShowEndModal] = useState(false)
    const [showSurrenderConfirmModal, setShowSurrenderConfirmModal] = useState(false)
    const [roundKey, setRoundKey] = useState(0)

    useEffect(() => {
        setGameInProgress(true).catch((error) => {
            console.error('Error al establecer partida en curso:', error)
        })
    }, [])

    const finishAndSaveGame = (won: boolean, finalTime: Date) => {
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
            console.error('Error al guardar el registro de la partida:', error)
        })

        setGameWon(won)
        setFinalSeconds(totalTime)
        setShowEndModal(true)
    }

    const startNewRound = () => {
        setShowEndModal(false)
        setGameInProgress(true).catch((error) => {
            console.error('Error al establecer partida en curso:', error)
        })
        setGameFinished(false)
        setGameWon(false)
        setFinalSeconds(0)
        setBombsLeft(bombs)
        setEndTime(null)
        setInitTime(new Date())
        setRoundKey((prev) => prev + 1)
    }

    /**
     * Función que se ejecuta cuando el jugador pisa una bomba y pierde.
     * Establece el tiempo final, revela el tablero y deshabilita interacciones,
     */
    const onDie = () => {
        onEndGame(false)
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
        if (gameFinished) return

        const finalTime = new Date()
        setEndTime(finalTime)
        setGameFinished(true)
        setGameInProgress(false).catch((error) => {
            console.error('Error al finalizar estado de partida en curso:', error)
        })
        finishAndSaveGame(won, finalTime)
    }

    const onRequestSurrender = () => {
        if (gameFinished) return
        setShowSurrenderConfirmModal(true)
    }

    return <>
        <ScreenContainer contentContainerStyle={{ flex: 1, paddingTop: Math.max(insets.top, 10) }} lightEndColor="#e0ebf0">
            <StateBar initTime={initTime} endTime={endTime} bombsLeft={bombsLeft} onEndGame={onEndGame} onRequestSurrender={onRequestSurrender} onRestart={startNewRound} />
            <MineArea
                key={roundKey}
                initData={{ bombs, columns, rows }}
                setBombsLeft={setBombsLeft}
                onDie={onDie}
                onWin={() => onEndGame(true)}
                ended={!!endTime}
                bottomReservedSpace={tabBarHeight + 12}
            />
        </ScreenContainer>

        <ActionModal
            visible={showEndModal}
            title={gameWon ? 'Partida ganada' : 'Partida perdida'}
            subtitle={`Tiempo final: ${finalSeconds}s`}
            primaryLabel="Jugar de nuevo"
            onPrimaryPress={startNewRound}
            secondaryLabel="Ir a ajustes del tablero"
            onSecondaryPress={() => {
                setShowEndModal(false)
                navigateToView(Views.Init)
            }}
            primaryVariant="accent"
            showCloseButton
            dismissOnBackdropPress
            onDismiss={() => setShowEndModal(false)}
        />

        <ActionModal
            visible={showSurrenderConfirmModal}
            title="Confirmar rendición"
            subtitle="La partida actual se cerrará y tendrás que iniciar una nueva."
            primaryLabel="Rendirse"
            onPrimaryPress={() => {
                setShowSurrenderConfirmModal(false)
                onEndGame(false)
            }}
            secondaryLabel="Cancelar"
            onSecondaryPress={() => setShowSurrenderConfirmModal(false)}
            primaryVariant="danger"
        />
    </>
}

