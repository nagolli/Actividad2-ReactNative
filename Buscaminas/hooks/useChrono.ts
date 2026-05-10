import { useEffect, useState } from 'react';

export const useChrono = (delay: number) => {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter((prevCounter) => (prevCounter + 1) % 2);
        }, delay * 1000);

        return () => clearInterval(interval);
    }, [delay]);

    return counter;
};