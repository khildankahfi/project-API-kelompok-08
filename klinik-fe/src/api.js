import { getCache, setCache, invalidate, INVALIDATE_MAP } from "./apiCache.js";

export const BASE = "https://project-api-kelompok-08-production.up.railway.app/api";

export async function api(path, opts = {}, token = null, apiKey = null) {
  const method = (opts.method || "GET").toUpperCase();
  const isGet = method === "GET";
  const cacheKey = isGet ? `${token?.slice(-8) || "pub"}:${path}` : null;

  if (isGet && cacheKey) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (apiKey) headers["X-API-KEY"] = apiKey;

  try {
    const r = await fetch(BASE + path, { ...opts, headers });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.message || Object.values(d.errors || {})[0]?.[0] || "Terjadi kesalahan");

    if (isGet && cacheKey) {
      const ttl = path.includes("reservasi") ? 15 : 60;
      setCache(cacheKey, d, ttl);
    }

    if (!isGet) {
      const rootPath = "/" + path.split("/").filter(Boolean)[0];
      const targets = INVALIDATE_MAP[rootPath] || [rootPath];
      targets.forEach(p => invalidate(`${token?.slice(-8) || "pub"}:${p}`));
    }

    return d;
  } catch (e) {
    if (e.name === "TypeError") throw new Error("Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8000.");
    throw e;
  }
}
