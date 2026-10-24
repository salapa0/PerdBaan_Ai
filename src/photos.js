// Photo storage in IndexedDB (raw, no external library). Keys: photo:<id>.
const DB_NAME = 'poetbaan-photos';
const STORE = 'photos';
const urlCache = new Map();

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function tx(mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const r = fn(store);
    t.oncomplete = () => resolve(r && r.result);
    t.onerror = () => reject(t.error);
  }));
}

export function putPhoto(id, blob) { return tx('readwrite', s => s.put(blob, 'photo:' + id)); }
export function invalidateUrl(id) { const u = urlCache.get(id); if (u) { URL.revokeObjectURL(u); urlCache.delete(id); } }
export function getPhoto(id) { return tx('readonly', s => s.get('photo:' + id)); }
export function deletePhoto(id) {
  const u = urlCache.get(id); if (u) { URL.revokeObjectURL(u); urlCache.delete(id); }
  return tx('readwrite', s => s.delete('photo:' + id));
}
export async function clearPhotos() {
  for (const u of urlCache.values()) URL.revokeObjectURL(u);
  urlCache.clear();
  try { await tx('readwrite', s => s.clear()); } catch {}
}

// Returns a cached object URL for a stored photo id (async). Null if missing.
export async function photoURL(id) {
  if (urlCache.has(id)) return urlCache.get(id);
  const blob = await getPhoto(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

// Fetch the bundled demo photos into IndexedDB, return the intake photos[] array.
export async function loadDemoPhotos(demoPhotos) {
  const out = [];
  for (const p of demoPhotos) {
    try {
      const res = await fetch(p.file);
      const blob = await res.blob();
      await putPhoto(p.id, blob);
      out.push({ id: p.id, slot: p.slot });
    } catch (e) {
      console.warn('demo photo failed', p.file, e);
    }
  }
  return out;
}
