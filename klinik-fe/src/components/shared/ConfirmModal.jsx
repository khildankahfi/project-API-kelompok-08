import React from 'react';
import Modal from './Modal';

export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div style={{ marginBottom: 24, fontSize: 14, color: 'var(--text-2)' }}>{message}</div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Batal</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Memproses..." : "Ya, Lanjutkan"}
        </button>
      </div>
    </Modal>
  );
}
