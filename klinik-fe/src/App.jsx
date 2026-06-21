import { useState, useEffect, useCallback } from "react";
import { getCache, setCache, invalidate, INVALIDATE_MAP } from "./apiCache.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const BASE = "https://project-api-kelompok-08-production.up.railway.app/api";

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

  .sb-footer { padding:10px 12px 14px; border-top:1px solid rgba(255,255,255,.07); flex-shrink:0; position:relative; }
  .sb-user-btn {
    display:flex; align-items:center; gap:12px; width:100%;
    padding:10px 12px; border-radius:var(--r-sm); border:none;
    background:transparent; cursor:pointer; text-align:left;
    transition:background var(--tr); font-family:var(--font);
  }
  .sb-user-btn:hover { background:rgba(255,255,255,.06); }
  .sb-user { display:flex; align-items:center; gap:12px; }
  .avatar { border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; flex-shrink:0; }
  .av-lg { width:40px; height:40px; font-size:14px; }
  .av-sm { width:34px; height:34px; font-size:13px; }
  .sb-name  { font-size:14px; font-weight:600; color:#fff; line-height:1.3; }
  .sb-email { font-size:12px; color:rgba(255,255,255,.32); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
  .btn-logout { width:100%; padding:10px; background:rgba(239,68,68,.1); color:#fca5a5; border:1px solid rgba(239,68,68,.2); border-radius:var(--r-sm); cursor:pointer; font-size:13px; font-weight:600; transition:all var(--tr); font-family:var(--font); }
  .btn-logout:hover { background:rgba(239,68,68,.2); }

  /* ── USER DROPDOWN ── */
  .user-dropdown {
    position:absolute; bottom:calc(100% + 6px); left:12px; right:12px;
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--r-md); box-shadow:var(--sh-lg);
    overflow:hidden; animation:fadeUp .18s ease;
    z-index:300;
  }
  .ud-head { padding:14px 16px; border-bottom:1px solid var(--border); background:var(--surface-2); }
  .ud-name  { font-size:14px; font-weight:700; color:var(--ink); }
  .ud-email { font-size:12px; color:var(--text-3); margin-top:2px; }
  .ud-item {
    display:flex; align-items:center; gap:10px;
    width:100%; padding:11px 16px; border:none; background:transparent;
    cursor:pointer; font-family:var(--font); font-size:13px; font-weight:500;
    color:var(--text-2); text-align:left; transition:background var(--tr);
  }
  .ud-item:hover { background:var(--surface-2); color:var(--primary); }
  .ud-item.danger { color:var(--danger); }
  .ud-item.danger:hover { background:#fef2f2; }
  .ud-divider { border:none; border-top:1px solid var(--border); margin:4px 0; }

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
  .b-menunggu     { background:#fef3c7; color:#92400e; }
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

  /* ── MODAL (detail - centered, wider) ── */
  .modal-bg { position:fixed; inset:0; background:rgba(13,31,28,0.65); z-index:1000; display:flex; align-items:flex-start; justify-content:center; padding:7vh 24px 24px; animation:fadeIn .2s ease; backdrop-filter:blur(6px); overflow-y:auto; }
  .modal-box { background:var(--surface); border-radius:var(--r-xl); width:100%; max-width:560px; max-height:88vh; display:flex; flex-direction:column; box-shadow:var(--sh-lg); animation:scaleIn .22s ease; }
  .modal-head { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid var(--border); flex-shrink:0; }
  .modal-title { font-size:17px; font-weight:700; color:var(--text-1); }
  .modal-x { width:32px; height:32px; border:none; background:var(--surface-2); border-radius:50%; cursor:pointer; font-size:18px; color:var(--text-3); display:flex; align-items:center; justify-content:center; transition:all var(--tr); }
  .modal-x:hover { background:var(--border); color:var(--text-1); }
  .modal-body { padding:24px; overflow-y:auto; flex:1; }

  /* ── SLIDE PANEL (form admin - dari kanan) ── */
  @keyframes slideIn  { from { transform:translateX(100%); } to { transform:translateX(0); } }

  .slide-bg   { position:fixed; inset:0; background:rgba(13,31,28,0.55); z-index:1000; animation:fadeIn .2s ease; backdrop-filter:blur(4px); }
  .slide-panel {
    position:fixed; top:0; right:0; bottom:0; z-index:1001;
    width:100%; max-width:520px; height:100vh;
    background:var(--surface);
    display:flex; flex-direction:column; overflow:hidden;
    box-shadow:-8px 0 40px rgba(0,0,0,.2);
    animation:slideIn .3s cubic-bezier(.22,1,.36,1);
  }
  .slide-head {
    display:flex; align-items:center; justify-content:space-between;
    padding:22px 28px; border-bottom:1px solid var(--border);
    flex-shrink:0; background:var(--surface);
  }
  .slide-title-wrap .slide-title { font-size:18px; font-weight:800; color:var(--text-1); margin-bottom:2px; }
  .slide-title-wrap .slide-sub   { font-size:13px; color:var(--text-3); }
  .slide-x { width:36px; height:36px; border:1.5px solid var(--border); background:var(--surface-2); border-radius:var(--r-sm); cursor:pointer; font-size:20px; color:var(--text-3); display:flex; align-items:center; justify-content:center; transition:all var(--tr); font-family:var(--font); }
  .slide-x:hover { background:var(--border); color:var(--text-1); }
  .slide-body { padding:28px; overflow-y:auto; flex:1; min-height:0; }
  .slide-footer { padding:18px 28px; border-top:1px solid var(--border); background:var(--surface-2); display:flex; gap:12px; justify-content:flex-end; flex-shrink:0; }

  @media(max-width:640px) {
    .slide-panel { max-width:100%; }
    .modal-box   { max-width:100%; }
  }

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

  /* ── PATIENT WEBSITE LAYOUT ── */
  .pw-shell { min-height:100vh; background:#f7f9f8; display:flex; flex-direction:column; }

  .pw-topbar {
    background:#fff; border-bottom:1px solid #e5ede9; position:sticky; top:0; z-index:200;
    box-shadow:0 2px 12px rgba(0,0,0,.06);
  }
  .pw-topbar-inner {
    max-width:1200px; margin:0 auto; padding:0 32px;
    display:flex; align-items:center; gap:0; height:70px;
  }
  .pw-logo { display:flex; align-items:center; gap:12px; text-decoration:none; flex-shrink:0; margin-right:40px; }
  .pw-logo-ic { width:44px; height:44px; background:linear-gradient(135deg,var(--primary),var(--primary-mid)); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
  .pw-logo-name { font-size:18px; font-weight:800; color:var(--ink); line-height:1.2; }
  .pw-logo-sub  { font-size:11px; color:var(--text-3); font-weight:500; }

  .pw-nav { display:flex; align-items:center; gap:2px; flex:1; }
  .pw-nav-btn {
    padding:8px 16px; border:none; background:transparent; cursor:pointer;
    font-family:var(--font); font-size:14px; font-weight:600; color:var(--text-2);
    border-radius:var(--r-sm); transition:all .15s; white-space:nowrap;
    position:relative;
  }
  .pw-nav-btn:hover  { color:var(--primary); background:var(--primary-light); }
  .pw-nav-btn.active { color:var(--primary); background:var(--primary-light); }
  .pw-nav-btn.active::after { content:''; position:absolute; bottom:-1px; left:16px; right:16px; height:2px; background:var(--primary); border-radius:2px; }

  .pw-user { margin-left:auto; display:flex; align-items:center; gap:10px; flex-shrink:0; }
  .pw-user-name { font-size:13px; font-weight:600; color:var(--ink); }
  .pw-user-role { font-size:11px; color:var(--text-3); }
  .pw-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--primary),var(--primary-mid)); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff; cursor:pointer; flex-shrink:0; position:relative; }
  .pw-dropdown {
    position:absolute; top:calc(100% + 8px); right:0; width:220px;
    background:#fff; border:1px solid var(--border); border-radius:var(--r-md);
    box-shadow:var(--sh-lg); overflow:hidden; animation:fadeUp .18s ease; z-index:300;
  }
  .pw-dropdown-head { padding:14px 16px; border-bottom:1px solid var(--border); background:var(--surface-2); }
  .pw-dropdown-item {
    display:flex; align-items:center; gap:10px; width:100%; padding:11px 16px;
    border:none; background:transparent; cursor:pointer; font-family:var(--font);
    font-size:13px; font-weight:500; color:var(--text-2); text-align:left; transition:background .15s;
  }
  .pw-dropdown-item:hover { background:var(--surface-2); color:var(--primary); }
  .pw-dropdown-item.danger { color:var(--danger); }
  .pw-dropdown-item.danger:hover { background:#fef2f2; }

  .pw-hamburger { display:none; width:38px; height:38px; border:1.5px solid var(--border); background:var(--surface-2); border-radius:var(--r-sm); cursor:pointer; font-size:18px; align-items:center; justify-content:center; margin-right:12px; }

  .pw-mobile-menu {
    background:#fff; border-top:1px solid var(--border); padding:12px 16px;
    display:none; flex-direction:column; gap:4px;
  }
  .pw-mobile-menu.open { display:flex; }
  .pw-mobile-item { padding:10px 14px; border:none; background:transparent; cursor:pointer; font-family:var(--font); font-size:14px; font-weight:600; color:var(--text-2); text-align:left; border-radius:var(--r-sm); transition:all .15s; }
  .pw-mobile-item:hover,.pw-mobile-item.active { color:var(--primary); background:var(--primary-light); }

  /* ── BOTTOM NAVIGATION (MOBILE) ── */
  .pw-bottom-nav {
    display: none; position: fixed; bottom: 0; left: 0; right: 0;
    background: #fff; border-top: 1px solid var(--border); box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    z-index: 900; padding-bottom: env(safe-area-inset-bottom);
  }
  .pw-bottom-nav-inner {
    display: flex; justify-content: space-around; padding: 8px 4px;
  }
  .pw-bottom-nav-item {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px; border: none; background: transparent; cursor: pointer;
    font-family: var(--font); color: var(--text-3); flex: 1; min-width: 0;
  }
  .pw-bottom-nav-ic { font-size: 20px; transition: transform var(--tr); }
  .pw-bottom-nav-lbl { font-size: 10px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .pw-bottom-nav-item:hover .pw-bottom-nav-ic { transform: translateY(-2px); color: var(--primary); }
  .pw-bottom-nav-item.active { color: var(--primary); }
  .pw-bottom-nav-item.active .pw-bottom-nav-ic { color: var(--primary); }

  .pw-body { flex:1; max-width:1200px; margin:0 auto; width:100%; padding:36px 32px; }

  .pw-footer {
    background:var(--sidebar-bg); color:rgba(255,255,255,.5); padding:28px 32px;
    text-align:center; font-size:13px; margin-top:auto;
  }
  .pw-footer strong { color:rgba(255,255,255,.8); }

  @media(max-width:900px) {
    .pw-nav { display:none; }
    .pw-hamburger { display:flex; flex-shrink: 0; }
    .pw-topbar-inner { padding:0 24px; }
    .pw-body { padding:20px 24px; }
    .pw-user-info, .user-profile > div:first-child { display:none !important; }
  }

  @media(max-width:900px) and (display-mode: standalone) {
    .pw-hamburger { display:none !important; }
    .pw-mobile-menu { display:none !important; }
    .pw-bottom-nav { display: block; }
    .pw-body { padding:20px 24px 80px; }
    .pw-footer { padding-bottom: 80px; }
  }

  /* ── PAGE WRAPPERS (patient website) ── */
  .pw-page       { max-width:780px; margin:0 auto; }
  .pw-page-wide  { max-width:1000px; margin:0 auto; }
  .pw-page-full  { width:100%; }

  .home-hero {
    background:linear-gradient(135deg,var(--primary) 0%,var(--primary-mid) 100%);
    border-radius:var(--r-xl); padding:32px 36px; margin-bottom:28px;
    position:relative; overflow:hidden; color:#fff;
  }
  .hero-btns { display:flex; gap:12px; flex-wrap:wrap; }

  .pw-page-hero {
    background:linear-gradient(135deg,var(--primary) 0%,var(--primary-mid) 100%);
    border-radius:var(--r-xl); padding:28px 36px; margin-bottom:28px;
    display:flex; align-items:center; gap:16px; color:#fff;
  }
  .pw-page-hero-ic  { font-size:40px; flex-shrink:0; }
  .pw-page-hero h2  { font-size:22px; font-weight:800; margin-bottom:4px; }
  .pw-page-hero p   { font-size:14px; opacity:.8; }

  .pw-section-title {
    font-size:20px; font-weight:800; color:var(--text-1);
    margin-bottom:6px;
  }
  .pw-section-sub {
    font-size:14px; color:var(--text-3); margin-bottom:24px;
  }

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
    .home-hero  { padding: 24px 20px; border-radius: var(--r-lg); }
    .hero-btns  { flex-direction: row; }
    .hero-btns button { flex: 1; min-width: 130px; justify-content: center; padding-left: 12px; padding-right: 12px; }
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
  const m = {
    menunggu: "b-menunggu", pending: "b-menunggu",
    dikonfirmasi: "b-dikonfirmasi",
    selesai: "b-selesai", dibatalkan: "b-dibatalkan",
    admin: "b-admin", pasien: "b-pasien",
    aktif: "b-aktif", nonaktif: "b-nonaktif",
  };
  const display = { pending: "Menunggu", menunggu: "Menunggu", dikonfirmasi: "Dikonfirmasi", selesai: "Selesai", dibatalkan: "Dibatalkan", aktif: "Aktif", nonaktif: "Nonaktif", admin: "Admin", pasien: "Pasien" }[String(label)] || label;
  return <span className={`badge ${m[String(label)] || "b-nonaktif"}`}>{display}</span>;
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

// SlidePanel — muncul dari kanan, untuk form admin (tambah/edit)
function SlidePanel({ title, sub, onClose, children, footer }) {
  return (
    <>
      <div className="slide-bg" onClick={onClose} />
      <div className="slide-panel">
        <div className="slide-head">
          <div className="slide-title-wrap">
            <div className="slide-title">{title}</div>
            {sub && <div className="slide-sub">{sub}</div>}
          </div>
          <button className="slide-x" onClick={onClose}>×</button>
        </div>
        <div className="slide-body">{children}</div>
        {footer && <div className="slide-footer">{footer}</div>}
      </div>
    </>
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

function CustomSelect({ value, onChange, options, placeholder, disabled, icon, renderOption }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => String(o.value) === String(value));

  return (
    <>
      <div 
        onClick={() => !disabled && setOpen(true)}
        style={{
          padding: "11px 15px", border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)",
          background: disabled ? "var(--surface-2)" : "var(--surface)", cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          opacity: disabled ? 0.7 : 1, transition: "all var(--tr)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
          <span style={{ color: selected ? "var(--text-1)" : "var(--text-3)", fontSize: 14, fontWeight: selected ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <span style={{ color: "var(--text-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: 12 }}>▼</span>
      </div>

      {open && (
        <Modal title={placeholder} onClose={() => setOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange({ target: { value: opt.value } }); setOpen(false); }}
                style={{
                  padding: "14px 16px", border: `1.5px solid ${String(value) === String(opt.value) ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--r-md)", background: String(value) === String(opt.value) ? "var(--primary-light)" : "var(--surface)",
                  cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {renderOption ? renderOption(opt, String(value) === String(opt.value)) : (
                  <div style={{ fontWeight: String(value) === String(opt.value) ? 700 : 500, color: String(value) === String(opt.value) ? "var(--primary-dark)" : "var(--text-1)" }}>
                    {opt.label}
                  </div>
                )}
              </div>
            ))}
            {options.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "var(--text-3)" }}>Tidak ada pilihan tersedia</div>}
          </div>
        </Modal>
      )}
    </>
  );
}

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
  const [stats, setStats] = useState({ d: null, j: null, r: null, rv: null });
  const [reservasis, setReservasis] = useState([]);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    call("/dokters").then(d => setStats(p => ({ ...p, d: d.data.length }))).catch(() => setStats(p => ({ ...p, d: "—" })));
    call("/jadwals").then(j => setStats(p => ({ ...p, j: j.data.length }))).catch(() => setStats(p => ({ ...p, j: "—" })));
    call("/rekam-medis", {}, true).then(r => setStats(p => ({ ...p, r: r.data.length }))).catch(() => setStats(p => ({ ...p, r: "—" })));
    call("/admin/reservasis", {}, true).then(rv => {
      setStats(p => ({ ...p, rv: rv.data.length }));
      setReservasis(rv.data || []);
      setChartReady(true);
    }).catch(() => setStats(p => ({ ...p, rv: "—" })));
  }, []);

  // ── Data untuk Pie Chart status reservasi ──────────────────────────
  const statusCount = ["pending", "dikonfirmasi", "selesai", "dibatalkan"].map(st => ({
    name: st.charAt(0).toUpperCase() + st.slice(1),
    value: reservasis.filter(r => r.status === st).length,
  })).filter(d => d.value > 0);

  const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"];

  // ── Data untuk Bar Chart reservasi 7 hari terakhir ─────────────────
  const barData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const lbl = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      days.push({
        name: lbl,
        total: reservasis.filter(r => r.tanggal_reservasi === key).length,
      });
    }
    return days;
  })();

  // ── Reservasi pending terbaru (max 5) ──────────────────────────────
  const pending = reservasis.filter(r => r.status === "pending").slice(0, 5);

  const statCards = [
    { ic: "👨‍⚕️", lb: "Total Dokter", val: stats.d, color: "#0a7c6e" },
    { ic: "📅", lb: "Total Jadwal", val: stats.j, color: "#3b82f6" },
    { ic: "📋", lb: "Total Reservasi", val: stats.rv, color: "#f59e0b" },
    { ic: "🏥", lb: "Rekam Medis", val: stats.r, color: "#10b981" },
  ];


  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Selamat datang, {user.name} 👋</h2>
        <p style={{ color: "var(--text-3)", fontSize: 14 }}>
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          {" · "}Panel Administrasi Klinik Sehat
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {statCards.map(({ ic, lb, val, color }) => (
          <div className="stat-card" key={lb} style={{ "--accent": color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-lbl">{lb}</div>
                <div className="stat-val" style={{ color }}>
                  {val === null ? <span className="spinner" style={{ width: 28, height: 28 }} /> : val}
                </div>
              </div>
              <div style={{ fontSize: 36, opacity: .8 }}>{ic}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ gap: 20, marginBottom: 28 }}>

        {/* Bar Chart — Reservasi 7 Hari */}
        <div className="card card-p">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: "var(--text-1)" }}>
            📊 Reservasi 7 Hari Terakhir
          </div>
          {chartReady ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                  formatter={v => [v, "Reservasi"]}
                />
                <Bar dataKey="total" fill="#0a7c6e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="spinner" />
            </div>
          )}
        </div>

        {/* Pie Chart — Status Reservasi */}
        <div className="card card-p">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: "var(--text-1)" }}>
            🥧 Status Reservasi
          </div>
          {chartReady ? (
            statusCount.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusCount} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusCount.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                    formatter={v => [v + " reservasi"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 14 }}>
                Belum ada data reservasi
              </div>
            )
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="spinner" />
            </div>
          )}
        </div>
      </div>

      {/* Pending Reservasi */}
      {pending.length > 0 && (
        <div className="card">
          <div style={{ padding: "18px 24px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              🔔 Menunggu Konfirmasi
              <span style={{ marginLeft: 8, background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{pending.length}</span>
            </div>
          </div>
          <Table
            cols={[
              { key: "nomor_antrian", label: "No. Antrian", render: v => <span className="mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{v}</span> },
              { key: "user", label: "Pasien", render: v => v?.name || "—" },
              { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
              { key: "tanggal_reservasi", label: "Tanggal" },
            ]}
            data={pending}
          />
        </div>
      )}
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
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>Manajemen Dokter</h2>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Total {data.length} dokter terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ nama: "", spesialisasi: "", no_str: "", biaya_konsultasi: "", bio: "" }); setModal("add"); }}>
          ➕ Tambah Dokter
        </button>
      </div>
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
        <SlidePanel
          title={modal === "add" ? "Tambah Dokter" : "Edit Dokter"}
          sub={modal === "add" ? "Isi data dokter baru" : `Edit data ${form.nama || ""}`}
          onClose={() => setModal(null)}
          footer={<>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button form="form-dokter" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan..." : modal === "add" ? "➕ Tambah Dokter" : "💾 Simpan Perubahan"}
            </button>
          </>}
        >
          <form id="form-dokter" onSubmit={save}>
            <div className="grid-2">
              <Field label="Nama Lengkap Dokter" req>
                <Inp value={form.nama || ""} onChange={s("nama")} placeholder="dr. Nama, Sp.XX" required />
              </Field>
              <Field label="Spesialisasi" req>
                <Inp value={form.spesialisasi || ""} onChange={s("spesialisasi")} placeholder="Penyakit Dalam" required />
              </Field>
            </div>
            <div className="grid-2">
              <Field label="No. STR" req>
                <Inp value={form.no_str || ""} onChange={s("no_str")} placeholder="STR-2024-XXX" required />
              </Field>
              <Field label="Biaya Konsultasi (Rp)" req>
                <Inp type="number" value={form.biaya_konsultasi || ""} onChange={s("biaya_konsultasi")} placeholder="150000" required min={0} />
              </Field>
            </div>
            <Field label="Bio / Deskripsi">
              <Txta value={form.bio || ""} onChange={s("bio")}
                placeholder="Pengalaman, keahlian, dan informasi singkat tentang dokter..."
                style={{ minHeight: 100 }} />
            </Field>
          </form>
        </SlidePanel>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>Manajemen Jadwal</h2>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Total {data.length} jadwal praktik aktif dan nonaktif</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ dokter_id: "", hari: "Senin", jam_mulai: "08:00", jam_selesai: "12:00", kuota: 10, is_aktif: 1 }); setModal("add"); }}>
          ➕ Tambah Jadwal
        </button>
      </div>
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
        <SlidePanel
          title={modal === "add" ? "Tambah Jadwal" : "Edit Jadwal"}
          sub={modal === "add" ? "Atur jadwal praktik dokter" : "Ubah jadwal praktik"}
          onClose={() => setModal(null)}
          footer={<>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button form="form-jadwal" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan..." : modal === "add" ? "➕ Tambah Jadwal" : "💾 Simpan Perubahan"}
            </button>
          </>}
        >
          <form id="form-jadwal" onSubmit={save}>
            <Field label="Dokter" req>
              <Sel value={form.dokter_id || ""} onChange={s("dokter_id")} required>
                <option value="">Pilih dokter...</option>
                {dokters.map(d => <option key={d.id} value={d.id}>{d.nama} — {d.spesialisasi}</option>)}
              </Sel>
            </Field>
            <div className="grid-2">
              <Field label="Hari" req>
                <Sel value={form.hari || "Senin"} onChange={s("hari")}>
                  {HARI.map(h => <option key={h}>{h}</option>)}
                </Sel>
              </Field>
              <Field label="Status">
                <Sel value={form.is_aktif} onChange={e => setForm(p => ({ ...p, is_aktif: Number(e.target.value) }))}>
                  <option value={1}>Aktif</option><option value={0}>Nonaktif</option>
                </Sel>
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Jam Mulai" req><Inp type="time" value={form.jam_mulai || ""} onChange={s("jam_mulai")} required /></Field>
              <Field label="Jam Selesai" req><Inp type="time" value={form.jam_selesai || ""} onChange={s("jam_selesai")} required /></Field>
            </div>
            <Field label="Kuota Pasien / Hari" req>
              <Inp type="number" value={form.kuota || ""} onChange={s("kuota")} required min={1} placeholder="10" />
            </Field>
          </form>
        </SlidePanel>
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

  const STATUS_LIST = [
    { v: "menunggu", l: "Menunggu" },
    { v: "selesai", l: "Selesai" },
    { v: "dibatalkan", l: "Dibatalkan" },
  ];

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>Manajemen Reservasi</h2>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Kelola dan pantau semua janji temu pasien</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["menunggu", "selesai", "dibatalkan"].map(st => {
            const n = data.filter(r => r.status === st).length;
            return n > 0 ? <span key={st} className={`badge b-${st}`} style={{ padding: "6px 14px", fontSize: 13 }}>{st.charAt(0).toUpperCase() + st.slice(1)}: {n}</span> : null;
          })}
        </div>
      </div>
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
              value={["menunggu", "selesai", "dibatalkan"].includes(row.status) ? row.status : "menunggu"}
              onChange={e => updateStatus(row.id, e.target.value)}
              disabled={updating === row.id}
              style={{ padding: "6px 10px", fontSize: 13, width: "auto", minWidth: 140 }}
            >
              {STATUS_LIST.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </Sel>
          </>}
        />}
      </div>
      {detail && (
        <Modal title="Detail Reservasi" onClose={() => setDetail(null)}>
          {/* Antrian hero */}
          <div style={{ background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-lg)", padding: "20px 24px", marginBottom: 24, color: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 12, opacity: .75, marginBottom: 6, letterSpacing: ".08em", textTransform: "uppercase" }}>Nomor Antrian</div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 2, fontFamily: "'Courier New',monospace" }}>{detail.nomor_antrian}</div>
          </div>
          {/* Info grid */}
          <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
            {[["Pasien", detail.user?.name || "—", "👤"], ["Dokter", detail.dokter?.nama || "—", "👨‍⚕️"], ["Tanggal", detail.tanggal_reservasi, "📅"], ["Status", null, "🔖"]].map(([k, v, ic]) => (
              <div key={k} style={{ background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "12px 14px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{ic} {k}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{k === "Status" ? <Badge label={detail.status} /> : v}</div>
              </div>
            ))}
          </div>
          {/* Keluhan */}
          <div style={{ background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "14px 16px", border: "1px solid var(--border)", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>💬 Keluhan</div>
            <div style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 }}>{detail.keluhan || "—"}</div>
          </div>
          <div className="acts"><button className="btn btn-ghost btn-full" onClick={() => setDetail(null)}>Tutup</button></div>
        </Modal>
      )}
    </div>
  );
}

function RekamMedisMgmt({ call }) {
  const [data, setData] = useState([]);
  const [reservasis, setReservasis] = useState([]); // untuk dropdown pilih reservasi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      // Load rekam medis + semua reservasi yang statusnya 'menunggu' (siap dibuatkan rekam medis)
      const [r, rv] = await Promise.all([
        call("/rekam-medis", {}, true),
        call("/admin/reservasis?status=menunggu", {}, true),
      ]);
      setData(r.data);
      // Saring reservasi yang BELUM punya rekam medis
      const sudahAdaRekam = new Set(r.data.map(rm => rm.reservasi_id));
      setReservasis((rv.data || []).filter(res => !sudahAdaRekam.has(res.id)));
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>Rekam Medis</h2>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Total {data.length} rekam medis tersimpan</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ reservasi_id: "", tanggal_periksa: "", diagnosis: "", resep_obat: "", catatan_dokter: "" }); setModal("add"); }}>
          ➕ Tambah Rekam Medis
        </button>
      </div>
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
          {/* Header info dokter & tanggal */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--primary-light)", borderRadius: "var(--r-md)", padding: "14px 16px", marginBottom: 20, border: "1px solid #b2ddd8" }}>
            <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🩺</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--primary-dark)", marginBottom: 2 }}>{detail.dokter?.nama || "—"}</div>
              <div style={{ fontSize: 13, color: "var(--primary)" }}>{detail.tanggal_periksa}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Pasien: {detail.user?.name || "—"}</div>
            </div>
          </div>
          {/* Diagnosis, Resep, Catatan */}
          {[["🔬 Diagnosis", detail.diagnosis], ["💊 Resep Obat", detail.resep_obat], ["📝 Catatan Dokter", detail.catatan_dokter || "Tidak ada catatan tambahan"]].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>{k}</div>
              <div style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7, background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "12px 14px", border: "1px solid var(--border)" }}>{v}</div>
            </div>
          ))}
          <div className="acts" style={{ marginTop: 8 }}><button className="btn btn-ghost btn-full" onClick={() => setDetail(null)}>Tutup</button></div>
        </Modal>
      )}
      {modal && (
        <SlidePanel
          title={modal === "add" ? "Tambah Rekam Medis" : "Edit Rekam Medis"}
          sub={modal === "add" ? "Buat catatan medis baru untuk pasien" : "Perbarui catatan medis"}
          onClose={() => setModal(null)}
          footer={<>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button form="form-rekam" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan..." : modal === "add" ? "➕ Tambah" : "💾 Simpan"}
            </button>
          </>}
        >
          <form id="form-rekam" onSubmit={save}>
            {modal === "add" && (
              <>
                {reservasis.length === 0 ? (
                  <div style={{ background: "#fef3c7", borderRadius: "var(--r-sm)", padding: "12px 14px", marginBottom: 16, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>
                    ⚠️ Tidak ada reservasi yang menunggu. Pastikan pasien sudah membuat janji temu dengan status <strong>menunggu</strong>.
                  </div>
                ) : (
                  <Field label="Pilih Reservasi Pasien" req>
                    <Sel value={form.reservasi_id || ""} onChange={s("reservasi_id")} required>
                      <option value="">-- Pilih pasien & jadwal --</option>
                      {reservasis.map(res => (
                        <option key={res.id} value={res.id}>
                          {res.nomor_antrian} · {res.user?.name || "—"} · {res.dokter?.nama || "—"} · {res.tanggal_reservasi}
                        </option>
                      ))}
                    </Sel>
                  </Field>
                )}
              </>
            )}
            <Field label="Tanggal Periksa" req>
              <Inp type="date" value={form.tanggal_periksa || ""} onChange={s("tanggal_periksa")} required />
            </Field>
            <Field label="Diagnosis" req>
              <Txta value={form.diagnosis || ""} onChange={s("diagnosis")} required
                placeholder="Contoh: Infeksi Saluran Pernapasan Atas (ISPA)"
                style={{ minHeight: 80 }} />
            </Field>
            <Field label="Resep Obat" req>
              <Txta value={form.resep_obat || ""} onChange={s("resep_obat")} required
                placeholder="Contoh: Paracetamol 500mg 3x1, Vitamin C 1x1"
                style={{ minHeight: 80 }} />
            </Field>
            <Field label="Catatan Dokter">
              <Txta value={form.catatan_dokter || ""} onChange={s("catatan_dokter")}
                placeholder="Catatan atau saran tambahan untuk pasien (opsional)"
                style={{ minHeight: 64 }} />
            </Field>
          </form>
        </SlidePanel>
      )}
    </div>
  );
}

// ─── PASIEN SECTIONS ──────────────────────────────────────────────────────────
function PasienHome({ user, call, setSection }) {
  const [reservasis, setReservasis] = useState([]);
  const [dokters, setDokters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      call("/reservasis"),
      call("/dokters"),
    ]).then(([rv, dk]) => {
      if (rv.status === "fulfilled") setReservasis(rv.value.data || []);
      if (dk.status === "fulfilled") setDokters(dk.value.data?.slice(0, 3) || []);
      setLoading(false);
    });
  }, []);

  // Hitung statistik pasien
  const totalReservasi = reservasis.length;
  const pending = reservasis.filter(r => r.status === "pending").length;
  const selesai = reservasis.filter(r => r.status === "selesai").length;
  const reservasiAktif = reservasis.find(r => r.status === "dikonfirmasi" || r.status === "pending");

  const greetHour = new Date().getHours();
  const greet = greetHour < 11 ? "Selamat Pagi" : greetHour < 15 ? "Selamat Siang" : greetHour < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <div className="fade-up">

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div className="home-hero">
        {/* Dekorasi lingkaran */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(255,255,255,.07)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -60, right: 80, width: 140, height: 140, background: "rgba(255,255,255,.05)", borderRadius: "50%" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 14, opacity: .75, marginBottom: 6 }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{greet}, {user.name.split(" ")[0]}! 👋</h2>
          <p style={{ fontSize: 14, opacity: .8, marginBottom: 24, maxWidth: 420 }}>
            Kesehatan Anda adalah prioritas kami. Buat janji temu atau cek status kunjungan Anda di sini.
          </p>
          <div className="hero-btns">
            <button onClick={() => setSection("reservasi")} style={{
              background: "#fff", color: "var(--primary)", border: "none",
              padding: "11px 22px", borderRadius: "var(--r-md)", fontWeight: 700,
              fontSize: 14, cursor: "pointer", fontFamily: "var(--font)",
              boxShadow: "0 4px 14px rgba(0,0,0,.15)", transition: "all .15s",
            }}>
              📅 Buat Janji Temu
            </button>
            <button onClick={() => setSection("cari-dokter")} style={{
              background: "rgba(255,255,255,.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,.3)",
              padding: "11px 22px", borderRadius: "var(--r-md)", fontWeight: 700,
              fontSize: 14, cursor: "pointer", fontFamily: "var(--font)", transition: "all .15s",
            }}>
              👨‍⚕️ Cari Dokter
            </button>
          </div>
        </div>
      </div>

      {/* ── RESERVASI AKTIF ─────────────────────────────────────── */}
      {reservasiAktif && (
        <div style={{
          background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
          border: "1.5px solid #a7f3d0", borderRadius: "var(--r-lg)",
          padding: "20px 24px", marginBottom: 28,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 36 }}>🗓️</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Janji Temu Aktif</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#064e3b", marginBottom: 2 }}>
                {reservasiAktif.dokter?.nama || "—"}
              </div>
              <div style={{ fontSize: 13, color: "#047857" }}>
                {reservasiAktif.tanggal_reservasi} &nbsp;·&nbsp;
                <span style={{ fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: 99 }}>Menunggu</span>
              </div>
            </div>
          </div>
          <button onClick={() => setSection("my-reservasi")} style={{
            background: "var(--primary)", color: "#fff", border: "none",
            padding: "10px 20px", borderRadius: "var(--r-sm)", fontWeight: 700,
            fontSize: 13, cursor: "pointer", fontFamily: "var(--font)", whiteSpace: "nowrap",
          }}>Lihat Detail →</button>
        </div>
      )}

      {/* ── QUICK ACCESS + DOKTER ───────────────────────────────── */}
      <div className="grid-2" style={{ gap: 24 }}>

        {/* Quick Access */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "var(--text-1)" }}>⚡ Akses Cepat</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { ic: "📅", lb: "Buat Janji Temu", sub: "Pilih dokter & jadwal", sec: "reservasi", color: "#0a7c6e" },
              { ic: "📋", lb: "Riwayat Kunjungan", sub: "Cek status janji temu", sec: "my-reservasi", color: "#3b82f6" },
              { ic: "🏥", lb: "Rekam Medis Saya", sub: "Hasil pemeriksaan dokter", sec: "rekam-medis-pasien", color: "#10b981" },
              { ic: "👨‍⚕️", lb: "Direktori Dokter", sub: "Cari spesialis terbaik", sec: "cari-dokter", color: "#7c3aed" },
            ].map(({ ic, lb, sub, sec, color }) => (
              <button key={sec} onClick={() => setSection(sec)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                background: "var(--surface)", border: "1.5px solid var(--border)",
                borderRadius: "var(--r-md)", cursor: "pointer", textAlign: "left",
                fontFamily: "var(--font)", transition: "all .15s", width: "100%",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}0d`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}
              >
                <div style={{ width: 40, height: 40, background: `${color}15`, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>{lb}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{sub}</div>
                </div>
                <div style={{ marginLeft: "auto", color: "var(--text-4)", fontSize: 16, flexShrink: 0 }}>›</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dokter Tersedia */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "var(--text-1)" }}>👨‍⚕️ Dokter Tersedia</h3>
          {loading ? <Loading /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dokters.map(d => (
                <div key={d.id} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14, boxShadow: "var(--sh-sm)",
                }}>
                  <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>👨‍⚕️</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.nama}</div>
                    <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, marginBottom: 4 }}>{d.spesialisasi}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>Rp {Number(d.biaya_konsultasi).toLocaleString("id-ID")}</div>
                  </div>
                  <button onClick={() => setSection("cari-dokter")} style={{
                    background: "var(--primary-light)", color: "var(--primary)",
                    border: "none", padding: "7px 12px", borderRadius: "var(--r-sm)",
                    fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--font)", whiteSpace: "nowrap",
                  }}>Buat Janji</button>
                </div>
              ))}
              <button onClick={() => setSection("cari-dokter")} style={{
                background: "transparent", border: "1.5px dashed var(--border-strong)",
                borderRadius: "var(--r-md)", padding: "12px", cursor: "pointer",
                fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font)",
                fontWeight: 600, transition: "all .15s",
              }}>Lihat semua dokter →</button>
            </div>
          )}
        </div>
      </div>

      {/* ── TIPS KESEHATAN ──────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)", padding: "20px 24px", marginTop: 24,
        display: "flex", gap: 16, alignItems: "flex-start",
      }}>
        <div style={{ fontSize: 32, flexShrink: 0 }}>💡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>Tips Kesehatan Hari Ini</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7 }}>
            Minum air putih minimal 8 gelas per hari, tidur 7–8 jam, dan lakukan pemeriksaan kesehatan rutin setiap 6 bulan
            untuk menjaga kesehatan optimal Anda.
          </div>
        </div>
      </div>
    </div>
  );
}

function DokterList({ call, onReservasi }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true); setError(null);
    try { const r = await call("/dokters"); setData(r.data); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const spesialisasiList = [...new Set(data.map(d => d.spesialisasi))].sort();

  const filtered = data.filter(d => {
    const matchSearch = d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.spesialisasi.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || d.spesialisasi === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="fade-up pw-page-wide">
      {/* Hero */}
      <div className="pw-page-hero">
        <div className="pw-page-hero-ic">👨‍⚕️</div>
        <div>
          <h2>Direktori Dokter</h2>
          <p>Temukan dokter spesialis terbaik dan buat janji temu langsung</p>
        </div>
      </div>

      {/* Search & filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 220, margin: 0 }}>
          <span className="search-ico">🔍</span>
          <Inp className="inp search-inp" style={{ paddingLeft: 44 }}
            placeholder="Cari nama atau spesialisasi..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Sel value={filter} onChange={e => setFilter(e.target.value)}
          style={{ width: "auto", minWidth: 200 }}>
          <option value="">Semua Spesialisasi</option>
          {spesialisasiList.map(s => <option key={s} value={s}>{s}</option>)}
        </Sel>
      </div>

      {loading ? <div className="card"><Loading /></div>
        : error ? <div className="card"><ErrorState message={error} onRetry={load} /></div>
          : (
            <>
              <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>
                Menampilkan <strong style={{ color: "var(--text-1)" }}>{filtered.length}</strong> dokter
              </div>
              <div className="doc-grid">
                {filtered.map(d => (
                  <div key={d.id} className="doc-card">
                    {/* Avatar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>👨‍⚕️</div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{d.nama}</h3>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 10px", borderRadius: 99 }}>{d.spesialisasi}</span>
                      </div>
                    </div>
                    {/* STR */}
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>📋</span> STR: {d.no_str}
                    </div>
                    {/* Bio */}
                    {d.bio && <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, flexGrow: 1, marginBottom: 14 }}>{d.bio}</p>}
                    {/* Jadwal */}
                    {d.jadwals?.length > 0 && (
                      <div style={{ background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "var(--text-2)" }}>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--text-1)" }}>⏰ Jadwal Praktik</div>
                        {d.jadwals.slice(0, 2).map(j => (
                          <div key={j.id} style={{ marginBottom: 3 }}>{j.hari} · {j.jam_mulai}–{j.jam_selesai}</div>
                        ))}
                        {d.jadwals.length > 2 && <div style={{ color: "var(--text-3)" }}>+{d.jadwals.length - 2} jadwal lainnya</div>}
                      </div>
                    )}
                    {/* Biaya */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>Biaya Konsultasi</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)" }}>Rp {Number(d.biaya_konsultasi).toLocaleString("id-ID")}</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => onReservasi(d)}>Buat Janji</button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: "1/-1" }}>
                    <Empty icon="🔍" title="Dokter tidak ditemukan" sub="Coba kata kunci atau filter lain" />
                  </div>
                )}
              </div>
            </>
          )}
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
  const selectedDokter = dokters.find(d => String(d.id) === String(form.dokter_id));

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
      showToast("Janji temu berhasil dibuat! 🎉");
      onDone();
    } catch (err) {
      showToast(err.message || "Gagal membuat janji temu", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-up pw-page">
      {/* Page hero */}
      <div className="pw-page-hero">
        <div className="pw-page-hero-ic">📅</div>
        <div>
          <h2>Buat Janji Temu</h2>
          <p>Pilih dokter dan jadwal yang tersedia, lalu ceritakan keluhan Anda</p>
        </div>
      </div>

      {/* Form card */}
      <div className="card">
        <div className="card-p">
          <form onSubmit={submit}>

            {/* Step 1 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, background: "var(--primary)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>1</div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Pilih Dokter</span>
              </div>
              <Field label="Dokter" req>
                <CustomSelect 
                  value={form.dokter_id} 
                  onChange={s("dokter_id")} 
                  placeholder="Pilih dokter..." 
                  options={dokters.map(d => ({ value: d.id, label: `${d.nama} — ${d.spesialisasi}`, d }))}
                  renderOption={(opt, isSel) => (
                    <div>
                      <div style={{ fontWeight: isSel ? 700 : 600, color: isSel ? "var(--primary-dark)" : "var(--text-1)", fontSize: 15 }}>{opt.d.nama}</div>
                      <div style={{ color: isSel ? "var(--primary)" : "var(--text-3)", fontSize: 13, marginTop: 2 }}>{opt.d.spesialisasi}</div>
                    </div>
                  )}
                />
              </Field>
              {/* Info card dokter terpilih */}
              {selectedDokter && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--primary-light)", borderRadius: "var(--r-md)", padding: "14px 16px", border: "1px solid #b2ddd8" }}>
                  <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👨‍⚕️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--primary-dark)" }}>{selectedDokter.nama}</div>
                    <div style={{ fontSize: 13, color: "var(--primary)" }}>{selectedDokter.spesialisasi}</div>
                    <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>Rp {Number(selectedDokter.biaya_konsultasi).toLocaleString("id-ID")}</div>
                  </div>
                </div>
              )}
            </div>

            <hr className="divider" />

            {/* Step 2 */}
            <div style={{ marginBottom: 28, marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, background: form.dokter_id ? "var(--primary)" : "var(--border-strong)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>2</div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Jadwal & Tanggal</span>
              </div>
              <div className="grid-2">
                <Field label="Jadwal Praktik" req>
                  <CustomSelect 
                    value={form.jadwal_id} 
                    onChange={s("jadwal_id")} 
                    disabled={!form.dokter_id}
                    placeholder={form.dokter_id ? "Pilih jadwal..." : "Pilih dokter dulu"}
                    options={jadwals.map(j => ({ value: j.id, label: `${j.hari} · ${j.jam_mulai}–${j.jam_selesai} (Kuota: ${j.kuota})`, j }))}
                    renderOption={(opt, isSel) => (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: isSel ? 700 : 600, color: isSel ? "var(--primary-dark)" : "var(--text-1)", fontSize: 15 }}>{opt.j.hari}</div>
                          <div style={{ color: isSel ? "var(--primary)" : "var(--text-3)", fontSize: 13, marginTop: 2 }}>{opt.j.jam_mulai} – {opt.j.jam_selesai}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, background: isSel ? "#fff" : "var(--surface-2)", padding: "4px 8px", borderRadius: "var(--r-sm)", color: "var(--text-2)" }}>
                          Sisa: {opt.j.kuota}
                        </div>
                      </div>
                    )}
                  />
                </Field>
                <Field label="Tanggal Kunjungan" req>
                  <Inp type="date" value={form.tanggal_reservasi} onChange={s("tanggal_reservasi")} required min={today} />
                </Field>
              </div>
            </div>

            <hr className="divider" />

            {/* Step 3 */}
            <div style={{ marginTop: 24, marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, background: form.jadwal_id ? "var(--primary)" : "var(--border-strong)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>3</div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Keluhan</span>
              </div>
              <Field label="Ceritakan keluhan Anda" req>
                <Txta value={form.keluhan} onChange={s("keluhan")} placeholder="Contoh: Saya mengalami demam tinggi selama 3 hari disertai batuk dan pilek..." required style={{ minHeight: 130 }} />
              </Field>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? "Memproses..." : "✅ Konfirmasi Janji Temu"}
            </button>
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
    if (!confirm("Batalkan janji temu ini?")) return;
    try {
      await call(`/reservasis/${id}`, { method: "PUT", body: JSON.stringify({ status: "dibatalkan" }) });
      showToast("Janji temu dibatalkan.");
      await load();
    } catch (e) { showToast(e.message, "error"); }
  };

  // Group by status untuk summary
  const counts = ["pending", "dikonfirmasi", "selesai", "dibatalkan"].map(s => ({
    s, n: data.filter(r => r.status === s).length
  }));

  return (
    <div className="fade-up pw-page-wide">
      {/* Hero */}
      <div className="pw-page-hero">
        <div className="pw-page-hero-ic">📋</div>
        <div>
          <h2>Kunjungan Saya</h2>
          <p>Pantau status dan riwayat semua janji temu Anda</p>
        </div>
      </div>

      {/* Summary badges */}
      {!loading && data.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {counts.filter(c => c.n > 0).map(({ s, lbl, n }) => (
            <span key={s} className={`badge b-${s}`} style={{ fontSize: 13, padding: "6px 14px" }}>
              {lbl}: {n}
            </span>
          ))}
        </div>
      )}

      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : <Table
          cols={[
            { key: "nomor_antrian", label: "No. Antrian", render: v => <span className="mono" style={{ color: "var(--primary)", fontWeight: 700 }}>{v}</span> },
            { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
            { key: "jadwal", label: "Jadwal", render: v => v ? `${v.hari} · ${v.jam_mulai}–${v.jam_selesai}` : "—" },
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
        <Modal title="Detail Janji Temu" onClose={() => setDetail(null)}>
          {/* Nomor antrian banner */}
          <div style={{ background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-lg)", padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>No. Antrian</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Courier New',monospace", letterSpacing: 2 }}>{detail.nomor_antrian}</div>
            </div>
            <Badge label={detail.status} />
          </div>
          {/* Info 2 kolom */}
          <div className="grid-2" style={{ gap: 10, marginBottom: 14 }}>
            {[
              ["👨‍⚕️ Dokter", detail.dokter?.nama || "—"],
              ["📅 Tanggal", detail.tanggal_reservasi],
              ["🕐 Jadwal", detail.jadwal ? `${detail.jadwal.hari}, ${detail.jadwal.jam_mulai}–${detail.jadwal.jam_selesai}` : "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "11px 14px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Keluhan */}
          <div style={{ background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "12px 14px", border: "1px solid var(--border)", marginBottom: detail.rekam_medis ? 14 : 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>💬 Keluhan</div>
            <div style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.7 }}>{detail.keluhan || "—"}</div>
          </div>
          {/* Rekam medis */}
          {detail.rekam_medis && (
            <div style={{ background: "#ecfdf5", borderRadius: "var(--r-md)", border: "1px solid #a7f3d0", padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <span style={{ fontWeight: 700, color: "#065f46", fontSize: 14 }}>Rekam Medis Tersedia</span>
              </div>
              <div style={{ fontSize: 13, color: "#065f46", marginBottom: 6 }}><strong>Diagnosis:</strong> {detail.rekam_medis.diagnosis}</div>
              <div style={{ fontSize: 13, color: "#065f46" }}><strong>Resep:</strong> {detail.rekam_medis.resep_obat}</div>
            </div>
          )}
          <button className="btn btn-ghost btn-full" onClick={() => setDetail(null)}>Tutup</button>
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
    <div className="fade-up pw-page-wide">
      {/* Hero */}
      <div className="pw-page-hero">
        <div className="pw-page-hero-ic">🏥</div>
        <div>
          <h2>Rekam Medis Saya</h2>
          <p>Riwayat pemeriksaan dan hasil diagnosis dokter Anda</p>
        </div>
      </div>

      {loading ? <div className="card"><Loading /></div>
        : error ? <div className="card"><ErrorState message={error} /></div>
          : data.length === 0
            ? (
              <div className="card">
                <Empty icon="🏥" title="Belum ada rekam medis"
                  sub="Rekam medis akan muncul setelah konsultasi Anda selesai" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {data.map((rm, i) => (
                  <div key={i} className="card card-p" style={{ cursor: "pointer", transition: "all .15s" }}
                    onClick={() => setDetail(rm)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🩺</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>{rm.dokter?.nama || "—"}</span>
                          <span style={{ fontSize: 12, color: "var(--text-3)" }}>·</span>
                          <span style={{ fontSize: 13, color: "var(--text-3)" }}>{rm.tanggal_periksa}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <strong>Diagnosis:</strong> {rm.diagnosis}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <strong>Resep:</strong> {rm.resep_obat}
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>Lihat →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

      {detail && (
        <Modal title="Detail Rekam Medis" onClose={() => setDetail(null)}>
          {/* Header dokter */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-lg)", padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, background: "rgba(255,255,255,.2)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🩺</div>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 15, marginBottom: 2 }}>{detail.dokter?.nama || "—"}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>📅 {detail.tanggal_periksa}</div>
            </div>
          </div>
          {/* Fields */}
          {[
            ["🔬 Diagnosis", detail.diagnosis],
            ["💊 Resep Obat", detail.resep_obat],
            ["📝 Catatan Dokter", detail.catatan_dokter || "Tidak ada catatan tambahan"],
          ].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>{k}</div>
              <div style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.75, background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "12px 16px", border: "1px solid var(--border)" }}>{v}</div>
            </div>
          ))}
          <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => setDetail(null)}>Tutup</button>
        </Modal>
      )}
    </div>
  );
}

// ─── PATIENT WEBSITE SHELL ────────────────────────────────────────────────────
function PatientShell({ user, active, goto, onLogout, children }) {
  const [dropdown, setDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const NAV = [
    ["home", "🏠", "Beranda"],
    ["cari-dokter", "👨‍⚕️", "Cari Dokter"],
    ["reservasi", "📅", "Buat Janji Temu"],
    ["my-reservasi", "📋", "Kunjungan Saya"],
    ["rekam-medis-pasien", "🏥", "Rekam Medis"],
  ];

  return (
    <div className="pw-shell">
      {/* ── TOP NAVIGATION ── */}
      <header className="pw-topbar">
        <div className="pw-topbar-inner">
          {/* Hamburger mobile */}
          <button className="pw-hamburger" onClick={() => setMobileMenu(m => !m)}>☰</button>

          {/* Logo */}
          <div className="pw-logo" onClick={() => goto("home")} style={{ cursor: "pointer" }}>
            <div className="pw-logo-ic">🏥</div>
            <div>
              <div className="pw-logo-name">Klinik Sehat</div>
              <div className="pw-logo-sub">Portal Pasien</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="pw-nav">
            {NAV.map(([id, , label]) => (
              <button key={id} className={`pw-nav-btn ${active === id ? "active" : ""}`} onClick={() => goto(id)}>
                {label}
              </button>
            ))}
          </nav>

          {/* User dropdown */}
          <div className="pw-user">
            <div className="pw-user-info" style={{ textAlign: "right", display: "flex", flexDirection: "column" }}>
              <span className="pw-user-name">{user.name}</span>
              <span className="pw-user-role">Pasien</span>
            </div>
            <div className="pw-avatar" onClick={() => setDropdown(d => !d)}>
              {initials}
              {dropdown && (
                <div className="pw-dropdown" onClick={e => e.stopPropagation()}>
                  <div className="pw-dropdown-head">
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{user.email}</div>
                  </div>
                  <button className="pw-dropdown-item" onClick={() => { goto("profile"); setDropdown(false); }}>
                    👤 Edit Profil
                  </button>
                  <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                  <button className="pw-dropdown-item danger" onClick={onLogout}>
                    🚪 Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`pw-mobile-menu ${mobileMenu ? "open" : ""}`}>
          {NAV.map(([id, ic, label]) => (
            <button key={id} className={`pw-mobile-item ${active === id ? "active" : ""}`}
              onClick={() => { goto(id); setMobileMenu(false); }}>
              {ic} {label}
            </button>
          ))}
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />
          <button className="pw-mobile-item" onClick={() => { goto("profile"); setMobileMenu(false); }}>👤 Edit Profil</button>
          <button className="pw-mobile-item" style={{ color: "var(--danger)" }} onClick={onLogout}>🚪 Keluar</button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="pw-body">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="pw-footer">
        <strong>Klinik Sehat</strong> &nbsp;·&nbsp; Jl. Bikini Bottom No. 14, Indonesia
        &nbsp;·&nbsp; © {new Date().getFullYear()} Semua hak dilindungi
      </footer>

      {/* ── BOTTOM NAV (MOBILE) ── */}
      <nav className="pw-bottom-nav">
        <div className="pw-bottom-nav-inner">
          {NAV.map(([id, ic, label]) => (
            <button key={id} className={`pw-bottom-nav-item ${active === id ? "active" : ""}`} onClick={() => goto(id)}>
              <span className="pw-bottom-nav-ic">{ic}</span>
              <span className="pw-bottom-nav-lbl">{label === "Buat Janji Temu" ? "Janji Temu" : label === "Kunjungan Saya" ? "Kunjungan" : label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─── DASHBOARD SHELL ──────────────────────────────────────────────────────────
// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, call, showToast, onUpdate }) {
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({ name: user.name, email: user.email, no_hp: user.no_hp || "" });
  const [passForm, setPassForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [saving, setSaving] = useState(false);
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const sp = k => e => setPassForm(p => ({ ...p, [k]: e.target.value }));
  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const saveInfo = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await call("/profile", { method: "PUT", body: JSON.stringify(form) });
      showToast("Profil berhasil diperbarui ✅");
      onUpdate(r.data);
    } catch (err) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const savePass = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await call("/profile/password", { method: "PUT", body: JSON.stringify(passForm) });
      showToast("Password berhasil diganti ✅");
      setPassForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-up pw-page">
      {/* Profile hero card */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-mid) 100%)",
        borderRadius: "var(--r-xl)", padding: "32px 36px", marginBottom: 28,
        display: "flex", alignItems: "center", gap: 24, color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "rgba(255,255,255,.07)", borderRadius: "50%" }} />
        <div style={{ width: 80, height: 80, background: "rgba(255,255,255,.2)", borderRadius: "var(--r-lg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, flexShrink: 0, backdropFilter: "blur(4px)", border: "2px solid rgba(255,255,255,.3)" }}>{initials}</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user.name}</div>
          <div style={{ fontSize: 14, opacity: .8, marginBottom: 8 }}>{user.email}</div>
          <span className="badge b-pasien" style={{ background: "rgba(255,255,255,.2)", color: "#fff", border: "1px solid rgba(255,255,255,.3)" }}>Pasien</span>
        </div>
      </div>

      {/* Tab card */}
      <div className="card">
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
          {[["info", "✏️", "Edit Profil"], ["password", "🔒", "Ganti Password"]].map(([id, ic, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: "16px 20px", border: "none", background: "transparent",
              cursor: "pointer", fontFamily: "var(--font)", fontSize: 14, fontWeight: 600,
              color: tab === id ? "var(--primary)" : "var(--text-3)",
              borderBottom: tab === id ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1, transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>{ic} {label}</button>
          ))}
        </div>

        <div className="card-p">
          {tab === "info" ? (
            <form onSubmit={saveInfo}>
              <div className="grid-2">
                <Field label="Nama Lengkap" req><Inp value={form.name} onChange={s("name")} required /></Field>
                <Field label="No. HP"><Inp value={form.no_hp} onChange={s("no_hp")} placeholder="08xx-xxxx-xxxx" /></Field>
              </div>
              <Field label="Email" req><Inp type="email" value={form.email} onChange={s("email")} required /></Field>
              <hr className="divider" />
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving}>
                {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
              </button>
            </form>
          ) : (
            <form onSubmit={savePass}>
              <div className="alert a-warn" style={{ marginBottom: 20 }}>
                ⚠️ Setelah ganti password, Anda perlu login ulang.
              </div>
              <Field label="Password Saat Ini" req>
                <Inp type="password" value={passForm.current_password} onChange={sp("current_password")} required placeholder="Masukkan password lama" />
              </Field>
              <div className="grid-2">
                <Field label="Password Baru" req>
                  <Inp type="password" value={passForm.new_password} onChange={sp("new_password")} required placeholder="Min. 6 karakter" minLength={6} />
                </Field>
                <Field label="Konfirmasi Password Baru" req>
                  <Inp type="password" value={passForm.new_password_confirmation} onChange={sp("new_password_confirmation")} required placeholder="Ulangi password baru" />
                </Field>
              </div>
              <hr className="divider" />
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving}>
                {saving ? "Menyimpan..." : "🔒 Ganti Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

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
  ["reservasi", "📅", "Buat Janji Temu"],
  ["my-reservasi", "📋", "Kunjungan Saya"],
  ["rekam-medis-pasien", "🏥", "Rekam Medis Saya"],
];
const PAGE_TITLES = {
  home: "Beranda", dokters: "Manajemen Dokter", jadwals: "Manajemen Jadwal",
  reservasis: "Manajemen Reservasi", "rekam-medis": "Rekam Medis",
  "cari-dokter": "Cari Dokter", reservasi: "Buat Reservasi",
  "my-reservasi": "Reservasi Saya", "rekam-medis-pasien": "Rekam Medis Saya",
  profile: "Profil Saya",
};

function Dashboard({ user: initialUser, onLogout, callApi, active, setActive, showToast }) {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [dokterForReservasi, setDokterForReservasi] = useState(null);
  const isAdmin = user.role === "admin";
  const call = (path, opts = {}, needKey = false) => callApi(path, opts, needKey);
  const goto = sec => { setActive(sec); setOpen(false); setDropdown(false); };
  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const pasienContent = () => {
    switch (active) {
      case "cari-dokter": return <DokterList call={call} onReservasi={d => { setDokterForReservasi(d); goto("reservasi"); }} />;
      case "reservasi": return <ReservasiForm call={call} showToast={showToast} initialDokter={dokterForReservasi} onDone={() => goto("my-reservasi")} />;
      case "my-reservasi": return <MyReservasi call={call} showToast={showToast} />;
      case "rekam-medis-pasien": return <MyRekamMedis call={call} />;
      case "profile": return <ProfilePage user={user} call={call} showToast={showToast} onUpdate={setUser} />;
      default: return <PasienHome user={user} call={call} setSection={goto} />;
    }
  };

  // ── Pasien pakai website layout ──────────────────────────────────────────
  if (!isAdmin) {
    return (
      <PatientShell user={user} active={active} goto={goto} onLogout={onLogout}>
        {pasienContent()}
      </PatientShell>
    );
  }

  // ── Admin pakai dashboard sidebar ────────────────────────────────────────
  const adminContent = () => {
    switch (active) {
      case "dokters": return <DokterMgmt call={call} />;
      case "jadwals": return <JadwalMgmt call={call} />;
      case "reservasis": return <AdminReservasi call={call} showToast={showToast} />;
      case "rekam-medis": return <RekamMedisMgmt call={call} />;
      default: return <AdminHome call={call} user={user} />;
    }
  };

  const ADMIN_NAV_LIST = [
    ["home", "🏠", "Beranda"],
    ["dokters", "👨‍⚕️", "Dokter"],
    ["jadwals", "📅", "Jadwal"],
    ["reservasis", "📋", "Reservasi"],
    ["rekam-medis", "🏥", "Rekam Medis"],
  ];

  const ADMIN_TITLES = {
    home: "Beranda", dokters: "Manajemen Dokter", jadwals: "Manajemen Jadwal",
    reservasis: "Manajemen Reservasi", "rekam-medis": "Rekam Medis",
  };

  return (
    <div className="app-shell">
      <div className={`sb-overlay ${open ? "open" : ""}`} onClick={() => { setOpen(false); setDropdown(false); }} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sb-logo">
          <div className="sb-logo-icon">🏥</div>
          <div>
            <div className="sb-logo-name">Klinik Sehat</div>
            <div className="sb-logo-role">Administrator</div>
          </div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Menu Utama</div>
          {ADMIN_NAV_LIST.map(([id, icon, label]) => (
            <button key={id} className={`nav-btn ${active === id ? "active" : ""}`} onClick={() => goto(id)}>
              <span className="nav-icon">{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div className="sb-footer">
          {dropdown && (
            <div className="user-dropdown">
              <div className="ud-head">
                <div className="ud-name">{user.name}</div>
                <div className="ud-email">{user.email}</div>
              </div>
              <hr className="ud-divider" />
              <button className="ud-item danger" onClick={onLogout}>🚪 Keluar</button>
            </div>
          )}
          <button className="sb-user-btn" onClick={() => setDropdown(d => !d)}>
            <div className="avatar av-lg">{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sb-name">{user.name}</div>
              <div className="sb-email">{user.email}</div>
            </div>
            <span style={{ color: "rgba(255,255,255,.3)", fontSize: 14, flexShrink: 0, transform: dropdown ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▲</span>
          </button>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-l">
            <button className="hamburger" onClick={() => setOpen(o => !o)}>☰</button>
            <div>
              <div className="topbar-title">{ADMIN_TITLES[active] || "Dashboard"}</div>
              <div className="topbar-sub">Klinik Sehat · Admin</div>
            </div>
          </div>
          <div className="avatar av-sm">{initials}</div>
        </header>
        <div className="page-body">{adminContent()}</div>
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