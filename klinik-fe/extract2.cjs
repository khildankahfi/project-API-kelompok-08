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
import PatientShell from './pasien/PatientShell';
import PasienHome from './pasien/PasienHome';
import DokterList from './pasien/DokterList';
import ReservasiForm from './pasien/ReservasiForm';
import MyReservasi from './pasien/MyReservasi';
import MyRekamMedis from './pasien/MyRekamMedis';
import ProfilePage from './pasien/ProfilePage';
import AdminHome from './admin/AdminHome';
import DokterMgmt from './admin/DokterMgmt';
import JadwalMgmt from './admin/JadwalMgmt';
import AdminReservasi from './admin/AdminReservasi';
import RekamMedisMgmt from './admin/RekamMedisMgmt';
`;
        fs.writeFileSync(filename, imports + "\nexport default " + code.substring(startIdx, endIdx));
        console.log('Extracted:', name);
    } else {
        console.log('Failed to parse:', name);
    }
}

extractFunc('Dashboard', 'src/Dashboard.jsx');
