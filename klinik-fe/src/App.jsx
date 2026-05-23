import { useState, useEffect, useCallback } from "react";
import { getCache, setCache, invalidate, INVALIDATE_MAP } from "./apiCache.js";

const BASE = "http://127.0.0.1:8000/api";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary:       #0a7c6e;
    --primary-dark:  #065f53;
    --primary-mid:   #14a090;
    --primary-light: #e6f4f2;
    --danger:        #ef4444;
    --success:       #10b981;
    --warning:       #d97706;
    --bg:            #f0f4f3;
    --surface:       #ffffff;
    --surface-2:     #f8faf9;
    --border:        #e2ebe8;
    --border-strong: #c8d8d4;
    --text-1:        #0d1f1c;
    --text-2:        #3d5a54;
    --text-3:        #7a9991;
    --sidebar-bg:    #0d1f1c;
    --sidebar-w:     270px;
    --header-h:      68px;
    --r-sm:  8px;
    --r-md:  12px;
    --r-lg:  16px;
    --r-xl:  24px;
    --sh-sm: 0 1px 3px rgba(0,0,0,0.06);
    --sh-md: 0 4px 16px rgba(0,0,0,0.08);
    --sh-lg: 0 20px 60px rgba(0,0,0,0.18);
    --tr:    0.18s ease;
    --font:  'Plus Jakarta Sans', -apple-system, sans-serif;
  }

  html, body { font-family: var(--font); background: var(--bg); color: var(--text-1); -webkit-font-smoothing: antialiased; font-size: 15px; }
  input, select, textarea, button { font-family: var(--font); }
  input:focus, select:focus, textarea:focus { outline: none !important; border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(10,124,110,0.13) !important; }
  input::placeholder, textarea::placeholder { color: var(--text-3); }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
  @keyframes spin    { to { transform: rotate(360deg); } }

  /* ── LAYOUT ── */
  .app-shell { display:flex; min-height:100vh; }

  .sidebar {
    width: var(--sidebar-w); flex-shrink:0;
    background: var(--sidebar-bg);
    position: fixed; top:0; left:0; bottom:0; z-index:200;
    display: flex; flex-direction:column;
    transition: transform var(--tr);
  }
  .sb-logo {
    padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items:center; gap:14px; flex-shrink:0;
  }
  .sb-logo-icon { width:44px; height:44px; background:var(--primary); border-radius:var(--r-sm); display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
  .sb-logo-name { font-size:16px; font-weight:700; color:#fff; line-height:1.2; }
  .sb-logo-role { font-size:12px; color:rgba(255,255,255,0.32); margin-top:2px; }

  .sb-nav { padding:12px 10px; flex:1; overflow-y:auto; }
  .sb-section { font-size:10px; font-weight:700; letter-spacing:0.1em; color:rgba(255,255,255,0.22); text-transform:uppercase; padding:10px 12px 6px; }
  .nav-btn {
    display:flex; align-items:center; gap:12px;
    width:100%; padding:11px 14px; border-radius:var(--r-sm);
    color:rgba(255,255,255,0.45); font-size:14px; font-weight:500;
    cursor:pointer; border:none; background:transparent;
    text-align:left; transition:all var(--tr); margin-bottom:3px;
  }
  .nav-btn:hover  { color:rgba(255,255,255,0.8); background:rgba(255,255,255,0.06); }
  .nav-btn.active { color:#fff; background:var(--primary); font-weight:600; }
  .nav-icon { font-size:18px; width:22px; text-align:center; flex-shrink:0; }

  .sb-footer { padding:16px 18px 20px; border-top:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
  .sb-user { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
  .avatar { border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; flex-shrink:0; }
  .av-lg { width:40px; height:40px; font-size:14px; }
  .av-sm { width:34px; height:34px; font-size:13px; }
  .sb-name  { font-size:14px; font-weight:600; color:#fff; line-height:1.3; }
  .sb-email { font-size:12px; color:rgba(255,255,255,0.32); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
  .btn-logout { width:100%; padding:10px; background:rgba(239,68,68,0.1); color:#fca5a5; border:1px solid rgba(239,68,68,0.2); border-radius:var(--r-sm); cursor:pointer; font-size:13px; font-weight:600; transition:all var(--tr); font-family:var(--font); }
  .btn-logout:hover { background:rgba(239,68,68,0.2); }

  .sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:199; animation:fadeIn .2s ease; }

  .main-wrap { margin-left:var(--sidebar-w); flex:1; display:flex; flex-direction:column; min-height:100vh; min-width:0; }

  .topbar {
    height:var(--header-h); background:var(--surface); border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 36px; position:sticky; top:0; z-index:100; box-shadow:var(--sh-sm);
    flex-shrink:0;
  }
  .topbar-l { display:flex; align-items:center; gap:14px; min-width:0; }
  .topbar-title { font-size:18px; font-weight:700; color:var(--text-1); white-space:nowrap; }
  .topbar-sub   { font-size:12px; color:var(--text-3); white-space:nowrap; margin-top:2px; }
  .hamburger { display:none; width:38px; height:38px; border:1.5px solid var(--border); background:var(--surface-2); border-radius:var(--r-sm); cursor:pointer; font-size:18px; align-items:center; justify-content:center; flex-shrink:0; }

  .page-body { padding:32px 36px; flex:1; width:100%; }

  /* ── CARDS ── */
  .card { background:var(--surface); border-radius:var(--r-lg); border:1px solid var(--border); box-shadow:var(--sh-sm); overflow:hidden; }
  .card-p { padding:28px; }

  /* ── BUTTONS ── */
  .btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:var(--r-sm); font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all var(--tr); white-space:nowrap; font-family:var(--font); }
  .btn:disabled { opacity:0.55; cursor:not-allowed; }
  .btn-primary { background:var(--primary); color:#fff; }
  .btn-primary:hover:not(:disabled) { background:var(--primary-dark); transform:translateY(-1px); box-shadow:0 4px 14px rgba(10,124,110,0.3); }
  .btn-outline { background:transparent; color:var(--text-2); border:1.5px solid var(--border-strong); }
  .btn-outline:hover:not(:disabled) { border-color:var(--primary); color:var(--primary); background:var(--primary-light); }
  .btn-danger  { background:var(--danger); color:#fff; }
  .btn-danger:hover:not(:disabled)  { background:#dc2626; }
  .btn-ghost   { background:var(--surface-2); color:var(--text-2); border:1.5px solid var(--border); }
  .btn-ghost:hover:not(:disabled)   { background:var(--border); }
  .btn-sm   { padding:7px 14px; font-size:13px; }
  .btn-full { width:100%; justify-content:center; }
  .btn-lg   { padding:14px 30px; font-size:16px; border-radius:var(--r-md); }

  /* ── BADGES ── */
  .badge { display:inline-flex; align-items:center; padding:4px 12px; border-radius:99px; font-size:12px; font-weight:600; }
  .b-pending      { background:#fef3c7; color:#92400e; }
  .b-dikonfirmasi { background:#dbeafe; color:#1e40af; }
  .b-selesai      { background:#dcfce7; color:#14532d; }
  .b-dibatalkan   { background:#fee2e2; color:#991b1b; }
  .b-admin        { background:#ede9fe; color:#5b21b6; }
  .b-pasien       { background:#e0f2fe; color:#075985; }
  .b-aktif        { background:#dcfce7; color:#14532d; }
  .b-nonaktif     { background:#f1f5f9; color:#475569; }

  /* ── FORM ── */
  .fld { margin-bottom:18px; }
  .lbl { display:block; font-size:13px; font-weight:600; color:var(--text-2); margin-bottom:7px; }
  .lbl span { color:var(--danger); }
  .inp { width:100%; padding:11px 15px; border:1.5px solid var(--border); border-radius:var(--r-sm); font-size:14px; color:var(--text-1); background:var(--surface); transition:border-color var(--tr); display:block; }
  .inp:hover { border-color:var(--border-strong); }
  textarea.inp { min-height:96px; resize:vertical; line-height:1.6; }

  /* ── TABLE ── */
  .tbl-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  thead tr { border-bottom:2px solid var(--border); background: var(--surface-2); }
  th { padding:13px 18px; text-align:left; font-size:11px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:0.07em; white-space:nowrap; }
  td { padding:15px 18px; color:var(--text-1); font-size:14px; vertical-align:middle; border-bottom:1px solid var(--surface-2); }
  tbody tr:last-child td { border-bottom:none; }
  tbody tr:hover { background:var(--surface-2); }
  .acts { display:flex; gap:8px; justify-content:flex-end; }

  /* ── MODAL ── */
  .modal-bg { position:fixed; inset:0; background:rgba(13,31,28,0.72); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn .2s ease; backdrop-filter:blur(4px); }
  .modal-box { background:var(--surface); border-radius:var(--r-xl); width:100%; max-width:540px; max-height:92vh; display:flex; flex-direction:column; box-shadow:var(--sh-lg); animation:scaleIn .22s ease; }
  .modal-head { display:flex; align-items:center; justify-content:space-between; padding:22px 28px; border-bottom:1px solid var(--border); }
  .modal-title { font-size:18px; font-weight:700; color:var(--text-1); }
  .modal-x { width:34px; height:34px; border:none; background:var(--surface-2); border-radius:50%; cursor:pointer; font-size:18px; color:var(--text-3); display:flex; align-items:center; justify-content:center; transition:all var(--tr); }
  .modal-x:hover { background:var(--border); color:var(--text-1); }
  .modal-body { padding:28px; overflow-y:auto; }

  /* ── STAT ── */
  .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; }
  .stat-card { background:var(--surface); border-radius:var(--r-lg); border:1px solid var(--border); padding:28px; box-shadow:var(--sh-sm); position:relative; overflow:hidden; }
  .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--primary),var(--primary-mid)); }
  .stat-icon { font-size:36px; margin-bottom:16px; }
  .stat-lbl  { font-size:14px; color:var(--text-3); margin-bottom:8px; }
  .stat-val  { font-size:42px; font-weight:800; color:var(--text-1); line-height:1; }

  /* ── DOCTOR CARDS ── */
  .doc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:22px; }
  .doc-card { background:var(--surface); border-radius:var(--r-lg); border:1.5px solid var(--border); padding:28px; box-shadow:var(--sh-sm); display:flex; flex-direction:column; transition:all var(--tr); }
  .doc-card:hover { border-color:var(--primary); box-shadow:var(--sh-md); transform:translateY(-2px); }
  .doc-ava { width:64px; height:64px; border-radius:var(--r-md); background:linear-gradient(135deg,var(--primary),var(--primary-mid)); display:flex; align-items:center; justify-content:center; font-size:30px; margin-bottom:18px; }

  /* ── SHORTCUT ── */
  .shortcut-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:18px; margin-bottom:36px; }
  .shortcut-card { background:var(--surface); border-radius:var(--r-lg); border:1.5px solid var(--border); padding:28px; cursor:pointer; text-align:left; transition:all var(--tr); box-shadow:var(--sh-sm); font-family:var(--font); }
  .shortcut-card:hover { border-color:var(--primary); background:var(--primary-light); transform:translateY(-2px); box-shadow:var(--sh-md); }

  /* ── ALERTS ── */
  .alert { padding:13px 16px; border-radius:var(--r-sm); font-size:14px; font-weight:500; margin-bottom:18px; }
  .a-err  { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; }
  .a-ok   { background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; }
  .a-info { background:var(--primary-light); color:var(--primary-dark); border:1px solid #a7d8d3; }
  .a-warn { background:#fffbeb; color:var(--warning); border:1px solid #fde68a; }

  /* ── TOAST ── */
  .toast { position:fixed; bottom:28px; right:28px; z-index:9999; padding:15px 22px; border-radius:var(--r-md); font-size:14px; font-weight:600; max-width:360px; box-shadow:var(--sh-lg); animation:fadeUp .3s ease; cursor:pointer; }
  .t-success { background:#064e3b; color:#a7f3d0; }
  .t-error   { background:#7f1d1d; color:#fecaca; }
  .t-info    { background:#1e3a5f; color:#bae6fd; }

  /* ── PAGE HEADER ── */
  .ph { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; gap:16px; flex-wrap:wrap; }
  .ph h2 { font-size:24px; font-weight:800; color:var(--text-1); margin-bottom:5px; }
  .ph p  { font-size:14px; color:var(--text-3); }

  /* ── EMPTY / ERROR ── */
  .empty { text-align:center; padding:64px 24px; color:var(--text-3); }
  .empty-ic { font-size:52px; margin-bottom:16px; opacity:0.55; }
  .empty-t  { font-size:17px; font-weight:700; color:var(--text-2); margin-bottom:8px; }
  .empty-s  { font-size:14px; }

  .error-state { text-align:center; padding:56px 24px; }
  .error-state .error-ic  { font-size:48px; margin-bottom:14px; }
  .error-state .error-msg { font-size:15px; font-weight:600; color:#991b1b; margin-bottom:6px; }
  .error-state .error-sub { font-size:13px; color:var(--text-3); margin-bottom:20px; }

  /* ── MISC ── */
  .divider   { border:none; border-top:1px solid var(--border); margin:20px 0; }
  .mono      { font-family:'Courier New',monospace; font-size:13px; }
  .truncate  { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:220px; display:inline-block; }
  .spinner   { width:22px; height:22px; border:2.5px solid var(--border); border-top-color:var(--primary); border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
  .loading-c { display:flex; align-items:center; justify-content:center; gap:14px; padding:64px; color:var(--text-3); font-size:15px; }
  .grid-2    { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .detail-row { display:grid; grid-template-columns:140px 1fr; gap:10px; align-items:start; margin-bottom:16px; }
  .detail-k   { font-size:12px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:0.06em; padding-top:2px; }
  .detail-v   { font-size:14px; color:var(--text-1); line-height:1.65; }
  .rekam-ok { background:#ecfdf5; border-radius:var(--r-md); border:1px solid #a7f3d0; padding:16px; margin-top:16px; }
  .info-box  { background:var(--primary-light); border-radius:var(--r-sm); border:1px solid #a7d8d3; padding:12px 16px; font-size:13px; color:var(--primary-dark); margin-bottom:18px; }
  .fade-up   { animation: fadeUp .32s ease both; }
  .search-wrap { position:relative; max-width:400px; margin-bottom:28px; }
  .search-ico  { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:16px; color:var(--text-3); pointer-events:none; }
  .search-inp  { padding-left:44px !important; }

  /* ── AUTH ── */
  .auth-bg { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; background:var(--sidebar-bg); position:relative; overflow:hidden; }
  .auth-bg::before { content:''; position:absolute; top:-200px; right:-200px; width:600px; height:600px; background:radial-gradient(circle,rgba(10,124,110,0.15) 0%,transparent 70%); border-radius:50%; pointer-events:none; }
  .auth-bg::after  { content:''; position:absolute; bottom:-100px; left:-100px; width:400px; height:400px; background:radial-gradient(circle,rgba(20,160,144,0.1) 0%,transparent 70%); border-radius:50%; pointer-events:none; }
  .auth-card { background:var(--surface); border-radius:var(--r-xl); padding:48px 44px; width:100%; max-width:440px; box-shadow:var(--sh-lg); position:relative; z-index:1; animation:fadeUp .38s ease; }
  .auth-logo { text-align:center; margin-bottom:36px; }
  .auth-logo-ic { width:72px; height:72px; background:linear-gradient(135deg,var(--primary),var(--primary-mid)); border-radius:var(--r-lg); display:flex; align-items:center; justify-content:center; font-size:34px; margin:0 auto 18px; box-shadow:0 8px 32px rgba(10,124,110,0.28); }
  .auth-logo h1 { font-size:28px; font-weight:800; color:var(--text-1); margin-bottom:8px; }
  .auth-logo p  { font-size:14px; color:var(--text-3); }
  .auth-btn { width:100%; padding:14px; margin-top:8px; background:var(--primary); color:#fff; border:none; border-radius:var(--r-md); font-size:16px; font-weight:700; cursor:pointer; transition:all var(--tr); font-family:var(--font); }
  .auth-btn:hover:not(:disabled) { background:var(--primary-dark); transform:translateY(-1px); box-shadow:0 6px 20px rgba(10,124,110,0.32); }
  .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .auth-footer { text-align:center; margin-top:24px; font-size:14px; color:var(--text-3); }
  .auth-link { color:var(--primary); font-weight:700; background:none; border:none; cursor:pointer; font-family:var(--font); font-size:14px; }
  .auth-link:hover { text-decoration:underline; }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .page-body { padding:24px 28px; }
    .topbar    { padding:0 28px; }
  }
  @media (max-width: 900px) {
    .sidebar { transform:translateX(-100%); }
    .sidebar.open { transform:translateX(0); }
    .sb-overlay.open { display:block; }
    .main-wrap { margin-left:0; }
    .hamburger { display:flex; }
    .topbar    { padding:0 18px; }
    .page-body { padding:20px 18px; }
  }
  @media (max-width: 640px) {
    :root { --r-xl: 16px; }
    .auth-card  { padding:30px 24px; }
    .stat-grid  { grid-template-columns:1fr 1fr; }
    .doc-grid   { grid-template-columns:1fr; }
    .shortcut-grid { grid-template-columns:1fr 1fr; }
    .ph         { flex-direction:column; }
    .grid-2     { grid-template-columns:1fr; }
    .modal-box  { max-width:100%; }
    .toast      { bottom:16px; right:16px; left:16px; max-width:none; }
    .detail-row { grid-template-columns:1fr; gap:3px; }
    .topbar-sub { display:none; }
  }
`;

// ─── API ──────────────────────────────────────────────────────────────────────
async function api(path, opts = {}, token = null, apiKey = null) {
  const method = (opts.method || "GET").toUpperCase();
  const isGet = method === "GET";
  // Cache key menyertakan token agar data admin & pasien tidak tercampur
  const cacheKey = isGet ? `${token?.slice(-8) || "pub"}:${path}` : null;

  // ── Serve from cache untuk GET request ──────────────────────────────────
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

    // ── Simpan ke cache kalau GET berhasil ─────────────────────────────────
    if (isGet && cacheKey) {
      // Endpoint real-time (status reservasi) TTL lebih pendek
      const ttl = path.includes("reservasi") ? 15 : 60;
      setCache(cacheKey, d, ttl);
    }

    // ── Invalidate cache terkait setelah mutasi ────────────────────────────
    if (!isGet) {
      // Cari root path (e.g. "/dokters/3" → "/dokters")
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

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function Badge({ label }) {
  const m = { pending: "b-pending", dikonfirmasi: "b-dikonfirmasi", selesai: "b-selesai", dibatalkan: "b-dibatalkan", admin: "b-admin", pasien: "b-pasien", aktif: "b-aktif", nonaktif: "b-nonaktif" };
  return <span className={`badge ${m[String(label)] || "b-nonaktif"}`}>{label}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, req, children }) {
  return (
    <div className="fld">
      <label className="lbl">{label}{req && <span> *</span>}</label>
      {children}
    </div>
  );
}

function Inp(p) { return <input className="inp" {...p} />; }
function Sel({ children, ...p }) { return <select className="inp" {...p}>{children}</select>; }
function Txta(p) { return <textarea className="inp" {...p} />; }

function PH({ title, sub, action }) {
  return (
    <div className="ph">
      <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

function Loading() {
  return <div className="loading-c"><div className="spinner" /><span>Memuat data...</span></div>;
}

function Empty({ icon = "📋", title, sub }) {
  return (
    <div className="empty">
      <div className="empty-ic">{icon}</div>
      <div className="empty-t">{title}</div>
      {sub && <div className="empty-s">{sub}</div>}
    </div>
  );
}

// Komponen error dengan tombol retry
function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-ic">⚠️</div>
      <div className="error-msg">Gagal Memuat Data</div>
      <div className="error-sub">{message || "Terjadi kesalahan saat mengambil data."}</div>
      {onRetry && <button className="btn btn-outline" onClick={onRetry}>🔄 Coba Lagi</button>}
    </div>
  );
}

function Table({ cols, data, actions }) {
  if (!data?.length) return <Empty title="Belum ada data" sub="Data akan tampil di sini" />;
  return (
    <div className="tbl-wrap">
      <table>
        <thead><tr>
          {cols.map(c => <th key={c.key}>{c.label}</th>)}
          {actions && <th style={{ textAlign: "right" }}>Aksi</th>}
        </tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {cols.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}</td>)}
              {actions && <td><div className="acts">{actions(row)}</div></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onGoto, loading, error }) {
  const [f, setF] = useState({ email: "", password: "" });
  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-ic">🏥</div>
          <h1>Klinik Sehat</h1>
          <p>Masuk ke akun Anda</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onLogin(f.email, f.password); }}>
          {error && <div className="alert a-err">{error}</div>}
          <Field label="Email" req><Inp type="email" value={f.email} onChange={s("email")} placeholder="nama@email.com" required /></Field>
          <Field label="Password" req><Inp type="password" value={f.password} onChange={s("password")} placeholder="••••••••" required /></Field>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? "Memuat..." : "Masuk →"}</button>
        </form>
        <div className="auth-footer">
          Belum punya akun? <button className="auth-link" onClick={() => onGoto("register")}>Daftar sekarang</button>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister, onGoto, loading, error }) {
  const [f, setF] = useState({ name: "", email: "", password: "", no_hp: "" });
  const s = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-ic">✨</div>
          <h1>Daftar Akun</h1>
          <p>Buat akun pasien baru</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onRegister(f); }}>
          {error && <div className="alert a-err">{error}</div>}
          <Field label="Nama Lengkap" req><Inp value={f.name} onChange={s("name")} placeholder="Nama lengkap" required /></Field>
          <Field label="Email" req><Inp type="email" value={f.email} onChange={s("email")} placeholder="nama@email.com" required /></Field>
          <Field label="Password" req><Inp type="password" value={f.password} onChange={s("password")} placeholder="Min. 6 karakter" required minLength={6} /></Field>
          <Field label="No. HP"><Inp value={f.no_hp} onChange={s("no_hp")} placeholder="08xx-xxxx-xxxx" /></Field>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? "Mendaftar..." : "Daftar Sekarang →"}</button>
        </form>
        <div className="auth-footer">
          Sudah punya akun? <button className="auth-link" onClick={() => onGoto("login")}>Masuk</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN SECTIONS ───────────────────────────────────────────────────────────
function AdminHome({ call, user }) {
  const [s, setS] = useState({ d: null, j: null, r: null, rv: null });

  useEffect(() => {
    // Load setiap stat secara independen agar satu error tidak blokir yang lain
    call("/dokters").then(d => setS(p => ({ ...p, d: d.data.length }))).catch(() => setS(p => ({ ...p, d: "—" })));
    call("/jadwals").then(j => setS(p => ({ ...p, j: j.data.length }))).catch(() => setS(p => ({ ...p, j: "—" })));
    call("/rekam-medis", {}, true).then(r => setS(p => ({ ...p, r: r.data.length }))).catch(() => setS(p => ({ ...p, r: "—" })));
    call("/admin/reservasis", {}, true).then(rv => setS(p => ({ ...p, rv: rv.data.length }))).catch(() => setS(p => ({ ...p, rv: "—" })));
  }, []);

  const stats = [
    { ic: "👨‍⚕️", lb: "Total Dokter", val: s.d },
    { ic: "📅", lb: "Total Jadwal", val: s.j },
    { ic: "📋", lb: "Total Reservasi", val: s.rv },
    { ic: "🏥", lb: "Rekam Medis", val: s.r },
  ];

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Selamat datang, {user.name} 👋</h2>
        <p style={{ color: "var(--text-3)", fontSize: 15 }}>Panel Administrasi Klinik Sehat</p>
      </div>
      <div className="stat-grid">
        {stats.map(({ ic, lb, val }) => (
          <div className="stat-card" key={lb}>
            <div className="stat-icon">{ic}</div>
            <div className="stat-lbl">{lb}</div>
            <div className="stat-val">{val === null ? <span className="spinner" style={{ width: 28, height: 28 }} /> : val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DokterMgmt({ call }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await call("/dokters");
      setData(r.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      modal === "add"
        ? await call("/dokters", { method: "POST", body: JSON.stringify(form) }, true)
        : await call(`/dokters/${form.id}`, { method: "PUT", body: JSON.stringify(form) }, true);
      await load(); setModal(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm("Hapus dokter ini? Data jadwal terkait juga akan terhapus.")) return;
    try { await call(`/dokters/${id}`, { method: "DELETE" }, true); await load(); }
    catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div className="fade-up">
      <PH title="Manajemen Dokter" sub="Kelola data dokter klinik"
        action={<button className="btn btn-primary" onClick={() => { setForm({ nama: "", spesialisasi: "", no_str: "", biaya_konsultasi: "", bio: "" }); setModal("add"); }}>+ Tambah Dokter</button>} />
      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : <Table
          cols={[
            { key: "nama", label: "Nama Dokter" },
            { key: "spesialisasi", label: "Spesialisasi" },
            { key: "no_str", label: "No. STR" },
            { key: "biaya_konsultasi", label: "Biaya", render: v => `Rp ${Number(v).toLocaleString("id-ID")}` },
          ]}
          data={data}
          actions={row => <>
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({ ...row }); setModal("edit"); }}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(row.id)}>Hapus</button>
          </>}
        />}
      </div>
      {modal && (
        <Modal title={modal === "add" ? "Tambah Dokter" : "Edit Dokter"} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            <Field label="Nama Dokter" req><Inp value={form.nama || ""} onChange={s("nama")} required /></Field>
            <Field label="Spesialisasi" req><Inp value={form.spesialisasi || ""} onChange={s("spesialisasi")} required /></Field>
            <Field label="No. STR" req><Inp value={form.no_str || ""} onChange={s("no_str")} required /></Field>
            <Field label="Biaya Konsultasi (Rp)" req><Inp type="number" value={form.biaya_konsultasi || ""} onChange={s("biaya_konsultasi")} required min={0} /></Field>
            <Field label="Bio"><Txta value={form.bio || ""} onChange={s("bio")} placeholder="Deskripsi singkat..." /></Field>
            <hr className="divider" />
            <div className="acts">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function JadwalMgmt({ call }) {
  const [data, setData] = useState([]);
  const [dokters, setDokters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [j, d] = await Promise.all([call("/jadwals"), call("/dokters")]);
      setData(j.data); setDokters(d.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      modal === "add"
        ? await call("/jadwals", { method: "POST", body: JSON.stringify(form) }, true)
        : await call(`/jadwals/${form.id}`, { method: "PUT", body: JSON.stringify(form) }, true);
      await load(); setModal(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm("Hapus jadwal ini?")) return;
    try { await call(`/jadwals/${id}`, { method: "DELETE" }, true); await load(); }
    catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div className="fade-up">
      <PH title="Manajemen Jadwal" sub="Kelola jadwal praktik dokter"
        action={<button className="btn btn-primary" onClick={() => { setForm({ dokter_id: "", hari: "Senin", jam_mulai: "08:00", jam_selesai: "12:00", kuota: 10, is_aktif: 1 }); setModal("add"); }}>+ Tambah Jadwal</button>} />
      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : <Table
          cols={[
            { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
            { key: "hari", label: "Hari" },
            { key: "jam_mulai", label: "Mulai" },
            { key: "jam_selesai", label: "Selesai" },
            { key: "kuota", label: "Kuota", render: v => `${v} pasien` },
            { key: "is_aktif", label: "Status", render: v => <Badge label={v ? "aktif" : "nonaktif"} /> },
          ]}
          data={data}
          actions={row => <>
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({ ...row, dokter_id: row.dokter_id || row.dokter?.id }); setModal("edit"); }}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(row.id)}>Hapus</button>
          </>}
        />}
      </div>
      {modal && (
        <Modal title={modal === "add" ? "Tambah Jadwal" : "Edit Jadwal"} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            <Field label="Dokter" req>
              <Sel value={form.dokter_id || ""} onChange={s("dokter_id")} required>
                <option value="">Pilih dokter...</option>
                {dokters.map(d => <option key={d.id} value={d.id}>{d.nama} — {d.spesialisasi}</option>)}
              </Sel>
            </Field>
            <Field label="Hari" req>
              <Sel value={form.hari || "Senin"} onChange={s("hari")}>{HARI.map(h => <option key={h}>{h}</option>)}</Sel>
            </Field>
            <div className="grid-2">
              <Field label="Jam Mulai" req><Inp type="time" value={form.jam_mulai || ""} onChange={s("jam_mulai")} required /></Field>
              <Field label="Jam Selesai" req><Inp type="time" value={form.jam_selesai || ""} onChange={s("jam_selesai")} required /></Field>
            </div>
            <div className="grid-2">
              <Field label="Kuota" req><Inp type="number" value={form.kuota || ""} onChange={s("kuota")} required min={1} /></Field>
              <Field label="Status">
                <Sel value={form.is_aktif} onChange={e => setForm(p => ({ ...p, is_aktif: Number(e.target.value) }))}>
                  <option value={1}>Aktif</option><option value={0}>Nonaktif</option>
                </Sel>
              </Field>
            </div>
            <hr className="divider" />
            <div className="acts">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Admin: Kelola semua reservasi pasien
function AdminReservasi({ call, showToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [updating, setUpdating] = useState(null);

  const STATUS_LIST = ["pending", "dikonfirmasi", "selesai", "dibatalkan"];

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await call("/admin/reservasis", {}, true);
      setData(r.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await call(`/admin/reservasis/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, true);
      showToast(`Status diperbarui ke "${status}" ✅`);
      await load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="fade-up">
      <PH title="Manajemen Reservasi" sub="Konfirmasi dan kelola semua reservasi pasien" />
      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : <Table
          cols={[
            { key: "nomor_antrian", label: "No. Antrian", render: v => <span className="mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{v}</span> },
            { key: "user", label: "Pasien", render: v => v?.name || "—" },
            { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
            { key: "tanggal_reservasi", label: "Tanggal" },
            { key: "status", label: "Status", render: v => <Badge label={v} /> },
          ]}
          data={data}
          actions={row => <>
            <button className="btn btn-outline btn-sm" onClick={() => setDetail(row)}>Detail</button>
            <Sel
              value={row.status}
              onChange={e => updateStatus(row.id, e.target.value)}
              disabled={updating === row.id}
              style={{ padding: "6px 10px", fontSize: 13, width: "auto", minWidth: 140 }}
            >
              {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </Sel>
          </>}
        />}
      </div>
      {detail && (
        <Modal title="Detail Reservasi" onClose={() => setDetail(null)}>
          {[
            ["No. Antrian", <span className="mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{detail.nomor_antrian}</span>],
            ["Pasien", detail.user?.name || "—"],
            ["Dokter", detail.dokter?.nama || "—"],
            ["Tanggal", detail.tanggal_reservasi],
            ["Status", <Badge label={detail.status} />],
            ["Keluhan", detail.keluhan],
          ].map(([k, v]) => <div className="detail-row" key={k}><span className="detail-k">{k}</span><span className="detail-v">{v}</span></div>)}
          <div className="acts" style={{ marginTop: 16 }}><button className="btn btn-ghost" onClick={() => setDetail(null)}>Tutup</button></div>
        </Modal>
      )}
    </div>
  );
}

function RekamMedisMgmt({ call }) {
  const [data, setData] = useState([]);
  const [dokters, setDokters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [r, d] = await Promise.all([call("/rekam-medis", {}, true), call("/dokters")]);
      setData(r.data); setDokters(d.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      modal === "add"
        ? await call("/rekam-medis", { method: "POST", body: JSON.stringify(form) }, true)
        : await call(`/rekam-medis/${form.id}`, { method: "PUT", body: JSON.stringify(form) }, true);
      await load(); setModal(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm("Hapus rekam medis ini?")) return;
    try { await call(`/rekam-medis/${id}`, { method: "DELETE" }, true); await load(); }
    catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div className="fade-up">
      <PH title="Rekam Medis" sub="Kelola rekam medis seluruh pasien"
        action={<button className="btn btn-primary" onClick={() => { setForm({ reservasi_id: "", tanggal_periksa: "", diagnosis: "", resep_obat: "", catatan_dokter: "" }); setModal("add"); }}>+ Tambah</button>} />
      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : <Table
          cols={[
            { key: "user", label: "Pasien", render: v => v?.name || "—" },
            { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
            { key: "tanggal_periksa", label: "Tanggal" },
            { key: "diagnosis", label: "Diagnosis", render: v => <span className="truncate" title={v}>{v?.length > 50 ? v.slice(0, 50) + "…" : v}</span> },
          ]}
          data={data}
          actions={row => <>
            <button className="btn btn-outline btn-sm" onClick={() => setDetail(row)}>Detail</button>
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({ ...row }); setModal("edit"); }}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(row.id)}>Hapus</button>
          </>}
        />}
      </div>
      {detail && (
        <Modal title="Detail Rekam Medis" onClose={() => setDetail(null)}>
          {[["Pasien", detail.user?.name], ["Dokter", detail.dokter?.nama], ["Tanggal", detail.tanggal_periksa], ["Diagnosis", detail.diagnosis], ["Resep Obat", detail.resep_obat], ["Catatan", detail.catatan_dokter || "—"]].map(([k, v]) => (
            <div className="detail-row" key={k}><span className="detail-k">{k}</span><span className="detail-v">{v}</span></div>
          ))}
          <div className="acts" style={{ marginTop: 8 }}><button className="btn btn-ghost" onClick={() => setDetail(null)}>Tutup</button></div>
        </Modal>
      )}
      {modal && (
        <Modal title={modal === "add" ? "Tambah Rekam Medis" : "Edit Rekam Medis"} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            {modal === "add" && (
              <Field label="ID Reservasi" req>
                <Inp type="number" value={form.reservasi_id || ""} onChange={s("reservasi_id")} required placeholder="ID reservasi yang sudah dikonfirmasi" />
              </Field>
            )}
            <Field label="Tanggal Periksa" req><Inp type="date" value={form.tanggal_periksa || ""} onChange={s("tanggal_periksa")} required /></Field>
            <Field label="Diagnosis" req><Txta value={form.diagnosis || ""} onChange={s("diagnosis")} required /></Field>
            <Field label="Resep Obat" req><Txta value={form.resep_obat || ""} onChange={s("resep_obat")} required /></Field>
            <Field label="Catatan Dokter"><Txta value={form.catatan_dokter || ""} onChange={s("catatan_dokter")} /></Field>
            <hr className="divider" />
            <div className="acts">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── PASIEN SECTIONS ──────────────────────────────────────────────────────────
function PasienHome({ user, call, setSection }) {
  const [reservasis, setReservasis] = useState([]);
  useEffect(() => {
    call("/reservasis").then(r => setReservasis(r.data.slice(0, 4))).catch(() => { });
  }, []);
  const shortcuts = [
    { label: "Cari Dokter", icon: "👨‍⚕️", sec: "cari-dokter", sub: "Temukan spesialis" },
    { label: "Buat Reservasi", icon: "📅", sec: "reservasi", sub: "Buat janji temu" },
    { label: "Reservasi Saya", icon: "📋", sec: "my-reservasi", sub: "Riwayat janji" },
    { label: "Rekam Medis", icon: "🏥", sec: "rekam-medis-pasien", sub: "Hasil pemeriksaan" },
  ];
  return (
    <div className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Halo, {user.name} 👋</h2>
        <p style={{ color: "var(--text-3)", fontSize: 15 }}>Selamat datang di Portal Pasien Klinik Sehat</p>
      </div>
      <div className="shortcut-grid">
        {shortcuts.map(s => (
          <button key={s.label} className="shortcut-card" onClick={() => setSection(s.sec)}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5, color: "var(--text-1)" }}>{s.label}</div>
            <div style={{ fontSize: 13, color: "var(--text-3)" }}>{s.sub}</div>
          </button>
        ))}
      </div>
      {reservasis.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Reservasi Terbaru</h3>
          <div className="card">
            <Table
              cols={[
                { key: "nomor_antrian", label: "No. Antrian", render: v => <span className="mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{v}</span> },
                { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
                { key: "tanggal_reservasi", label: "Tanggal" },
                { key: "status", label: "Status", render: v => <Badge label={v} /> },
              ]}
              data={reservasis}
            />
          </div>
        </>
      )}
    </div>
  );
}

function DokterList({ call, onReservasi }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError(null);
    try { const r = await call("/dokters"); setData(r.data); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = data.filter(d =>
    d.nama.toLowerCase().includes(search.toLowerCase()) ||
    d.spesialisasi.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <><PH title="Cari Dokter" sub="Temukan dokter yang tepat" /><div className="card"><Loading /></div></>;
  if (error) return <><PH title="Cari Dokter" /><div className="card"><ErrorState message={error} onRetry={load} /></div></>;

  return (
    <div className="fade-up">
      <PH title="Cari Dokter" sub="Temukan dokter yang tepat untuk Anda" />
      <div className="search-wrap">
        <span className="search-ico">🔍</span>
        <Inp className="inp search-inp" style={{ paddingLeft: 44 }} placeholder="Cari nama atau spesialisasi..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="doc-grid">
        {filtered.map(d => (
          <div key={d.id} className="doc-card">
            <div className="doc-ava">👨‍⚕️</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 5 }}>{d.nama}</h3>
            <p style={{ fontSize: 14, color: "var(--primary)", fontWeight: 700, marginBottom: 8 }}>{d.spesialisasi}</p>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 6 }}>STR: {d.no_str}</p>
            <p style={{ fontSize: 16, fontWeight: 800, marginBottom: d.bio ? 16 : 22 }}>Rp {Number(d.biaya_konsultasi).toLocaleString("id-ID")}</p>
            {d.bio && <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6, flexGrow: 1, marginBottom: 20 }}>{d.bio}</p>}
            <button className="btn btn-primary btn-full" onClick={() => onReservasi(d)}>Buat Reservasi</button>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1" }}><Empty icon="🔍" title="Dokter tidak ditemukan" sub="Coba kata kunci lain" /></div>}
      </div>
    </div>
  );
}

function ReservasiForm({ call, showToast, initialDokter, onDone }) {
  const [dokters, setDokters] = useState([]);
  const [jadwals, setJadwals] = useState([]);
  const [form, setForm] = useState({ dokter_id: initialDokter?.id || "", jadwal_id: "", tanggal_reservasi: "", keluhan: "" });
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => { call("/dokters").then(r => setDokters(r.data)).catch(() => { }); }, []);
  useEffect(() => {
    if (!form.dokter_id) { setJadwals([]); return; }
    call("/jadwals").then(r => {
      setJadwals(r.data.filter(j => String(j.dokter_id) === String(form.dokter_id) && j.is_aktif));
      setForm(p => ({ ...p, jadwal_id: "" }));
    }).catch(() => { });
  }, [form.dokter_id]);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await call("/reservasis", { method: "POST", body: JSON.stringify(form) });
      showToast("Reservasi berhasil dibuat! 🎉");
      onDone();
    } catch (err) {
      showToast(err.message || "Gagal membuat reservasi", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-up">
      <PH title="Buat Reservasi" sub="Isi formulir untuk membuat janji temu" />
      <div className="card" style={{ maxWidth: 580 }}>
        <div className="card-p">
          <form onSubmit={submit}>
            <Field label="Pilih Dokter" req>
              <Sel value={form.dokter_id} onChange={s("dokter_id")} required>
                <option value="">Pilih dokter...</option>
                {dokters.map(d => <option key={d.id} value={d.id}>{d.nama} — {d.spesialisasi} (Rp {Number(d.biaya_konsultasi).toLocaleString("id-ID")})</option>)}
              </Sel>
            </Field>
            <Field label="Pilih Jadwal" req>
              <Sel value={form.jadwal_id} onChange={s("jadwal_id")} required disabled={!form.dokter_id}>
                <option value="">{form.dokter_id ? "Pilih jadwal..." : "Pilih dokter terlebih dahulu"}</option>
                {jadwals.map(j => <option key={j.id} value={j.id}>{j.hari} · {j.jam_mulai}–{j.jam_selesai} (Kuota: {j.kuota})</option>)}
              </Sel>
            </Field>
            <Field label="Tanggal Reservasi" req><Inp type="date" value={form.tanggal_reservasi} onChange={s("tanggal_reservasi")} required min={today} /></Field>
            <Field label="Keluhan" req><Txta value={form.keluhan} onChange={s("keluhan")} placeholder="Ceritakan keluhan Anda secara detail..." required style={{ minHeight: 120 }} /></Field>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>{loading ? "Memproses..." : "Buat Reservasi →"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MyReservasi({ call, showToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { const r = await call("/reservasis"); setData(r.data); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const batalkan = async id => {
    if (!confirm("Batalkan reservasi ini?")) return;
    try {
      await call(`/reservasis/${id}`, { method: "PUT", body: JSON.stringify({ status: "dibatalkan" }) });
      showToast("Reservasi dibatalkan.");
      await load();
    } catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div className="fade-up">
      <PH title="Reservasi Saya" sub="Daftar janji temu yang telah dibuat" />
      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : <Table
          cols={[
            { key: "nomor_antrian", label: "No. Antrian", render: v => <span className="mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{v}</span> },
            { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
            { key: "jadwal", label: "Jadwal", render: v => v ? `${v.hari} ${v.jam_mulai}–${v.jam_selesai}` : "—" },
            { key: "tanggal_reservasi", label: "Tanggal" },
            { key: "status", label: "Status", render: v => <Badge label={v} /> },
          ]}
          data={data}
          actions={row => <>
            <button className="btn btn-outline btn-sm" onClick={async () => {
              try { const r = await call(`/reservasis/${row.id}`); setDetail(r.data); }
              catch { setDetail(row); }
            }}>Detail</button>
            {row.status === "pending" && <button className="btn btn-danger btn-sm" onClick={() => batalkan(row.id)}>Batalkan</button>}
          </>}
        />}
      </div>
      {detail && (
        <Modal title="Detail Reservasi" onClose={() => setDetail(null)}>
          {[
            ["No. Antrian", <span className="mono" style={{ color: "var(--primary)", fontWeight: 700, fontSize: 15 }}>{detail.nomor_antrian}</span>],
            ["Dokter", detail.dokter?.nama || "—"],
            ["Jadwal", detail.jadwal ? `${detail.jadwal.hari}, ${detail.jadwal.jam_mulai}–${detail.jadwal.jam_selesai}` : "—"],
            ["Tanggal", detail.tanggal_reservasi],
            ["Status", <Badge label={detail.status} />],
            ["Keluhan", detail.keluhan],
          ].map(([k, v]) => <div className="detail-row" key={k}><span className="detail-k">{k}</span><span className="detail-v">{v}</span></div>)}
          {detail.rekam_medis && (
            <div className="rekam-ok">
              <p style={{ fontWeight: 700, color: "#065f46", marginBottom: 10, fontSize: 14 }}>✅ Rekam Medis Tersedia</p>
              <p style={{ fontSize: 14, color: "#065f46", marginBottom: 5 }}><strong>Diagnosis:</strong> {detail.rekam_medis.diagnosis}</p>
              <p style={{ fontSize: 14, color: "#065f46" }}><strong>Resep:</strong> {detail.rekam_medis.resep_obat}</p>
            </div>
          )}
          <div className="acts" style={{ marginTop: 18 }}><button className="btn btn-ghost" onClick={() => setDetail(null)}>Tutup</button></div>
        </Modal>
      )}
    </div>
  );
}

function MyRekamMedis({ call }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    call("/reservasis")
      .then(async r => {
        const selesai = r.data.filter(rv => rv.status === "selesai");
        const details = await Promise.allSettled(selesai.map(rv => call(`/reservasis/${rv.id}`)));
        setData(details
          .filter(d => d.status === "fulfilled" && d.value?.data?.rekam_medis)
          .map(d => ({ ...d.value.data.rekam_medis, dokter: d.value.data.dokter }))
        );
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-up">
      <PH title="Rekam Medis Saya" sub="Riwayat pemeriksaan medis Anda" />
      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} /> : data.length === 0
          ? <Empty icon="🏥" title="Belum ada rekam medis" sub="Muncul setelah konsultasi selesai" />
          : <Table
            cols={[
              { key: "tanggal_periksa", label: "Tanggal Periksa" },
              { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
              { key: "diagnosis", label: "Diagnosis", render: v => <span className="truncate" title={v}>{v?.length > 55 ? v.slice(0, 55) + "…" : v}</span> },
            ]}
            data={data}
            actions={row => <button className="btn btn-outline btn-sm" onClick={() => setDetail(row)}>Lihat Detail</button>}
          />
        }
      </div>
      {detail && (
        <Modal title="Detail Rekam Medis" onClose={() => setDetail(null)}>
          {[["Tanggal", detail.tanggal_periksa], ["Dokter", detail.dokter?.nama || "—"], ["Diagnosis", detail.diagnosis], ["Resep Obat", detail.resep_obat], ["Catatan", detail.catatan_dokter || "—"]].map(([k, v]) => (
            <div className="detail-row" key={k}><span className="detail-k">{k}</span><span className="detail-v">{v}</span></div>
          ))}
          <div className="acts" style={{ marginTop: 18 }}><button className="btn btn-ghost" onClick={() => setDetail(null)}>Tutup</button></div>
        </Modal>
      )}
    </div>
  );
}

// ─── DASHBOARD SHELL ──────────────────────────────────────────────────────────
const ADMIN_NAV = [
  ["home", "🏠", "Beranda"],
  ["dokters", "👨‍⚕️", "Dokter"],
  ["jadwals", "📅", "Jadwal"],
  ["reservasis", "📋", "Reservasi"],
  ["rekam-medis", "🏥", "Rekam Medis"],
];
const PASIEN_NAV = [
  ["home", "🏠", "Beranda"],
  ["cari-dokter", "👨‍⚕️", "Cari Dokter"],
  ["reservasi", "📅", "Buat Reservasi"],
  ["my-reservasi", "📋", "Reservasi Saya"],
  ["rekam-medis-pasien", "🏥", "Rekam Medis Saya"],
];
const PAGE_TITLES = {
  home: "Beranda", dokters: "Manajemen Dokter", jadwals: "Manajemen Jadwal",
  reservasis: "Manajemen Reservasi", "rekam-medis": "Rekam Medis",
  "cari-dokter": "Cari Dokter", reservasi: "Buat Reservasi",
  "my-reservasi": "Reservasi Saya", "rekam-medis-pasien": "Rekam Medis Saya",
};

function Dashboard({ user, onLogout, callApi, active, setActive, showToast }) {
  const [open, setOpen] = useState(false);
  const [dokterForReservasi, setDokterForReservasi] = useState(null);
  const isAdmin = user.role === "admin";
  const nav = isAdmin ? ADMIN_NAV : PASIEN_NAV;
  const call = (path, opts = {}, needKey = false) => callApi(path, opts, needKey);
  const goto = sec => { setActive(sec); setOpen(false); };
  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const content = () => {
    if (isAdmin) switch (active) {
      case "dokters": return <DokterMgmt call={call} />;
      case "jadwals": return <JadwalMgmt call={call} />;
      case "reservasis": return <AdminReservasi call={call} showToast={showToast} />;
      case "rekam-medis": return <RekamMedisMgmt call={call} />;
      default: return <AdminHome call={call} user={user} />;
    }
    switch (active) {
      case "cari-dokter": return <DokterList call={call} onReservasi={d => { setDokterForReservasi(d); goto("reservasi"); }} />;
      case "reservasi": return <ReservasiForm call={call} showToast={showToast} initialDokter={dokterForReservasi} onDone={() => goto("my-reservasi")} />;
      case "my-reservasi": return <MyReservasi call={call} showToast={showToast} />;
      case "rekam-medis-pasien": return <MyRekamMedis call={call} />;
      default: return <PasienHome user={user} call={call} setSection={goto} />;
    }
  };

  return (
    <div className="app-shell">
      <div className={`sb-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sb-logo">
          <div className="sb-logo-icon">🏥</div>
          <div>
            <div className="sb-logo-name">Klinik Sehat</div>
            <div className="sb-logo-role">{isAdmin ? "Administrator" : "Portal Pasien"}</div>
          </div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Menu Utama</div>
          {nav.map(([id, icon, label]) => (
            <button key={id} className={`nav-btn ${active === id ? "active" : ""}`} onClick={() => goto(id)}>
              <span className="nav-icon">{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-user">
            <div className="avatar av-lg">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-name">{user.name}</div>
              <div className="sb-email">{user.email}</div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}><Badge label={user.role} /></div>
          <button className="btn-logout" onClick={onLogout}>Keluar</button>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-l">
            <button className="hamburger" onClick={() => setOpen(o => !o)}>☰</button>
            <div>
              <div className="topbar-title">{PAGE_TITLES[active] || "Dashboard"}</div>
              <div className="topbar-sub">Klinik Sehat · {isAdmin ? "Admin" : "Pasien"}</div>
            </div>
          </div>
          <div className="avatar av-sm">{initials}</div>
        </header>
        <div className="page-body">{content()}</div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("klinik_token") || "");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("klinik_api_key") || "");
  const [active, setActive] = useState("home");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [authErr, setAuthErr] = useState("");

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const storeKey = k => { if (k) { setApiKey(k); localStorage.setItem("klinik_api_key", k); } };

  useEffect(() => {
    if (!token) return;
    api("/auth/me", {}, token)
      .then(r => { setUser(r.data); storeKey(r.data.api_key); setPage("dashboard"); })
      .catch(() => { localStorage.removeItem("klinik_token"); setToken(""); });
  }, []);

  const login = async (email, password) => {
    setLoading(true); setAuthErr("");
    try {
      const r = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("klinik_token", r.token); setToken(r.token);
      const me = await api("/auth/me", {}, r.token);
      setUser(me.data); storeKey(me.data.api_key || r.api_key);
      setPage("dashboard"); setActive("home"); showToast(`Selamat datang, ${me.data.name}! 👋`);
    } catch (e) { setAuthErr(e.message); }
    finally { setLoading(false); }
  };

  const register = async data => {
    setLoading(true); setAuthErr("");
    try {
      const r = await api("/auth/register", { method: "POST", body: JSON.stringify(data) });
      localStorage.setItem("klinik_token", r.token); setToken(r.token);
      storeKey(r.api_key); setUser(r.data || r.user);
      setPage("dashboard"); setActive("home"); showToast("Registrasi berhasil! Selamat datang 🎉");
    } catch (e) { setAuthErr(e.message); }
    finally { setLoading(false); }
  };

  const logout = async () => {
    try { if (token) await api("/auth/logout", { method: "POST" }, token); } catch { }
    ["klinik_token", "klinik_api_key"].forEach(k => localStorage.removeItem(k));
    setToken(""); setApiKey(""); setUser(null); setPage("login"); setActive("home");
  };

  const callApi = useCallback(
    (path, opts = {}, needKey = false) => api(path, opts, token || null, needKey ? (apiKey || null) : null),
    [token, apiKey]
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      {toast && <div className={`toast t-${toast.type}`} onClick={() => setToast(null)}>{toast.msg}</div>}
      {page === "login" && <LoginPage onLogin={login} onGoto={setPage} loading={loading} error={authErr} />}
      {page === "register" && <RegisterPage onRegister={register} onGoto={setPage} loading={loading} error={authErr} />}
      {page === "dashboard" && user && <Dashboard user={user} onLogout={logout} callApi={callApi} active={active} setActive={setActive} showToast={showToast} />}
    </>
  );
}