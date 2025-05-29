export function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("TTS_PLUGIN_DB", 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("audio")) {
                db.createObjectStore("audio", {keyPath: "id"});
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function storeAudioBlob(id: string, blob: Blob): Promise<void> {
    const db = await openDatabase();
    const tx = db.transaction("audio", "readwrite");
    const store = tx.objectStore("audio");

    const data = {
        id,
        blob,
        createdAt: Date.now()
    };

    store.put(data);

    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function getAudioBlob(id: string): Promise<Blob | null> {
    const db = await openDatabase();
    const tx = db.transaction("audio", "readonly");
    const store = tx.objectStore("audio");

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result.blob);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
}
