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

export default function DokterMgmt({ call }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await call("/dokters");
      setData(r.data);
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
        ? await call("/dokters", { method: "POST", body: JSON.stringify(form) }, true)
        : await call(`/dokters/${form.id}`, { method: "PUT", body: JSON.stringify(form) }, true);
      await load(); setModal(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm("Hapus dokter ini? Data jadwal terkait juga akan terhapus.")) return;
    try { await call(`/dokters/${id}`, { method: "DELETE" }, true); await load(); }
    catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div className="fade-up">
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>Manajemen Dokter</h2>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Total {data.length} dokter terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ nama: "", spesialisasi: "", no_str: "", biaya_konsultasi: "", bio: "" }); setModal("add"); }}>
          ➕ Tambah Dokter
        </button>
      </div>
      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : <Table
          cols={[
            { key: "nama", label: "Nama Dokter" },
            { key: "spesialisasi", label: "Spesialisasi" },
            { key: "no_str", label: "No. STR" },
            { key: "biaya_konsultasi", label: "Biaya", render: v => `Rp ${Number(v).toLocaleString("id-ID")}` },
          ]}
          data={data}
          actions={row => <>
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({ ...row }); setModal("edit"); }}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(row.id)}>Hapus</button>
          </>}
        />}
      </div>
      {modal && (
        <SlidePanel
          title={modal === "add" ? "Tambah Dokter" : "Edit Dokter"}
          sub={modal === "add" ? "Isi data dokter baru" : `Edit data ${form.nama || ""}`}
          onClose={() => setModal(null)}
          footer={<>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button form="form-dokter" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan..." : modal === "add" ? "➕ Tambah Dokter" : "💾 Simpan Perubahan"}
            </button>
          </>}
        >
          <form id="form-dokter" onSubmit={save}>
            <div className="grid-2">
              <Field label="Nama Lengkap Dokter" req>
                <Inp value={form.nama || ""} onChange={s("nama")} placeholder="dr. Nama, Sp.XX" required />
              </Field>
              <Field label="Spesialisasi" req>
                <Inp value={form.spesialisasi || ""} onChange={s("spesialisasi")} placeholder="Penyakit Dalam" required />
              </Field>
            </div>
            <div className="grid-2">
              <Field label="No. STR" req>
                <Inp value={form.no_str || ""} onChange={s("no_str")} placeholder="STR-2024-XXX" required />
              </Field>
              <Field label="Biaya Konsultasi (Rp)" req>
                <Inp type="number" value={form.biaya_konsultasi || ""} onChange={s("biaya_konsultasi")} placeholder="150000" required min={0} />
              </Field>
            </div>
            <Field label="Bio / Deskripsi">
              <Txta value={form.bio || ""} onChange={s("bio")}
                placeholder="Pengalaman, keahlian, dan informasi singkat tentang dokter..."
                style={{ minHeight: 100 }} />
            </Field>
          </form>
        </SlidePanel>
      )}
    </div>
  );
}