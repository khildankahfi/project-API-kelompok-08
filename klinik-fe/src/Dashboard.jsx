import React, { useState, useEffect } from 'react';
import PatientShell from './components/pasien/PatientShell';
import PasienHome from './components/pasien/PasienHome';
import DokterList from './components/pasien/DokterList';
import ReservasiForm from './components/pasien/ReservasiForm';
import MyReservasi from './components/pasien/MyReservasi';
import MyRekamMedis from './components/pasien/MyRekamMedis';
import ProfilePage from './components/pasien/ProfilePage';
import AdminHome from './components/admin/AdminHome';
import DokterMgmt from './components/admin/DokterMgmt';
import JadwalMgmt from './components/admin/JadwalMgmt';
import AdminReservasi from './components/admin/AdminReservasi';
import RekamMedisMgmt from './components/admin/RekamMedisMgmt';
import NotificationBell from './components/NotificationBell';

export default function Dashboard({ user: initialUser, onLogout, callApi, active, setActive, showToast }) {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NotificationBell />
            <div className="avatar av-sm">{initials}</div>
          </div>
        </header>
        <div className="page-body">{adminContent()}</div>
      </div>
    </div>
  );
}