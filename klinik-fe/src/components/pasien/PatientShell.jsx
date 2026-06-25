import React, { useState, useEffect } from 'react';
import Badge from '../shared/Badge';
import Modal from '../shared/Modal';
import SlidePanel from '../shared/SlidePanel';
import { Field, Inp, Sel, Txta } from '../shared/Field';
import Table from '../shared/Table';
import Loading from '../shared/Loading';
import Empty from '../shared/Empty';
import ErrorState from '../shared/ErrorState';
import CustomSelect from '../shared/CustomSelect';
import ResponsiveSelect from '../shared/ResponsiveSelect';
import PH from '../shared/PH';
import NotificationBell from '../NotificationBell';

export default function PatientShell({ user, active, goto, onLogout, children }) {
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

            <div className="pw-user">
              <NotificationBell />
              <div className="pw-user-info" style={{ textAlign: "right", display: "flex", flexDirection: "column", marginLeft: "12px" }}>
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