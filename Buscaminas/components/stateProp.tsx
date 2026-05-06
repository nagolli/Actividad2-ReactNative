//Objeto que es un par valor, setter para pasar un state como prop a un componente hijo
/**
 * Interfaz que representa un par valor-setter para pasar estado como prop a componentes hijos.
 * Facilita la gestión de estado compartido entre componentes padre e hijo.
 */
export interface StateProp<T> {
    value: T
    setValue: (value: T) => void
}