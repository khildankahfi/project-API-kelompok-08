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

export default function JadwalMgmt({ call }) {
  const [data, setData] = useState([]);
  const [dokters, setDokters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [j, d] = await Promise.all([call("/jadwals"), call("/dokters")]);
      setData(j.data); setDokters(d.data);
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
        ? await call("/jadwals", { method: "POST", body: JSON.stringify(form) }, true)
        : await call(`/jadwals/${form.id}`, { method: "PUT", body: JSON.stringify(form) }, true);
      await load(); setModal(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm("Hapus jadwal ini?")) return;
    try { await call(`/jadwals/${id}`, { method: "DELETE" }, true); await load(); }
    catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>Manajemen Jadwal</h2>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>Total {data.length} jadwal praktik aktif dan nonaktif</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ dokter_id: "", hari: "Senin", jam_mulai: "08:00", jam_selesai: "12:00", kuota: 10, is_aktif: 1 }); setModal("add"); }}>
          ➕ Tambah Jadwal
        </button>
      </div>
      <div className="card">
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : <Table
          cols={[
            { key: "dokter", label: "Dokter", render: v => v?.nama || "—" },
            { key: "hari", label: "Hari" },
            { key: "jam_mulai", label: "Mulai" },
            { key: "jam_selesai", label: "Selesai" },
            { key: "kuota", label: "Kuota", render: v => `${v} pasien` },
            { key: "is_aktif", label: "Status", render: v => <Badge label={v ? "aktif" : "nonaktif"} /> },
          ]}
          data={data}
          actions={row => <>
            <button className="btn btn-outline btn-sm" onClick={() => { setForm({ ...row, dokter_id: row.dokter_id || row.dokter?.id }); setModal("edit"); }}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(row.id)}>Hapus</button>
          </>}
        />}
      </div>
      {modal && (
        <SlidePanel
          title={modal === "add" ? "Tambah Jadwal" : "Edit Jadwal"}
          sub={modal === "add" ? "Atur jadwal praktik dokter" : "Ubah jadwal praktik"}
          onClose={() => setModal(null)}
          footer={<>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button form="form-jadwal" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Menyimpan..." : modal === "add" ? "➕ Tambah Jadwal" : "💾 Simpan Perubahan"}
            </button>
          </>}
        >
          <form id="form-jadwal" onSubmit={save}>
            <Field label="Dokter" req>
              <Sel value={form.dokter_id || ""} onChange={s("dokter_id")} required>
                <option value="">Pilih dokter...</option>
                {dokters.map(d => <option key={d.id} value={d.id}>{d.nama} — {d.spesialisasi}</option>)}
              </Sel>
            </Field>
            <div className="grid-2">
              <Field label="Hari" req>
                <Sel value={form.hari || "Senin"} onChange={s("hari")}>
                  {HARI.map(h => <option key={h}>{h}</option>)}
                </Sel>
              </Field>
              <Field label="Status">
                <Sel value={form.is_aktif} onChange={e => setForm(p => ({ ...p, is_aktif: Number(e.target.value) }))}>
                  <option value={1}>Aktif</option><option value={0}>Nonaktif</option>
                </Sel>
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Jam Mulai" req><Inp type="time" value={form.jam_mulai || ""} onChange={s("jam_mulai")} required /></Field>
              <Field label="Jam Selesai" req><Inp type="time" value={form.jam_selesai || ""} onChange={s("jam_selesai")} required /></Field>
            </div>
            <Field label="Kuota Pasien / Hari" req>
              <Inp type="number" value={form.kuota || ""} onChange={s("kuota")} required min={1} placeholder="10" />
            </Field>
          </form>
        </SlidePanel>
      )}
    </div>
  );
}