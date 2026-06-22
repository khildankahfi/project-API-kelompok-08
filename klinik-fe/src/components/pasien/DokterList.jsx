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

export default function DokterList({ call, onReservasi }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true); setError(null);
    try { const r = await call("/dokters"); setData(r.data); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const spesialisasiList = [...new Set(data.map(d => d.spesialisasi))].sort();

  const filtered = data.filter(d => {
    const matchSearch = d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.spesialisasi.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || d.spesialisasi === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="fade-up pw-page-wide">
      {/* Hero */}
      <div className="pw-page-hero">
        <div className="pw-page-hero-ic">👨‍⚕️</div>
        <div>
          <h2>Direktori Dokter</h2>
          <p>Temukan dokter spesialis terbaik dan buat janji temu langsung</p>
        </div>
      </div>

      {/* Search & filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 220, margin: 0 }}>
          <span className="search-ico">🔍</span>
          <Inp className="inp search-inp" style={{ paddingLeft: 44 }}
            placeholder="Cari nama atau spesialisasi..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Sel value={filter} onChange={e => setFilter(e.target.value)}
          style={{ width: "auto", minWidth: 200 }}>
          <option value="">Semua Spesialisasi</option>
          {spesialisasiList.map(s => <option key={s} value={s}>{s}</option>)}
        </Sel>
      </div>

      {loading ? <div className="card"><Loading /></div>
        : error ? <div className="card"><ErrorState message={error} onRetry={load} /></div>
          : (
            <>
              <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>
                Menampilkan <strong style={{ color: "var(--text-1)" }}>{filtered.length}</strong> dokter
              </div>
              <div className="doc-grid">
                {filtered.map(d => (
                  <div key={d.id} className="doc-card">
                    {/* Avatar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>👨‍⚕️</div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{d.nama}</h3>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "3px 10px", borderRadius: 99 }}>{d.spesialisasi}</span>
                      </div>
                    </div>
                    {/* STR */}
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>📋</span> STR: {d.no_str}
                    </div>
                    {/* Bio */}
                    {d.bio && <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, flexGrow: 1, marginBottom: 14 }}>{d.bio}</p>}
                    {/* Jadwal */}
                    {d.jadwals?.length > 0 && (
                      <div style={{ background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "var(--text-2)" }}>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--text-1)" }}>⏰ Jadwal Praktik</div>
                        {d.jadwals.slice(0, 2).map(j => (
                          <div key={j.id} style={{ marginBottom: 3 }}>{j.hari} · {j.jam_mulai}–{j.jam_selesai}</div>
                        ))}
                        {d.jadwals.length > 2 && <div style={{ color: "var(--text-3)" }}>+{d.jadwals.length - 2} jadwal lainnya</div>}
                      </div>
                    )}
                    {/* Biaya */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>Biaya Konsultasi</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)" }}>Rp {Number(d.biaya_konsultasi).toLocaleString("id-ID")}</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => onReservasi(d)}>Buat Janji</button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: "1/-1" }}>
                    <Empty icon="🔍" title="Dokter tidak ditemukan" sub="Coba kata kunci atau filter lain" />
                  </div>
                )}
              </div>
            </>
          )}
    </div>
  );
}