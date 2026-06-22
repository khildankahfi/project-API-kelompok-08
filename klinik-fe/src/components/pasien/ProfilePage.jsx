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

export default function ProfilePage({ user, call, showToast, onUpdate }) {
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