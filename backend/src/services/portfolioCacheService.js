const cache = new Map();

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key, value, ttlMs = 120000) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function clearPortfolioCache(ownerId = "") {
  const owner = String(ownerId || "");
  for (const key of cache.keys()) {
    if (!owner || key.includes(owner)) cache.delete(key);
  }
}
