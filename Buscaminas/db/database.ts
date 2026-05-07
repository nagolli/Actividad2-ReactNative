import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('buscaminas.db');

/**
 * Normaliza los resultados de una consulta SQL transformándolos en un array.
 * Maneja diferentes formatos de respuesta según la versión de expo-sqlite.
 * @template T - Tipo genérico para tipado de los resultados
 * @param result - Resultado bruto de la consulta SQL
 * @returns Array tipado con los registros de la consulta
 */
const normalizeRows = <T>(result: any): T[] => {
  if (!result || result.length === 0) return [];
  const rows = result[0].rows;
  if (!rows) return [];
  return Array.isArray(rows._array) ? rows._array as T[] : rows as T[];
};

/**
 * Inicializa la base de datos creando las tablas necesarias para el juego.
 * Crea tres tablas: settings (configuración del juego), profiles (perfiles de usuario) 
 * y games (registro de partidas jugadas).
 * Esta función se debe llamar una sola vez al inicio de la aplicación.
 */
export const initDatabase = () => {
  db.withTransactionSync(() => {
    /*
    db.execSync(
      `Drop TABLE IF EXISTS settings;`
    );
    db.execSync(
      `Drop TABLE IF EXISTS games;`
    );
    db.execSync(
      `Drop TABLE IF EXISTS profiles;`
    );*/
    db.execSync(
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY NOT NULL,
        bombs INTEGER NOT NULL,
        columns INTEGER NOT NULL,
        rows INTEGER NOT NULL
      );`
    );

    db.execSync(
      `CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        activo INTEGER NOT NULL DEFAULT 0
      );`
    );

    db.execSync(
      `CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        bombs INTEGER NOT NULL,
        columns INTEGER NOT NULL,
        rows INTEGER NOT NULL,
        result INTEGER NOT NULL,
        played_at TEXT NOT NULL DEFAULT (datetime('now')),
        time INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );`
    );
  });
  // Insertar configuración por defecto si no existe
  if (!getGameSettings()) {
    saveGameSettings({ bombs: 10, columns: 9, rows: 9 }); // Valores por defecto
  }
  try {
    if (!existsActiveProfile()) {
      insertProfile("Yo");
    }
  } catch (ex) {
    console.log("Error inserting default profile:", ex);
  }
};

/**
 * Guarda o actualiza la configuración del juego en la base de datos.
 * Si ya existe una configuración, la reemplaza; de lo contrario, la crea.
 * @param settings - Objeto con la configuración del juego (bombas, columnas y filas)
 * @returns Promise que se resuelve cuando la operación se completa
 * @throws Error si ocurre un problema al guardar los datos
 */
export const saveGameSettings = (settings: { bombs: number; columns: number; rows: number }) => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.withTransactionSync(() => {
        db.execSync(
          `INSERT OR REPLACE INTO settings (id, bombs, columns, rows) VALUES (1, ${settings.bombs}, ${settings.columns}, ${settings.rows});`
        );
      });
      resolve();
    } catch (error) {
      console.log("Error al guardar settings en la base de datos:", error);
      reject(error);
    }
  });
};

// Carga settings
export const getGameSettings = (): { bombs: number; columns: number; rows: number } | null => {
  return db.getFirstSync<{ bombs: number; columns: number; rows: number }>(
    'SELECT bombs, columns, rows FROM settings WHERE id = 1;'
  );
};

/**
 * Interfaz que representa un perfil de usuario en la base de datos.
 * @property id - Identificador único del perfil
 * @property name - Nombre del perfil (debe ser único)
 * @property activo - Indica si este perfil está activo (1) o inactivo (0)
 */
export interface Profile {
  id: number;
  name: string;
  activo: number;
  created_at: string;
}

/**
 * Obtiene todos los perfiles de usuario de la base de datos ordenados alfabéticamente por nombre.
 * @returns Array de perfiles disponibles
 */
export const getAllProfiles = (): Profile[] => {
  return normalizeRows<Profile>(db.execSync(
    'SELECT id, name, created_at, activo FROM profiles ORDER BY name ASC;'
  ));
};

/**
 * Inserta un nuevo perfil de usuario en la base de datos.
 * @param profileName - Nombre del nuevo perfil (debe ser único)
 * @returns Promise que se resuelve cuando el perfil se ha creado exitosamente
 * @throws Error si el nombre del perfil ya existe o hay un problema en la base de datos
 */
export const insertProfile = (profileName: string, active: boolean = false) => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.withTransactionSync(() => {
        const safeProfileName = profileName.replace(/'/g, "''");
        db.execSync(
          `INSERT INTO profiles (name, activo) VALUES ('${safeProfileName}', ${active ? 1 : 0});`
        );
      });
      resolve();
    } catch (error) {
      console.log("Error al insertar perfil:", error);
      reject(error);
    }
  });
};

/**
 * Interfaz que representa un registro de una partida jugada.
 * @property id - Identificador único de la partida
 * @property profile_id - ID del perfil que jugó la partida
 * @property bombs - Número de bombas en la partida
 * @property columns - Número de columnas del tablero
 * @property rows - Número de filas del tablero
 * @property result - Resultado de la partida ('win' o 'lose')
 * @property played_at - Fecha y hora en que se jugó la partida
 * @property time - Tiempo que duró la partida en segundos
 */
export interface GameRecord {
  id: number;
  profile_id: number;
  bombs: number;
  columns: number;
  rows: number;
  result: number;
  played_at: string;
  time: number;
}

/**
 * Obtiene todas las partidas jugadas por un perfil específico, ordenadas por fecha descendente.
 * @param profileId - ID del perfil del cual obtener las partidas
 * @returns Array con el historial de partidas del perfil
 */
export const getGamesByProfile = (profileId: number): GameRecord[] => {
  return normalizeRows<GameRecord>(db.execSync(
    `SELECT id, profile_id, bombs, columns, rows, result, played_at
     FROM games
     WHERE profile_id = ${profileId}
     ORDER BY played_at DESC;`
  ));
};

/**
 * Inserta un nuevo registro de partida en la base de datos.
 * @param game - Objeto con los datos de la partida a guardar
 * @param game.profileId - ID del perfil que jugó
 * @param game.bombs - Número de bombas en la partida
 * @param game.columns - Número de columnas del tablero
 * @param game.rows - Número de filas del tablero
 * @param game.result - Resultado de la partida (0 o 1)
 * @param game.time - Tiempo que duró la partida en segundos
 * @param game.playedAt - Fecha de juego (opcional, por defecto es la actual)
 * @returns Promise que se resuelve cuando la partida se guarda exitosamente
 * @throws Error si hay un problema al guardar los datos
 */
export const insertGame = (game: {
  profileId: number;
  bombs: number;
  columns: number;
  rows: number;
  result: number;
  time: number;
  playedAt?: string;
}) => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.withTransactionSync(() => {
        db.execSync(
          `INSERT INTO games (profile_id, bombs, columns, rows, result, played_at, time)
           VALUES(${game.profileId}, ${game.bombs}, ${game.columns}, ${game.rows}, ${game.result}, COALESCE('${game.playedAt}', datetime('now')), ${game.time}); `
        );
      });
      resolve();
    } catch (error) {
      console.log("Error al insertar partida:", error);
      reject(error);
    }
  });
};

/**
 * Obtiene el perfil activo actualmente seleccionado.
 * @returns El perfil activo o null si no hay ninguno activo
 */
export const getActiveProfile = (): Profile | null => {
  return db.getFirstSync<Profile>(
    'SELECT id, name, created_at, activo FROM profiles WHERE activo = 1 LIMIT 1;'
  );
};

/**
 * Establece un perfil como activo y desactiva todos los demás perfiles.
 * @param profileId - ID del perfil que se quiere activar
 * @returns Promise que se resuelve cuando la operación se completa exitosamente
 * @throws Error si el perfil no existe o hay un problema en la base de datos
 */
export const setCurrentProfile = (profileId: number) => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.withTransactionSync(() => {
        // Primero desactivar todos los perfiles
        db.execSync('UPDATE profiles SET activo = 0;');

        // Luego activar el perfil seleccionado
        db.execSync(`UPDATE profiles SET activo = 1 WHERE id = ${profileId};`);
      });
      resolve();
    } catch (error) {
      console.log("Error al establecer perfil activo:", error);
      reject(error);
    }
  });
};

export const existsActiveProfile = (): boolean => {
  const activeProfile = getActiveProfile();
  return activeProfile !== null;
};