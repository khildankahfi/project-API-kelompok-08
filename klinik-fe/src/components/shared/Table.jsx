import React from 'react';
import Empty from './Empty';

export default function Table({ cols, data, actions }) {
  if (!data?.length) return <Empty title="Belum ada data" sub="Data akan tampil di sini" />;
  return (
    <div className="tbl-wrap">
      <table>
        <thead><tr>
          {cols.map(c => <th key={c.key}>{c.label}</th>)}
          {actions && <th style={{ textAlign: "right" }}>Aksi</th>}
        </tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {cols.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}</td>)}
              {actions && <td><div className="acts">{actions(row)}</div></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
