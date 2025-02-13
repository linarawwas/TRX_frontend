import { openDB } from 'idb';

const dbPromise = openDB('offline-db', 1, {
  upgrade(db) {
    db.createObjectStore('requests', {
      keyPath: 'id',
      autoIncrement: true,
    });
  },
});

export const saveRequest = async (request) => {
  const db = await dbPromise;
  await db.add('requests', request);
};

export const getAllRequests = async () => {
  const db = await dbPromise;
  return await db.getAll('requests');
};

export const clearRequests = async () => {
  const db = await dbPromise;
  await db.clear('requests');
};
