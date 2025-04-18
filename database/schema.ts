import * as SQLite from 'expo-sqlite';

const dbPromise = SQLite.openDatabaseAsync('markers.db'); 

const createTableMarkers = 
    `CREATE TABLE IF NOT EXISTS markers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        title CHAR NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`;

const createTableImages = 
    `CREATE TABLE IF NOT EXISTS marker_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marker_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
    );`;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase | undefined> => {
    try {
      const db = await dbPromise;
      await db.execAsync(createTableMarkers);
      await db.execAsync(createTableImages);
      return db;
    } catch (error) {
      console.error('Ошибка при инициализации бд:', error);
      return undefined;
    }
};