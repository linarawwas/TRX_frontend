import { openDB } from "idb";

const DB_NAME = "MyDatabase";
const STORE_NAME = "areas";

// Save areas to IndexedDB
export async function saveAreasToDB(dayId: string, data: any) {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        // Create the object store only if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "dayId" });
        }
      },
    });
  
    // Add areas data to the store
    const tx = db.transaction(STORE_NAME, "readwrite");
    await tx.store.put({ dayId, data });
    await tx.done;
  }
  

// Get areas from IndexedDB
export async function getAreasFromDB(dayId: string) {
  const db = await openDB(DB_NAME, 1);
  return (await db.get(STORE_NAME, dayId))?.data || null;
}
