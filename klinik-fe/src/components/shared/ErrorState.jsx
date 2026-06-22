import React from 'react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-ic">⚠️</div>
      <div className="error-msg">Gagal Memuat Data</div>
      <div className="error-sub">{message || "Terjadi kesalahan saat mengambil data."}</div>
      {onRetry && <button className="btn btn-outline" onClick={onRetry}>🔄 Coba Lagi</button>}
    </div>
  );
}
