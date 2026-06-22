import React, { useState } from 'react';
import Modal from './Modal';
import { Sel } from './Field';

export default function CustomSelect({ value, onChange, options, placeholder, disabled, icon, renderOption }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => String(o.value) === String(value));

  return (
    <>
      <div 
        onClick={() => !disabled && setOpen(true)}
        style={{
          padding: "11px 15px", border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)",
          background: disabled ? "var(--surface-2)" : "var(--surface)", cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          opacity: disabled ? 0.7 : 1, transition: "all var(--tr)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
          <span style={{ color: selected ? "var(--text-1)" : "var(--text-3)", fontSize: 14, fontWeight: selected ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <span style={{ color: "var(--text-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", fontSize: 12 }}>▼</span>
      </div>

      {open && (
        <Modal title={placeholder} onClose={() => setOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange({ target: { value: opt.value } }); setOpen(false); }}
                style={{
                  padding: "14px 16px", border: `1.5px solid ${String(value) === String(opt.value) ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--r-md)", background: String(value) === String(opt.value) ? "var(--primary-light)" : "var(--surface)",
                  cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {renderOption ? renderOption(opt, String(value) === String(opt.value)) : (
                  <div style={{ fontWeight: String(value) === String(opt.value) ? 700 : 500, color: String(value) === String(opt.value) ? "var(--primary-dark)" : "var(--text-1)" }}>
                    {opt.label}
                  </div>
                )}
              </div>
            ))}
            {options.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "var(--text-3)" }}>Tidak ada pilihan tersedia</div>}
          </div>
        </Modal>
      )}
    </>
  );
}
