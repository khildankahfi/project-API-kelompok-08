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

export default function RekamMedisMgmt({ call }) {
  const [data, setData] = useState([]);
  const [reservasis, setReservasis] = useState([]); // untuk dropdown pilih reservasi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      // Load rekam medis + semua reservasi yang statusnya 'menunggu' (siap dibuatkan rekam medis)
      const [r, rv] = await Promise.all([
        call("/rekam-medis", {}, true),
        call("/admin/reservasis?status=menunggu", {}, true),
      ]);
      setData(r.data);
      // Saring reservasi yang BELUM punya rekam medis
      const sudahAdaRekam = new Set(r.data.map(rm => rm.reservasi_id));
      setReservasis((rv.data || []).filter(res => !sudahAdaRekam.has(res.id)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const s = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      modal === "add"
        ? await call("/rekam-medis", { method: "POST", body: JSON.stringify(form) }, true)
        : await call(`/rekam-medis/${form.id}`, { method: "PUT", body: JSON.stringify(form) }, true);
      await load(); setModal(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm("Hapus rekam medis ini?")) return;
    try { await call(`/rekam-medis/${id}`, { method: "DELETE" }, true); await load(); }
    catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>Rekam Medis</h2>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Total {data.length} rekam medis tersimpan</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ reservasi_id: "", tanggal_periksa: "", diagnosis: "", resep_obat: "", catatan_dokter: "" }); setModal("add"); }}>
          ➕ Tambah Rekam Medis
        </button>
      </div>
      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : <Table
          cols={[
            { key: "user", label: "Pasien", render: v => v?.name || "—" },
            { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
            { key: "tanggal_periksa", label: "Tanggal" },
            { key: "diagnosis", label: "Diagnosis", render: v => <span className="truncate" title={v}>{v?.length > 50 ? v.slice(0, 50) + "…" : v}</span> },
          ]}
          data={data}
          actions={row => <>
            <button className="btn btn-outline btn-sm" onClick={() => setDetail(row)}>Detail</button>
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({ ...row }); setModal("edit"); }}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(row.id)}>Hapus</button>
          </>}
        />}
      </div>
      {detail && (
        <Modal title="Detail Rekam Medis" onClose={() => setDetail(null)}>
          {/* Header info dokter & tanggal */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--primary-light)", borderRadius: "var(--r-md)", padding: "14px 16px", marginBottom: 20, border: "1px solid #b2ddd8" }}>
            <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,var(--primary),var(--primary-mid))", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🩺</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--primary-dark)", marginBottom: 2 }}>{detail.dokter?.nama || "—"}</div>
              <div style={{ fontSize: 13, color: "var(--primary)" }}>{detail.tanggal_periksa}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Pasien: {detail.user?.name || "—"}</div>
            </div>
          </div>
          {/* Diagnosis, Resep, Catatan */}
          {[["🔬 Diagnosis", detail.diagnosis], ["💊 Resep Obat", detail.resep_obat], ["📝 Catatan Dokter", detail.catatan_dokter || "Tidak ada catatan tambahan"]].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>{k}</div>
              <div style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7, background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "12px 14px", border: "1px solid var(--border)" }}>{v}</div>
            </div>
          ))}
          <div className="acts" style={{ marginTop: 8 }}><button className="btn btn-ghost btn-full" onClick={() => setDetail(null)}>Tutup</button></div>
        </Modal>
      )}
      {modal && (
        <SlidePanel
          title={modal === "add" ? "Tambah Rekam Medis" : "Edit Rekam Medis"}
          sub={modal === "add" ? "Buat catatan medis baru untuk pasien" : "Perbarui catatan medis"}
          onClose={() => setModal(null)}
          footer={<>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button form="form-rekam" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan..." : modal === "add" ? "➕ Tambah" : "💾 Simpan"}
            </button>
          </>}
        >
          <form id="form-rekam" onSubmit={save}>
            {modal === "add" && (
              <>
                {reservasis.length === 0 ? (
                  <div style={{ background: "#fef3c7", borderRadius: "var(--r-sm)", padding: "12px 14px", marginBottom: 16, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>
                    ⚠️ Tidak ada reservasi yang menunggu. Pastikan pasien sudah membuat janji temu dengan status <strong>menunggu</strong>.
                  </div>
                ) : (
                  <Field label="Pilih Reservasi Pasien" req>
                    <Sel value={form.reservasi_id || ""} onChange={s("reservasi_id")} required>
                      <option value="">-- Pilih pasien & jadwal --</option>
                      {reservasis.map(res => (
                        <option key={res.id} value={res.id}>
                          {res.nomor_antrian} · {res.user?.name || "—"} · {res.dokter?.nama || "—"} · {res.tanggal_reservasi}
                        </option>
                      ))}
                    </Sel>
                  </Field>
                )}
              </>
            )}
            <Field label="Tanggal Periksa" req>
              <Inp type="date" value={form.tanggal_periksa || ""} onChange={s("tanggal_periksa")} required />
            </Field>
            <Field label="Diagnosis" req>
              <Txta value={form.diagnosis || ""} onChange={s("diagnosis")} required
                placeholder="Contoh: Infeksi Saluran Pernapasan Atas (ISPA)"
                style={{ minHeight: 80 }} />
            </Field>
            <Field label="Resep Obat" req>
              <Txta value={form.resep_obat || ""} onChange={s("resep_obat")} required
                placeholder="Contoh: Paracetamol 500mg 3x1, Vitamin C 1x1"
                style={{ minHeight: 80 }} />
            </Field>
            <Field label="Catatan Dokter">
              <Txta value={form.catatan_dokter || ""} onChange={s("catatan_dokter")}
                placeholder="Catatan atau saran tambahan untuk pasien (opsional)"
                style={{ minHeight: 64 }} />
            </Field>
          </form>
        </SlidePanel>
      )}
    </div>
  );
}