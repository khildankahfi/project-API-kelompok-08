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

export default function PasienHome({ user, call, setSection }) {
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