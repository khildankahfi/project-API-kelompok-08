import React, { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import { Sel } from './Field';

export default function ResponsiveSelect(props) {
  const [isApp, setIsApp] = useState(window.matchMedia('(display-mode: standalone)').matches);
  
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = e => setIsApp(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (isApp) {
    return <CustomSelect {...props} />;
  }

  return (
    <Sel value={props.value} onChange={props.onChange} required={props.required} disabled={props.disabled}>
      <option value="">{props.placeholder}</option>
      {props.options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </Sel>
  );
}
