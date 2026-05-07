// IndexedDBにAPIレスポンスをキャッシュする汎用fetch。
// 強制リロード（Cmd+Shift+R / Ctrl+F5）時はキャッシュを無視して再取得する。
// 使い方: import { cachedFetch } from "./cached-fetch.js";
//         const data = await cachedFetch("https://...");

const DB_NAME = "api-cache";
const STORE_NAME = "responses";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readCache(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function writeCache(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// 強制リロード時はブラウザのHTTPキャッシュがバイパスされるため、
// only-if-cachedでの取得が失敗することを利用して判定する。
async function isHardReload() {
  const nav = performance.getEntriesByType("navigation")[0];
  if (nav?.type !== "reload") return false;
  try {
    await fetch(location.href, { cache: "only-if-cached", mode: "same-origin" });
    return false;
  } catch {
    return true;
  }
}

export async function cachedFetch(url) {
  if (!(await isHardReload())) {
    const cached = await readCache(url);
    if (cached) return cached;
  }
  const response = await fetch(url);
  const data = await response.json();
  await writeCache(url, data);
  return data;
}