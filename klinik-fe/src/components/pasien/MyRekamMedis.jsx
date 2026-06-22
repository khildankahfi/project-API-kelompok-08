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

export default function MyRekamMedis({ call }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    call("/reservasis")
      .then(async r => {
        const selesai = r.data.filter(rv => rv.status === "selesai");
        const details = await Promise.allSettled(selesai.map(rv => call(`/reservasis/${rv.id}`)));
        setData(details
          .filter(d => d.status === "fulfilled" && d.value?.data?.rekam_medis)
          .map(d => ({ ...d.value.data.rekam_medis, dokter: d.value.data.dokter }))
        );
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-up pw-page-wide">
      {/* Hero */}
      <div className="pw-page-hero">
        <div className="pw-page-hero-ic">🏥</div>
        <div>
          <h2>Rekam Medis Saya</h2>
          <p>Riwayat pemeriksaan dan hasil diagnosis dokter Anda</p>
        </div>
      </div>

      {loading ? <div className="card"><Loading /></div>
        : error ? <div className="card"><ErrorState message={error} /></div>
          : data.length === 0
            ? (
              <div className="card">
                <Empty icon="🏥" title="Belum ada rekam medis"
                  sub="Rekam medis akan muncul setelah konsultasi Anda selesai" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {data.map((rm, i) => (
                  <div key={i} className="card card-p" style={{ cursor: "pointer", transition: "all .15s" }}
                    onClick={() => setDetail(rm)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🩺</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>{rm.dokter?.nama || "—"}</span>
                          <span style={{ fontSize: 12, color: "var(--text-3)" }}>·</span>
                          <span style={{ fontSize: 13, color: "var(--text-3)" }}>{rm.tanggal_periksa}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <strong>Diagnosis:</strong> {rm.diagnosis}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <strong>Resep:</strong> {rm.resep_obat}
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>Lihat →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

      {detail && (
        <Modal title="Detail Rekam Medis" onClose={() => setDetail(null)}>
          {/* Header dokter */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-lg)", padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, background: "rgba(255,255,255,.2)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🩺</div>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 15, marginBottom: 2 }}>{detail.dokter?.nama || "—"}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.75)" }}>📅 {detail.tanggal_periksa}</div>
            </div>
          </div>
          {/* Fields */}
          {[
            ["🔬 Diagnosis", detail.diagnosis],
            ["💊 Resep Obat", detail.resep_obat],
            ["📝 Catatan Dokter", detail.catatan_dokter || "Tidak ada catatan tambahan"],
          ].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>{k}</div>
              <div style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.75, background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "12px 16px", border: "1px solid var(--border)" }}>{v}</div>
            </div>
          ))}
          <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => setDetail(null)}>Tutup</button>
        </Modal>
      )}
    </div>
  );
}