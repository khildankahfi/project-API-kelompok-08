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

export default function ReservasiForm({ call, showToast, initialDokter, onDone }) {
  const [dokters, setDokters] = useState([]);
  const [jadwals, setJadwals] = useState([]);
  const [form, setForm] = useState({ dokter_id: initialDokter?.id || "", jadwal_id: "", tanggal_reservasi: "", keluhan: "" });
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const selectedDokter = dokters.find(d => String(d.id) === String(form.dokter_id));

  useEffect(() => { call("/dokters").then(r => setDokters(r.data)).catch(() => { }); }, []);
  useEffect(() => {
    if (!form.dokter_id) { setJadwals([]); return; }
    call("/jadwals").then(r => {
      setJadwals(r.data.filter(j => String(j.dokter_id) === String(form.dokter_id) && j.is_aktif));
      setForm(p => ({ ...p, jadwal_id: "" }));
    }).catch(() => { });
  }, [form.dokter_id]);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await call("/reservasis", { method: "POST", body: JSON.stringify(form) });
      showToast("Janji temu berhasil dibuat! 🎉");
      onDone();
    } catch (err) {
      showToast(err.message || "Gagal membuat janji temu", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-up pw-page">
      {/* Page hero */}
      <div className="pw-page-hero">
        <div className="pw-page-hero-ic">📅</div>
        <div>
          <h2>Buat Janji Temu</h2>
          <p>Pilih dokter dan jadwal yang tersedia, lalu ceritakan keluhan Anda</p>
        </div>
      </div>

      {/* Form card */}
      <div className="card">
        <div className="card-p">
          <form onSubmit={submit}>

            {/* Step 1 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, background: "var(--primary)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>1</div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Pilih Dokter</span>
              </div>
              <Field label="Dokter" req>
                <ResponsiveSelect 
                  value={form.dokter_id} 
                  onChange={s("dokter_id")} 
                  required
                  placeholder="Pilih dokter..." 
                  options={dokters.map(d => ({ value: d.id, label: `${d.nama} — ${d.spesialisasi}`, d }))}
                  renderOption={(opt, isSel) => (
                    <div>
                      <div style={{ fontWeight: isSel ? 700 : 600, color: isSel ? "var(--primary-dark)" : "var(--text-1)", fontSize: 15 }}>{opt.d.nama}</div>
                      <div style={{ color: isSel ? "var(--primary)" : "var(--text-3)", fontSize: 13, marginTop: 2 }}>{opt.d.spesialisasi}</div>
                    </div>
                  )}
                />
              </Field>
              {/* Info card dokter terpilih */}
              {selectedDokter && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--primary-light)", borderRadius: "var(--r-md)", padding: "14px 16px", border: "1px solid #b2ddd8" }}>
                  <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👨‍⚕️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--primary-dark)" }}>{selectedDokter.nama}</div>
                    <div style={{ fontSize: 13, color: "var(--primary)" }}>{selectedDokter.spesialisasi}</div>
                    <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>Rp {Number(selectedDokter.biaya_konsultasi).toLocaleString("id-ID")}</div>
                  </div>
                </div>
              )}
            </div>

            <hr className="divider" />

            {/* Step 2 */}
            <div style={{ marginBottom: 28, marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, background: form.dokter_id ? "var(--primary)" : "var(--border-strong)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>2</div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Jadwal & Tanggal</span>
              </div>
              <div className="grid-2">
                <Field label="Jadwal Praktik" req>
                  <ResponsiveSelect 
                    value={form.jadwal_id} 
                    onChange={s("jadwal_id")} 
                    required
                    disabled={!form.dokter_id}
                    placeholder={form.dokter_id ? "Pilih jadwal..." : "Pilih dokter dulu"}
                    options={jadwals.map(j => ({ value: j.id, label: `${j.hari} · ${j.jam_mulai}–${j.jam_selesai} (Kuota: ${j.kuota})`, j }))}
                    renderOption={(opt, isSel) => (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: isSel ? 700 : 600, color: isSel ? "var(--primary-dark)" : "var(--text-1)", fontSize: 15 }}>{opt.j.hari}</div>
                          <div style={{ color: isSel ? "var(--primary)" : "var(--text-3)", fontSize: 13, marginTop: 2 }}>{opt.j.jam_mulai} – {opt.j.jam_selesai}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, background: isSel ? "#fff" : "var(--surface-2)", padding: "4px 8px", borderRadius: "var(--r-sm)", color: "var(--text-2)" }}>
                          Sisa: {opt.j.kuota}
                        </div>
                      </div>
                    )}
                  />
                </Field>
                <Field label="Tanggal Kunjungan" req>
                  <Inp type="date" value={form.tanggal_reservasi} onChange={s("tanggal_reservasi")} required min={today} />
                </Field>
              </div>
            </div>

            <hr className="divider" />

            {/* Step 3 */}
            <div style={{ marginTop: 24, marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, background: form.jadwal_id ? "var(--primary)" : "var(--border-strong)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>3</div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Keluhan</span>
              </div>
              <Field label="Ceritakan keluhan Anda" req>
                <Txta value={form.keluhan} onChange={s("keluhan")} placeholder="Contoh: Saya mengalami demam tinggi selama 3 hari disertai batuk dan pilek..." required style={{ minHeight: 130 }} />
              </Field>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? "Memproses..." : "✅ Konfirmasi Janji Temu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}