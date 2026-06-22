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

export default function AdminReservasi({ call, showToast }) {
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