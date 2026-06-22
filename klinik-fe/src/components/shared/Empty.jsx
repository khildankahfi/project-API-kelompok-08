import React from 'react';

export default function Empty({ icon = "📋", title, sub }) {
  return (
    <div className="empty">
      <div className="empty-ic">{icon}</div>
      <div className="empty-t">{title}</div>
      {sub && <div className="empty-s">{sub}</div>}
    </div>
  );
}
