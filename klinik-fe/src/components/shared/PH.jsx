import React from 'react';

export default function PH({ title, sub, action }) {
  return (
    <div className="ph">
      <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
      {action && <div>{action}</div>}
    </div>
  );
}
