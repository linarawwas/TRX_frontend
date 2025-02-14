import { openDB } from 'idb';
const openIndexedDB = async () => {
  return await openDB('MyDatabase', 5, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('requests')) {
        const store = db.createObjectStore('requests', {
          keyPath: 'id', // Assuming each request has a unique id
          autoIncrement: true, // Optional: Automatically increment ids
        });
        store.createIndex('by_id', 'id'); // Optional: Create index if needed
      }
    }
  });
};

export const saveRequest = async (request) => {
  const db = await openIndexedDB();
  const transaction = db.transaction("requests", "readwrite");
  const store = transaction.objectStore("requests");
  store.add(request);
};

export const getPendingRequests = async () => {
  const db = await openIndexedDB();
  const transaction = db.transaction("requests", "readonly");
  const store = transaction.objectStore("requests");
  return store.getAll(); // Get all requests that were stored
};

export const removeRequestFromDb = async (request) => {
  const db = await openIndexedDB();
  const transaction = db.transaction("requests", "readwrite");
  const store = transaction.objectStore("requests");
  store.delete(request.id); // Ensure each request has a unique id
};
