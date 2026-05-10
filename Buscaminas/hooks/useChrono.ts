import { useEffect, useState } from 'react';

export const useChrono = (delay: number, enabled = true) => {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const interval = setInterval(() => {
            setCounter((prevCounter) => (prevCounter + 1) % 2);
        }, delay * 1000);

        return () => clearInterval(interval);
    }, [delay, enabled]);

    return counter;
};