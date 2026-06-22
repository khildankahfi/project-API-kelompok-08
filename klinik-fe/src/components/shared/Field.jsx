import React from 'react';

export function Field({ label, req, children }) {
  return (
    <div className="fld">
      <label className="lbl">{label}{req && <span> *</span>}</label>
      {children}
    </div>
  );
}

export function Inp(p) { return <input className="inp" {...p} />; }
export function Sel({ children, ...p }) { return <select className="inp" {...p}>{children}</select>; }
export function Txta(p) { return <textarea className="inp" {...p} />; }
