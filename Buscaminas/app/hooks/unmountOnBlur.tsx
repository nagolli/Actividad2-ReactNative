import { useIsFocused } from '@react-navigation/native';
import { ReactNode } from 'react';

/**
 * No es un hook, pero es un componente reutilizable.
 * Hace que cuando el contenido no esté visible, se desmonte el componente hijo.
 * Esto es útil para liberar recursos cuando el usuario cambia de pantalla.
 * 
 * @param children - El componente hijo que se renderizará solo cuando la pantalla esté enfocada
 * @returns 
 */
export function UnmountOnBlur({ children }: { children: ReactNode }) {
    const isFocused = useIsFocused();
    return isFocused ? <>{children}</> : null;
}