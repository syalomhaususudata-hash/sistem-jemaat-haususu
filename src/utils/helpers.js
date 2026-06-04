// src/utils/helpers.js

import { NAMA_BULAN } from './constants';

export const pad0 = n => {
  if (n === undefined || n === null || n === '') return '';
  const s = String(n).trim();
  return s.length === 1 ? '0' + s : s;
};

export const safeStr = v => (v === null || v === undefined) ? '-' : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? '' : String(v);
export const isL = jk => String(jk||'').toLowerCase().startsWith('l');
export const isP = jk => String(jk||'').toLowerCase().startsWith('p');

export const toInputDate = d => {
  if (!d || typeof d !== 'string') return '';
  if (d.includes('/')) return d.split('/').reverse().map(pad0).join('-');
  return d;
};

export const toDisplayDate = d => (d && typeof d==='string' && d.includes('-')) ? `${d.split('-')[2]}-${d.split('-')[1]}-${d.split('-')[0]}` : (d||'-');

export function calculateAge(dob) {
  if (!dob || typeof dob !== 'string') return 0;
  let bd;
  if (dob.includes('-')) { const p = dob.split('-'); bd = new Date(p[0], p[1]-1, p[2]); } 
  else if (dob.includes('/')) { const p = dob.split('/'); bd = new Date(p[2], p[1]-1, p[0]); }
  else return 0;
  if (isNaN(bd.getTime())) return 0;
  const td = new Date(); let age = td.getFullYear() - bd.getFullYear();
  if (td.getMonth() < bd.getMonth() || (td.getMonth() === bd.getMonth() && td.getDate() < bd.getDate())) age--;
  return Math.max(0, age);
}

export function parseCSV(str) {
  str = String(str).replace(/^\uFEFF/, ''); 
  const res = [];
  let row = [], cell = '', inQ = false;
  const delim = (str.split('\n')[0].split(';').length > str.split('\n')[0].split(',').length) ? ';' : ',';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '"') { if (i+1 < str.length && str[i+1] === '"') { cell += '"'; i++; } else inQ = !inQ; } 
    else if (c === delim && !inQ) { row.push(cell.trim()); cell = ''; } 
    else if ((c === '\n' || c === '\r') && !inQ) { if (c === '\r' && str[i+1] === '\n') i++; row.push(cell.trim()); cell = ''; if (row.some(x => x !== '')) res.push(row); row = []; } 
    else cell += c;
  }
  if (cell || row.length) { row.push(cell.trim()); res.push(row); }
  return res;
}

export const getMonthFromDate = d => {
  if (!d || typeof d !== 'string') return null;
  try {
     if (d.includes('-')) return parseInt(d.split('-')[1], 10);
     if (d.includes('/')) return parseInt(d.split('/')[1], 10);
  } catch(e) {}
  return null;
};

export const getFormatDate = () => { const d = new Date(); return `${pad0(d.getDate())} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`; };

export const isMatchKat = (d, kat) => {
  if (kat === 'Semua Kategori') return true;
  const a = calculateAge(d.tanggalLahir); const l = isL(d.jk); const p = isP(d.jk);
  switch(kat) {
    case "Lansia Laki-laki (>= 60 tahun)": return l && a >= 60;
    case "Lansia Perempuan (>= 60 tahun)": return p && a >= 60;
    case "Bapak GMIT (35-59 tahun)": return l && a >= 35 && a <= 59;
    case "Perempuan GMIT (35-59 tahun)": return p && a >= 35 && a <= 59;
    case "Pemuda Laki-laki (17-34 tahun)": return l && a >= 17 && a <= 34;
    case "Pemuda Perempuan (17-34 tahun)": return p && a >= 17 && a <= 34;
    case "Teruna Laki-laki (15-16 tahun)": return l && a >= 15 && a <= 16;
    case "Teruna Perempuan (15-16 tahun)": return p && a >= 15 && a <= 16;
    case "Remaja Laki-laki (12-14 tahun)": return l && a >= 12 && a <= 14;
    case "Remaja Perempuan (12-14 tahun)": return p && a >= 12 && a <= 14;
    case "Anak-anak Laki-laki (5-11 tahun)": return l && a >= 5 && a <= 11;
    case "Anak-anak Perempuan (5-11 tahun)": return p && a >= 5 && a <= 11;
    case "Balita Laki-laki (0-4 tahun)": return l && a >= 0 && a <= 4;
    case "Balita Perempuan (0-4 tahun)": return p && a >= 0 && a <= 4;
    default: return true;
  }
};