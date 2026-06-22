const fs = require('fs');
const code = fs.readFileSync('src/App.jsx', 'utf8');
const cssStart = code.indexOf('const GLOBAL_CSS = `') + 20;
const cssEnd = code.indexOf('`;', cssStart);
fs.writeFileSync('src/styles/global.css', code.substring(cssStart, cssEnd).trim());
console.log('CSS extracted');
