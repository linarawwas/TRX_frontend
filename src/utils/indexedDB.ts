import { openDB } from 'idb';

const DB_NAME = 'AreasDB';
const STORE_NAME = 'areas';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: '_id' });
      }
    },
  });
}

export async function saveAreas(areas: any[]) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  areas.forEach((area) => store.put(area));
  await tx.done;
}

export async function getAreas() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}
