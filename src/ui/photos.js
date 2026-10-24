// Photos in IndexedDB, resized before saving. Owner: A (frontend)
const DB = 'kerpenbaan-photos';
const STORE = 'photos';
let version = 0;
let urlCache = null;
let urlCacheVersion = -1;

function open() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => {
      db.close();
      resolve(req && 'result' in req ? req.result : undefined);
    };
    t.onerror = () => reject(t.error);
  });
}

async function shrink(file, max = 1280) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
}

export const countPhotos = () => tx('readonly', (st) => st.count());
export const listPhotos = () => tx('readonly', (st) => st.getAll());

export async function addPhotos(files) {
  for (const f of files) {
    const blob = await shrink(f);
    await tx('readwrite', (st) => st.add({ blob, name: f.name, at: Date.now() }));
  }
  version++;
  return countPhotos();
}

export async function clearPhotos() {
  await tx('readwrite', (st) => st.clear());
  version++;
}

/** Object URLs for the saved photos (cached until photos change). */
export async function getPhotoUrls() {
  if (urlCache && urlCacheVersion === version) return urlCache;
  urlCache?.forEach((u) => URL.revokeObjectURL(u));
  const items = await listPhotos();
  urlCache = items.map((p) => URL.createObjectURL(p.blob));
  urlCacheVersion = version;
  return urlCache;
}
