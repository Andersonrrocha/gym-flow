import type { InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import localforage from "localforage";

const CACHE_KEY = "gymflow-apollo-cache";
const PERSIST_INTERVAL_MS = 5_000;

const store = localforage.createInstance({
  name: "gymflow",
  storeName: "apollo_cache",
});

export async function restoreCache(cache: InMemoryCache): Promise<void> {
  try {
    const persisted = await store.getItem<NormalizedCacheObject>(CACHE_KEY);
    if (persisted) {
      cache.restore(persisted);
    }
  } catch {
    /* IndexedDB unavailable or corrupt — start fresh */
  }
}

export function startCachePersist(cache: InMemoryCache): () => void {
  const persist = () => {
    store.setItem(CACHE_KEY, cache.extract()).catch(() => {});
  };

  const intervalId = setInterval(persist, PERSIST_INTERVAL_MS);

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") persist();
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    persist();
  };
}

export async function purgePersistedCache(): Promise<void> {
  await store.removeItem(CACHE_KEY).catch(() => {});
}
