import React, { useState } from 'react';
import { Field, Inp } from '../shared/Field';

export default function RegisterPage({ onRegister, onGoto, loading, error }) {
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
