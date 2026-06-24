import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from 'recharts';
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

export default function AdminHome({ call, user }) {
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