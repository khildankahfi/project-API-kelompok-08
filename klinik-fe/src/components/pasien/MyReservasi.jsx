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

export default function MyReservasi({ call, showToast }) {
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
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : (
          <>
            {/* Desktop View */}
            <div className="desktop-only">
              <Table
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
              />
            </div>

            {/* Mobile View */}
            <div className="mobile-only" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {data.length === 0 ? (
                <Empty title="Belum ada data" sub="Data akan tampil di sini" />
              ) : (
                data.map((row, i) => (
                  <div key={row.id || i} style={{ border: "1px solid var(--border)", padding: "16px", borderRadius: "var(--r-md)", background: "var(--surface-2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>No. Antrian</div>
                        <div className="mono" style={{ color: "var(--primary)", fontWeight: 700, fontSize: 16 }}>{row.nomor_antrian}</div>
                      </div>
                      <Badge label={row.status} />
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 6 }}>
                      <strong>👨‍⚕️ Dokter:</strong> {row.dokter?.nama || "—"}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 16 }}>
                      <strong>📅 Jadwal:</strong> {row.tanggal_reservasi} <br />
                      <span style={{ marginLeft: "24px", fontSize: 13 }}>{row.jadwal ? `(${row.jadwal.hari}, ${row.jadwal.jam_mulai}–${row.jadwal.jam_selesai})` : ""}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={async () => {
                        try { const r = await call(`/reservasis/${row.id}`); setDetail(r.data); }
                        catch { setDetail(row); }
                      }}>Detail</button>
                      {row.status === "pending" && (
                        <button className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => batalkan(row.id)}>Batalkan</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
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