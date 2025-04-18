import { MarkerData, MarkerImage } from '../utils/types';
import { initDatabase } from '../database/schema';

const dbPromise = initDatabase();

export const getAllMarkers = async (): Promise<MarkerData[]> => {
  const db = await dbPromise;
  if (!db) {
    throw new Error("БД не инициализирована");
  }

  const results = await db.getAllAsync<MarkerData>(
    `SELECT * FROM markers ORDER BY created_at DESC`
  );

  if (results) {
    return results;
  }

  return [];
};

export const getMarkerById = async (id: number): Promise<MarkerData | undefined> => {
  const db = await dbPromise;
  if (!db) {
    throw new Error("БД не инициализирована");
  }

  const result = await db.getAllAsync<MarkerData>(
    `SELECT * FROM markers WHERE id = ?`,
    [id]
  );

  if (result) {
    return result[0];
  }

  return undefined;
};

export const getImages = async (markerId: number): Promise<MarkerImage[]> => {
  const db = await dbPromise;
  if (!db) {
    throw new Error("БД не инициализирована");
  }

  const results = await db.getAllAsync<MarkerImage>(
    `SELECT * FROM marker_images WHERE marker_id = ?`,
    [markerId]
  );

  if (results) {
    return results;
  }
  return [];
};

export const addMarker = async (marker: MarkerData): Promise<number | undefined> => {
  const db = await dbPromise;
  if (!db) {
    throw new Error("БД не инициализирована");
  }

  const result = await db.runAsync(
    `INSERT INTO markers (latitude, longitude, title, description, address) VALUES (?, ?, ?, ?, ?)`,
    [marker.latitude, marker.longitude, marker.title, marker.description, marker.address]
  );

  if (result) {
    return result.lastInsertRowId;
  }
  return undefined;
};

export const addImage = async (image: MarkerImage): Promise<void> => {
  const db = await dbPromise;
  if (!db) {
    throw new Error("БД не инициализирована");
  }

  await db.runAsync(
    `INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)`,
    [image.marker_id, image.uri]
  );
};

export const updateMarker = async (marker: MarkerData): Promise<void> => {
  const db = await dbPromise;
  if (!db) {
    throw new Error("БД не инициализирована");
  }

  await db.runAsync(
    `UPDATE markers SET latitude = ?, longitude = ?, title = ?, description = ?, address = ? WHERE id = ?`,
    [marker.latitude, marker.longitude, marker.title, marker.description, marker.address, marker.id!]
  );
};

export const deleteMarker = async (marker: MarkerData): Promise<void> => {
  const db = await dbPromise;
  if (!db) {
    throw new Error("БД не инициализирована");
  }

  await db.runAsync(`DELETE FROM markers WHERE id = ?`, [marker.id!]);
};

export const deleteImage = async (image: MarkerImage): Promise<void> => {
  const db = await dbPromise;
  if (!db) {
    throw new Error('БД не инициализирована');
  }

  await db.runAsync(`DELETE FROM marker_images WHERE id = ?`, [image.id!]);
};