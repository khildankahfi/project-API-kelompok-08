import React from 'react';

export default function Badge({ label }) {
  const m = {
    menunggu: "b-menunggu", pending: "b-menunggu",
    dikonfirmasi: "b-dikonfirmasi",
    selesai: "b-selesai", dibatalkan: "b-dibatalkan",
    admin: "b-admin", pasien: "b-pasien",
    aktif: "b-aktif", nonaktif: "b-nonaktif",
  };
  const display = { pending: "Menunggu", menunggu: "Menunggu", dikonfirmasi: "Dikonfirmasi", selesai: "Selesai", dibatalkan: "Dibatalkan", aktif: "Aktif", nonaktif: "Nonaktif", admin: "Admin", pasien: "Pasien" }[String(label)] || label;
  return <span className={`badge ${m[String(label)] || "b-nonaktif"}`}>{display}</span>;
}
