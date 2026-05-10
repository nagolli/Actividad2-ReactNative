import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('buscaminas.db');
let schemaInitialized = false;

type GameSettings = {
  bombs: number;
  columns: number;
  rows: number;
};

export interface Profile {
  id: number;
  name: string;
  activo: number;
  created_at: string;
}

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

const normalizeRows = <T>(result: any): T[] => {
  if (!result || result.length === 0) return [];
  const rows = result[0].rows;
  if (!rows) return [];
  return Array.isArray(rows._array) ? (rows._array as T[]) : (rows as T[]);
};

const ensureSchema = () => {
  if (schemaInitialized) return;

  db.withTransactionSync(() => {
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

  schemaInitialized = true;
};

export const getGameSettings = (): GameSettings | null => {
  ensureSchema();
  return db.getFirstSync<GameSettings>('SELECT bombs, columns, rows FROM settings WHERE id = 1;');
};

export const saveGameSettings = (settings: GameSettings) => {
  return new Promise<void>((resolve, reject) => {
    try {
      ensureSchema();
      db.withTransactionSync(() => {
        db.execSync(
          `INSERT OR REPLACE INTO settings (id, bombs, columns, rows)
           VALUES (1, ${settings.bombs}, ${settings.columns}, ${settings.rows});`
        );
      });
      resolve();
    } catch (error) {
      console.log('Error al guardar settings en la base de datos:', error);
      reject(error);
    }
  });
};

export const getAllProfiles = (): Profile[] => {
  ensureSchema();
  return normalizeRows<Profile>(
    db.execSync('SELECT id, name, created_at, activo FROM profiles ORDER BY name ASC;')
  );
};

export const getActiveProfile = (): Profile | null => {
  ensureSchema();
  return db.getFirstSync<Profile>('SELECT id, name, created_at, activo FROM profiles WHERE activo = 1 LIMIT 1;');
};

export const existsActiveProfile = (): boolean => {
  const activeProfile = getActiveProfile();
  return activeProfile !== null;
};

export const setCurrentProfile = (profileId: number) => {
  return new Promise<void>((resolve, reject) => {
    try {
      ensureSchema();
      db.withTransactionSync(() => {
        db.execSync('UPDATE profiles SET activo = 0;');
        db.execSync(`UPDATE profiles SET activo = 1 WHERE id = ${profileId};`);
      });
      resolve();
    } catch (error) {
      console.log('Error al establecer perfil activo:', error);
      reject(error);
    }
  });
};

export const insertProfile = (profileName: string, active = false) => {
  return new Promise<void>((resolve, reject) => {
    try {
      ensureSchema();
      db.withTransactionSync(() => {
        const safeProfileName = profileName.replace(/'/g, "''");
        db.execSync(
          `INSERT INTO profiles (name, activo) VALUES ('${safeProfileName}', ${active ? 1 : 0});`
        );
      });
      resolve();
    } catch (error) {
      console.log('Error al insertar perfil:', error);
      reject(error);
    }
  });
};

export const getGamesByProfile = (profileId: number): GameRecord[] => {
  ensureSchema();
  return normalizeRows<GameRecord>(
    db.execSync(
      `SELECT id, profile_id, bombs, columns, rows, result, played_at, time
       FROM games
       WHERE profile_id = ${profileId}
       ORDER BY played_at DESC;`
    )
  );
};

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
      ensureSchema();
      db.withTransactionSync(() => {
        const safePlayedAt = game.playedAt ? `'${game.playedAt}'` : "datetime('now')";
        db.execSync(
          `INSERT INTO games (profile_id, bombs, columns, rows, result, played_at, time)
           VALUES (${game.profileId}, ${game.bombs}, ${game.columns}, ${game.rows}, ${game.result}, ${safePlayedAt}, ${game.time});`
        );
      });
      resolve();
    } catch (error) {
      console.log('Error al insertar partida:', error);
      reject(error);
    }
  });
};

export const initDatabase = () => {
  ensureSchema();

  if (!getGameSettings()) {
    void saveGameSettings({ bombs: 10, columns: 9, rows: 9 });
  }

  if (!existsActiveProfile()) {
    const firstProfile = db.getFirstSync<{ id: number }>('SELECT id FROM profiles ORDER BY id ASC LIMIT 1;');

    db.withTransactionSync(() => {
      db.execSync('UPDATE profiles SET activo = 0;');
      if (firstProfile) {
        db.execSync(`UPDATE profiles SET activo = 1 WHERE id = ${firstProfile.id};`);
      } else {
        db.execSync("INSERT INTO profiles (name, activo) VALUES ('Yo', 1);");
      }
    });
  }
};
