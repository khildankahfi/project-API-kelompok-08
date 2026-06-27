import React, { useState, useEffect, useCallback } from "react";
import { api } from "./api.js";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import Dashboard from "./Dashboard";
import "./styles/global.css";

export default function App() {
  const initialToken = localStorage.getItem("klinik_token") || "";
  const [page, setPage] = useState(initialToken ? "loading" : "login");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(initialToken);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("klinik_api_key") || "");
  const [active, setActive] = useState("home");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [authErr, setAuthErr] = useState("");

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  
  // Fix API key storage
  const storeKey = k => { 
    if (k) { 
      setApiKey(k); 
      localStorage.setItem("klinik_api_key", k); 
    } 
  };

  useEffect(() => {
    if (!token) return;
    api("/auth/me", {}, token)
      .then(r => { setUser(r.data); storeKey(r.data.api_key); setPage("dashboard"); })
      .catch(() => { localStorage.removeItem("klinik_token"); setToken(""); setPage("login"); });
  }, [token]);

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
      {toast && <div className={`toast t-${toast.type}`} onClick={() => setToast(null)}>{toast.msg}</div>}
      {page === "loading" && (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: '#0a7c6e', fontSize: 16 }}>
          Memuat data profil...
        </div>
      )}
      {page === "login" && <LoginPage onLogin={login} onGoto={setPage} loading={loading} error={authErr} />}
      {page === "register" && <RegisterPage onRegister={register} onGoto={setPage} loading={loading} error={authErr} />}
      {page === "dashboard" && user && <Dashboard user={user} onLogout={logout} callApi={callApi} active={active} setActive={setActive} showToast={showToast} />}
    </>
  );
}