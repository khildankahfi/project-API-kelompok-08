import React, { useState } from 'react';
import { Field, Inp } from '../shared/Field';

export default function LoginPage({ onLogin, onGoto, loading, error }) {
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
