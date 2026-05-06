
export interface MineAreaProps {
    initData: {
        bombs: number
        columns: number
        rows: number
    }
    setBombsLeft: (bombsLeft: number) => void
    onDie: () => void
    ended: boolean
}

export const MineArea = ({ initData, setBombsLeft, onDie, ended }: MineAreaProps) => {
    return <>
    </>
}

