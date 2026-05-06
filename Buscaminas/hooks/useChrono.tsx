import { useEffect, useState } from "react";

/**
 * Hook personalizado que crea un contador que alterna entre 0 y 1 cada cierto intervalo de tiempo.
 * Útil para forzar re-renderizados periódicos, como en contadores de tiempo.
 */
export const useChrono = (delay: number) => {
    const [counter, setCounter] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCounter((prevCounter) => (prevCounter + 1) % 2);
        }, delay * 1000);
        return () => clearInterval(interval);
    }, [delay]);
    return counter;
}