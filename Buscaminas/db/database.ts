import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('buscaminas.db');

// Inicializa la BD y crea tabla si no existe
export const initDatabase = () => {
  db.withTransactionSync(() => {
    db.execSync(
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY NOT NULL,
        bombs INTEGER NOT NULL,
        columns INTEGER NOT NULL,
        rows INTEGER NOT NULL
      );`
    );
  });
  saveGameSettings({ bombs: 10, columns: 10, rows: 10 }); // Valores por defecto
};

// Guarda settings (inserta o actualiza)
export const saveGameSettings = (settings: { bombs: number; columns: number; rows: number }) => {
  return new Promise<void>((resolve, reject) => {
    db.withTransactionSync(() => {
      db.execSync(
        `INSERT OR REPLACE INTO settings (id, bombs, columns, rows) VALUES (1, ` + settings.bombs + `, ` + settings.columns + `, ` + settings.rows + `);`
      );
    });
  });
};

// Carga settings
export const getGameSettings = (): { bombs: number; columns: number; rows: number } | null => {
  return db.getFirstSync<{ bombs: number; columns: number; rows: number }>(
    'SELECT bombs, columns, rows FROM settings WHERE id = 1;'
  );
};