import { useEffect, useState } from "react";

/**
 * Hook personalizado que crea un contador que alterna entre 0 y 1 cada cierto intervalo de tiempo.
 * 
 * Propósito: Forzar re-renderizados periódicos de componentes, útil para:
 * - Contadores de tiempo que se actualizan cada segundo
 * - Animaciones cíclicas
 * - Actualizaciones UI periódicas basadas en el tiempo
 * 
 * El counter alterna entre 0 y 1, permitiendo que React detecte cambios de estado
 * aunque el valor sea limitado a dos opciones.
 * 
 * @param delay - Intervalo en segundos entre cambios del contador
 * 
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