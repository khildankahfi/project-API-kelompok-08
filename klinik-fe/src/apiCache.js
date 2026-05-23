/**
 * apiCache.js — Simple in-memory cache untuk API GET requests.
 *
 * Cara kerja:
 *  - GET /dokters → simpan hasilnya selama `ttl` detik
 *  - Navigasi ke halaman lain lalu balik → pakai cache, tidak hit backend
 *  - Setelah POST/PUT/DELETE → cache di-invalidate otomatis
 *  - Setelah `ttl` detik → cache expired, fetch ulang
 *
 * Kenapa in-memory dan bukan localStorage?
 *  - Data API bisa berubah kapan saja → tidak cocok persist ke disk
 *  - In-memory reset tiap refresh → selalu fresh saat buka baru
 */

const store = new Map(); // key → { data, expireAt }

const DEFAULT_TTL = 30; // detik

/**
 * Ambil dari cache. Return null kalau tidak ada atau sudah expired.
 */
export function getCache(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expireAt) {
        store.delete(key);
        return null;
    }
    return entry.data;
}

/**
 * Simpan ke cache.
 * @param {string} key   - biasanya path API, e.g. "/dokters"
 * @param {any}    data  - response data
 * @param {number} ttl   - detik sebelum expired (default 30)
 */
export function setCache(key, data, ttl = DEFAULT_TTL) {
    store.set(key, { data, expireAt: Date.now() + ttl * 1000 });
}

/**
 * Hapus cache untuk key tertentu atau semua key yang dimulai dengan prefix.
 * Dipanggil otomatis setelah mutasi (POST/PUT/DELETE/PATCH).
 *
 * Contoh: invalidate("/dokters") → hapus cache /dokters dan /dokters/1
 */
export function invalidate(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

/**
 * Mapping: kalau mutasi ke path X, invalidate cache Y.
 * Supaya setelah tambah dokter, halaman dokter auto-refresh.
 */
export const INVALIDATE_MAP = {
    "/dokters": ["/dokters"],
    "/jadwals": ["/jadwals", "/dokters"],   // jadwal ada di dokter.jadwals
    "/reservasis": ["/reservasis", "/admin/reservasis"],
    "/admin/reservasis": ["/reservasis", "/admin/reservasis"],
    "/rekam-medis": ["/rekam-medis", "/reservasis"],
};