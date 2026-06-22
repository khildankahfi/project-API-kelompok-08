import React from 'react';

export default function SlidePanel({ title, sub, onClose, children, footer }) {
  return (
    <>
      <div className="slide-bg" onClick={onClose} />
      <div className="slide-panel">
        <div className="slide-head">
          <div className="slide-title-wrap">
            <div className="slide-title">{title}</div>
            {sub && <div className="slide-sub">{sub}</div>}
          </div>
          <button className="slide-x" onClick={onClose}>×</button>
        </div>
        <div className="slide-body">{children}</div>
        {footer && <div className="slide-footer">{footer}</div>}
      </div>
    </>
  );
}
