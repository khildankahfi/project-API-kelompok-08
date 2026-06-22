const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');

function extractFunc(name, filename) {
    const startRegex = new RegExp(`function ${name}\\s*\\(.*?\\)\\s*\\{`);
    const match = startRegex.exec(code);
    if (!match) return console.log('Not found:', name);
    
    let startIdx = match.index;
    let braceCount = 0;
    let endIdx = -1;
    let inString = false;
    let stringChar = '';
    
    for (let i = startIdx; i < code.length; i++) {
        const char = code[i];
        
        if (!inString) {
            if (char === "'" || char === '"' || char === '`') {
                inString = true;
                stringChar = char;
            } else if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0 && i > startIdx + match[0].length - 1) {
                    endIdx = i + 1;
                    break;
                }
            }
        } else {
            if (char === '\\') {
                i++; 
            } else if (char === stringChar) {
                inString = false;
            }
        }
    }
    
    if (endIdx !== -1) {
        let imports = `import React, { useState, useEffect } from 'react';
import Badge from '../shared/Badge';
import Modal from '../shared/Modal';
import SlidePanel from '../shared/SlidePanel';
import { Field, Inp, Sel, Txta } from '../shared/Field';
import Table from '../shared/Table';
import Loading from '../shared/Loading';
import Empty from '../shared/Empty';
import ErrorState from '../shared/ErrorState';
import CustomSelect from '../shared/CustomSelect';
import { ResponsiveSelect, PH } from '../../App.jsx'; // will fix later
`;
        fs.writeFileSync(filename, imports + "\nexport default " + code.substring(startIdx, endIdx));
        console.log('Extracted:', name);
    } else {
        console.log('Failed to parse:', name);
    }
}

['AdminHome', 'DokterMgmt', 'JadwalMgmt', 'AdminReservasi', 'RekamMedisMgmt'].forEach(name => extractFunc(name, `src/components/admin/${name}.jsx`));
['PatientShell', 'PasienHome', 'DokterList', 'ReservasiForm', 'MyReservasi', 'MyRekamMedis', 'ProfilePage'].forEach(name => extractFunc(name, `src/components/pasien/${name}.jsx`));
