import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, RefreshCw, Users, Home, UserCheck, BarChart3, ChevronLeft, ChevronRight, LogOut, Edit, Trash2, Plus, X, Upload, Lock, Filter, Printer, Download, Gift, ArrowLeft, History, FileUp, ArrowUpDown, ChevronUp, ChevronDown, Settings, Camera, Eye } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, setDoc, getDocs } from 'firebase/firestore';

// --- FIREBASE INIT ---
const inCanvas = typeof __firebase_config !== 'undefined' && __firebase_config;
const firebaseConfig = inCanvas ?
JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyCvRx0pr7bhrmUUjUk2u3vB6QhHd_c6Fhc",
  authDomain: "data-jemaat-syalom.firebaseapp.com",
  projectId: "data-jemaat-syalom",
  storageBucket: "data-jemaat-syalom.firebasestorage.app",
  messagingSenderId: "14205807426",
  appId: "1:14205807426:web:9f10250e15926b4e97b6db"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ?
__app_id : 'sistem-jemaat-app';

const getDBCollection = (colName) => {
   if (inCanvas) return collection(db, 'artifacts', appId, 'public', 'data', colName);
   return collection(db, colName);
};

const getDBDoc = (colName, docId) => {
   if (inCanvas) return doc(db, 'artifacts', appId, 'public', 'data', colName, docId);
   return doc(db, colName, docId);
};

// --- CONSTANTS ---
const DEFAULT_PENATUA = { '1': "Penatua Felipus Sanam", '2': "Penatua Antonio Lana’in", '3': "Penatua Tomas Tefa", '4': "Penatua Yosina Tefa", '5': "Penatua Agrida Banunaek", '6': "Penatua Aris Misa" };
const DEFAULT_CHURCH_PROFILE = { 
  sinode: "GEREJA MASEHI INJILI DI TIMOR (GMIT)", 
  klasis: "", 
  jemaat: "NAMA GEREJA", 
  mataJemaat: "", 
  alamat: "Alamat Gereja",
  namaSekretaris: "Nama Sekretaris" // <--- TAMBAHKAN INI
};
const PEKERJAAN_LIST = ["Tidak/Belum bekerja", "Ibu Rumah Tangga", "Pelajar", "Mahasiswa", "Pensiunan", "PNS", "TNI", "POLRI", "Tenaga Kontrak/Honorer", "Karyawan Swasta", "Pembantu Rumah Tangga", "Buruh/Serabutan", "Petani", "Peternak", "Nelayan", "Pedagang", "Pengrajin", "Penjahit", "Tukang Cukur", "Seniman", "Konsultan", "Kontraktor", "Pekerja Migran", "Wiraswasta lainnya", "Guru", "Dosen", "Pendeta", "Dokter", "Bidan/Perawat", "Lainnya"];
const KATEGORI_PELAYANAN = ["Semua Kategori", "Lansia Laki-laki (>= 60 tahun)", "Lansia Perempuan (>= 60 tahun)", "Bapak GMIT (35-59 tahun)", "Perempuan GMIT (35-59 tahun)", "Pemuda Laki-laki (17-34 tahun)", "Pemuda Perempuan (17-34 tahun)", "Teruna Laki-laki (15-16 tahun)", "Teruna Perempuan (15-16 tahun)", "Remaja Laki-laki (12-14 tahun)", "Remaja Perempuan (12-14 tahun)", "Anak-anak Laki-laki (5-11 tahun)", "Anak-anak Perempuan (5-11 tahun)", "Balita Laki-laki (0-4 tahun)", "Balita Perempuan (0-4 tahun)"];
const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const JEMAAT_HEADERS = ["ID KK", "Kepala Keluarga", "No Rayon", "Urutan KK", "Bentuk Rumah", "Status Rumah", "Penatua Rayon", "No Anggota", "ID Jemaat", "Nama Lengkap", "NIK", "Jenis Kelamin", "Golongan Darah", "Tempat Lahir", "Tanggal Lahir", "Usia", "Alamat Domisili", "Suku Ayah", "Suku Ibu", "Status Keluarga", "Baptis", "Gereja Baptis", "Tgl Baptis", "Pendeta Baptis", "Sidi", "Gereja Sidi", "Tgl Sidi", "Pendeta Sidi", "Nikah", "Jenis Nikah", "Gereja Nikah", "Tgl Nikah", "Pendeta Nikah", "Pendidikan", "Pekerjaan", "Penghasilan", "Asuransi Kesehatan", "Jaminan", "Janda/Duda", "Yatim/Piatu", "Disabilitas", "Jenis Disabilitas", "Jabatan di Jemaat", "Jabatan di Masyarakat", "Status Keanggotaan", "Tanggal Kematian", "Tanggal Penguburan", "Asal Jemaat", "Tanggal Masuk", "Pindah Ke Gereja", "Tanggal Pindah"];
const JEMAAT_HEADER_MAP = { "ID KK": "idKk", "Kepala Keluarga": "kepalaKeluarga", "No Rayon": "noRayon", "Urutan KK": "urutanKk", "Bentuk Rumah": "bentukRumah", "Status Rumah": "statusRumah", "Penatua Rayon": "penatua", "No Anggota": "noAnggota", "ID Jemaat": "idJemaat", "Nama Lengkap": "namaLengkap", "NIK": "nik", "Jenis Kelamin": "jk", "Golongan Darah": "goldar", "Tempat Lahir": "tempatLahir", "Tanggal Lahir": "tanggalLahir", "Alamat Domisili": "alamat", "Suku Ayah": "sukuAyah", "Suku Ibu": "sukuIbu", "Status Keluarga": "statusKeluarga", "Baptis": "baptis", "Nama Gereja Baptis": "gerejaBaptis", "Tanggal Baptis": "tanggalBaptis", "Pendeta yang Baptis": "pendetaBaptis", "Sudah Sidi": "sidi", "Nama Gereja Sidi": "gerejaSidi", "Tanggal Sidi": "tanggalSidi", "Pendeta yang Sidi": "pendetaSidi", "Sudah Nikah": "nikah", "Nama Gereja Pemberkatan Nikah": "gerejaNikah", "Tanggal Pemberkatan Nikah": "tanggalNikah", "Pendeta yang Berkat Nikah": "pendetaNikah", "Jenis Nikah": "jenisNikah", "Pendidikan": "pendidikan", "Pekerjaan": "pekerjaan", "Penghasilan": "penghasilan", "Asuransi Kesehatan": "asuransi", "Jaminan": "jaminan", "Janda/Duda": "jandaDuda", "Yatim Piatu": "yatimPiatu", "Yatim/Piatu": "yatimPiatu", "Disabilitas": "disabilitas", "Jenis Disabilitas": "jenisDisabilitas", "Jabatan dalam Jemaat": "jabatanJemaat", "Jabatan di Jemaat": "jabatanJemaat", "Jabatan dalam Masyarakat": "jabatanMasyarakat", "Jabatan di Masyarakat": "jabatanMasyarakat", "Status Keanggotaan": "statusKeanggotaan", "Tanggal Kematian": "tanggalKematian", "Tanggal Penguburan": "tanggalPenguburan", "Asal Jemaat": "asalJemaat", "Tanggal Masuk": "tanggalMasuk", "Pindah Ke Gereja": "pindahKeJemaat", "Tanggal Pindah": "tanggalPindah" };
const MAJELIS_HEADERS = ["Nomor Rayon", "Nama Lengkap", "Nama Panggilan", "Tempat Lahir", "Tanggal Lahir", "Jenis Kelamin", "Status Menikah", "Pekerjaan", "Jabatan di Masyarakat", "Jabatan Pelayanan", "Jumlah Saudara", "Anak Ke", "Golongan Darah", "Gereja Baptis", "Tanggal Baptis", "Gereja Sidi", "Tanggal Sidi", "Gereja Nikah", "Tanggal Nikah", "Nama Ayah", "Nama Ibu", "Nama Suami/Istri", "Tempat Lahir Pasangan", "Tanggal Lahir Pasangan", "Pekerjaan Pasangan", "Gereja Baptis Pasangan", "Tanggal Baptis Pasangan", "Gereja Sidi Pasangan", "Tanggal Sidi Pasangan", "Nama SD", "Tahun Tamat SD", "Nama SMP", "Tahun Tamat SMP", "Nama SMA", "Tahun Tamat SMA", "Nama PT", "Tahun Lulus PT", "Pernah melayani di Gereja?", "Jabatan Lama", "Periode Pelayanan"];
const MAJELIS_HEADER_MAP = { 
  "Nomor Rayon": "noRayon", 
  "Nama Lengkap": "namaLengkap", 
  "Nama Panggilan": "namaPanggilan", 
  "Tempat Lahir": "tempatLahir", 
  "Tanggal Lahir": "tanggalLahir", 
  "Jenis Kelamin": "jk", 
  "Status Menikah": "statusMenikah", 
  "Pekerjaan": "pekerjaan", 
  "Jabatan di Masyarakat": "jabatanMasyarakat", 
  "Jabatan Pelayanan": "jabatanPelayanan", 
  "Jumlah Saudara": "jumlahSaudara", 
  "Anak Ke": "anakKe", 
  "Golongan Darah": "goldar", 
  "Gereja Baptis": "gerejaBaptis", 
  "Tanggal Baptis": "tanggalBaptis", 
  "Gereja Sidi": "gerejaSidi", 
  "Tanggal Sidi": "tanggalSidi", 
  "Gereja Nikah": "gerejaNikah", 
  "Tanggal Nikah": "tanggalNikah", 
  "Nama Ayah": "namaAyah", 
  "Nama Ibu": "namaIbu", 
  "Nama Suami/Istri": "namaPasangan", 
  "Tempat Lahir Pasangan": "tempatLahirPasangan", 
  "Tanggal Lahir Pasangan": "tanggalLahirPasangan", 
  "Pekerjaan Pasangan": "pekerjaanPasangan", 
  "Gereja Baptis Pasangan": "gerejaBaptisPasangan", 
  "Tanggal Baptis Pasangan": "tanggalBaptisPasangan", 
  "Gereja Sidi Pasangan": "gerejaSidiPasangan", 
  "Tanggal Sidi Pasangan": "tanggalSidiPasangan", 
  "Nama SD": "namaSD", 
  "Tahun Tamat SD": "tahunSD", 
  "Nama SMP": "namaSMP", 
  "Tahun Tamat SMP": "tahunSMA", 
  "Nama SMA": "namaSMA", 
  "Tahun Tamat SMA": "tahunSMA", 
  "Nama PT": "namaPT", 
  "Tahun Lulus PT": "tahunPT", 
  "Pernah melayani di Gereja?": "pernahMelayani", 
  "Jabatan Lama": "jabatanLama", // <--- PERBAIKAN DI SINI
  "Periode Pelayanan": "periodePelayanan" 
};
const FORM_MAJELIS = [
  {t: 'Profil Dasar', f: [
    {l:'Nomor Rayon', k:'noRayon', t:'sel', opts:['1','2','3','4','5','6','7','8','9','10']}, {l:'Nama Lengkap', k:'namaLengkap', req:true}, {l:'Nama Panggilan', k:'namaPanggilan'}, {l:'Tempat Lahir', k:'tempatLahir'}, {l:'Tanggal Lahir', k:'tanggalLahir', t:'date'}, {l:'Jenis Kelamin', k:'jk', t:'sel', opts:['Laki-laki', 'Perempuan']},
    {l:'Status Menikah', k:'statusMenikah', t:'chk', span:2, opts:['Menikah/Nikah Adat', 'Menikah/Nikah Masehi', 'Menikah/BS/Catatan Sipil']}, {l:'Pekerjaan', k:'pekerjaan', t:'sel', opts:PEKERJAAN_LIST}, {l:'Jabatan Masy', k:'jabatanMasyarakat'}, {l:'Jabatan Pelayanan', k:'jabatanPelayanan', t:'sel', opts:['Penatua', 'Diaken', 'Pengajar', 'Koster']}, {l:'Jumlah Sdr', k:'jumlahSaudara', t:'num'}, {l:'Anak Ke-', k:'anakKe', t:'num'}, {l:'Gol Darah', k:'goldar', t:'sel', opts:['A', 'B', 'AB', 'O', 'Tidak Tahu']}
  ]},
  {t: 'Riwayat Agama', f: [
    {l:'Gereja Baptis', k:'gerejaBaptis'}, {l:'Tgl Baptis', k:'tanggalBaptis', t:'date'}, {l:'Gereja Sidi', k:'gerejaSidi'}, {l:'Tgl Sidi', k:'tanggalSidi', t:'date'}, {l:'Gereja Nikah', k:'gerejaNikah'}, {l:'Tgl Nikah', k:'tanggalNikah', t:'date'}
  ]},
  {t: 'Data Pasangan & Orang Tua', f: [
    {l:'Nama Ayah', k:'namaAyah'}, {l:'Nama Ibu', k:'namaIbu'}, {l:'Nama Suami/Istri', k:'namaPasangan'}, {l:'Tempat Lahir Pasangan', k:'tempatLahir Pasangan'}, {l:'Tgl Lahir Pasangan', k:'tanggalLahirPasangan', t:'date'}, {l:'Pekerjaan Pasangan', k:'pekerjaanPasangan', t:'sel', opts:PEKERJAAN_LIST},
    {l:'Gereja Baptis Pasangan', k:'gerejaBaptisPasangan'}, {l:'Tgl Baptis Pasangan', k:'tanggalBaptis Pasangan', t:'date'}, {l:'Gereja Sidi Pasangan', k:'gerejaSidiPasangan'}, {l:'Tgl Sidi Pasangan', k:'tanggalSidiPasangan', t:'date'}
  ]},
  {t: 'Pendidikan & Pelayanan', f: [
    {l:'Nama SD', k:'namaSD'}, {l:'Tahun SD', k:'tahunSD', t:'num'}, {l:'Nama SMP', k:'namaSMP'}, {l:'Tahun SMP', k:'tahunSMP', t:'num'}, {l:'Nama SMA', k:'namaSMA'}, {l:'Tahun SMA', k:'tahunSMA', t:'num'}, {l:'Nama PT', k:'namaPT'}, {l:'Tahun PT', k:'tahunPT', t:'num'},
    {l:'Pernah melayani?', k:'pernahMelayani'}, {l:'Jabatan Lama', k:'jabatanLama'}, {l:'Periode Pelayanan', k:'periodePelayanan'}
  ]}
];
const JEMAAT_FIELDS_PRIBADI = [
  { name: 'noAnggota', label: 'No Anggota Keluarga Ke-', type: 'select', req: true, opts: [] },
  { name: 'namaLengkap', label: 'Nama Lengkap', req: true }, { name: 'nik', label: 'NIK' }, { name: 'jk', label: 'Jenis Kelamin', type: 'select', opts: ['Laki-laki', 'Perempuan'] },
  { name: 'goldar', label: 'Golongan Darah', type: 'select', opts: ['A', 'B', 'AB', 'O', 'Tidak Tahu'] }, { name: 'tempatLahir', label: 'Tempat Lahir' }, { name: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date' },
  { name: 'alamat', label: 'Alamat Domisili Lengkap', span: 2 }, { name: 'sukuAyah', label: 'Suku Ayah' }, { name: 'sukuIbu', label: 'Suku Ibu' },
  { name: 'statusKeluarga', label: 'Status Dalam Keluarga', type: 'select', span: 2, opts: ['Kepala Keluarga', 'Istri', 'Anak kandung', 'Anak Angkat/asuh', 'Orangtua/Mertua', 'Kakek/Nenek', 'Saudara/Adik/Kakak', 'Cucu', 'Keponakan', 'Menantu', 'Famili/ipar', 'Lain-lain/Kost/Karyawan/Pembantu'] }
];
const JEMAAT_EDU = [
  { name: 'pendidikan', label: 'Pendidikan', type: 'select', opts: ['Tidak/Belum Sekolah', 'Tidak Tamat SD', 'SD', 'SMP/sederajat', 'SMA/sederajat', 'D I', 'D II', 'D III', 'D IV', 'S1', 'S2', 'S3'] },
  { name: 'pekerjaan', label: 'Pekerjaan', type: 'select', opts: PEKERJAAN_LIST }, { name: 'penghasilan', label: 'Penghasilan', type: 'select', opts: ['Tidak/belum ada penghasilan', 'dibawah Rp. 1 juta', 'Rp. 1 juta s/d Rp. 2.5 juta', 'Rp. 2.5 juta s/d Rp. 5 juta', 'diatas Rp. 5 juta'] }
];

// --- UTILS ---
const pad0 = n => {
   if (n === undefined || n === null || n === '') return '';
   const s = String(n).trim();
   return s.length === 1 ? '0' + s : s;
};
const safeStr = v => (v === null || v === undefined) ? '-' : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? '' : String(v);
const isL = jk => String(jk||'').toLowerCase().startsWith('l');
const isP = jk => String(jk||'').toLowerCase().startsWith('p');
const toInputDate = d => {
   if (!d || typeof d !== 'string') return '';
   if (d.includes('/')) return d.split('/').reverse().map(pad0).join('-');
   return d;
};
const toDisplayDate = d => (d && typeof d==='string' && d.includes('-')) ? `${d.split('-')[2]}-${d.split('-')[1]}-${d.split('-')[0]}` : (d||'-');

function calculateAge(dob) {
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

function parseCSV(str) {
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

const getMonthFromDate = d => {
  if (!d || typeof d !== 'string') return null;
  try {
     if (d.includes('-')) return parseInt(d.split('-')[1], 10);
     if (d.includes('/')) return parseInt(d.split('/')[1], 10);
  } catch(e) {}
  return null;
};

const getFormatDate = () => { const d = new Date(); return `${pad0(d.getDate())} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`; };

const isMatchKat = (d, kat) => {
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

// --- UI COMPONENTS ---
const SortableHeader = ({ label, sortKey, sortConfig, requestSort, className = "" }) => (
  <th className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-200 select-none group transition-colors ${className}`} onClick={() => requestSort(sortKey)}>
    <div className="flex items-center gap-1 w-max">
       <span>{label}</span>
       {sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600"/> : <ChevronDown className="w-4 h-4 text-blue-600"/>) : <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-30 group-hover:opacity-100 transition-opacity"/>}
    </div>
  </th>
);

const StatCard = ({ title, val1, val2, label1, label2, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border-t-4 border-${color}-500 flex flex-col transition-all hover:shadow-md`}>
    <h4 className={`text-${color}-800 font-black mb-4 uppercase tracking-wider text-center border-b border-gray-100 pb-2`}>{title}</h4>
    <div className="flex justify-around items-center mb-4">
      <div className="text-center"><p className={`text-3xl font-black text-${color}-600`}>{val1}</p><p className="text-[10px] text-gray-500 font-bold uppercase">{label1}</p></div>
      {val2 !== undefined && (
         <>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center"><p className={`text-3xl font-black text-${color}-400`}>{val2}</p><p className="text-[10px] text-gray-500 font-bold uppercase">{label2}</p></div>
         </>
      )}
    </div>
  </div>
);

function FormInput({ label, name, value, onChange, type="text", req=false, dis=false, opts=null, span=1, isCheckboxGroup=false, onCheckboxChange }) {
  const cls = `w-full border p-2 rounded bg-white text-sm focus:ring-2 outline-none ${dis ? 'bg-gray-200 opacity-70 cursor-not-allowed' : ''}`;
  if (isCheckboxGroup) {
     return (
       <div className={`md:col-span-${span} bg-white p-3 rounded border`}>
         <label className="text-sm font-bold text-gray-800 mb-2 block">{label}</label>
         <div className="flex flex-wrap gap-4 mt-2">
           {(opts||[]).map(o => {
             const cArr = Array.isArray(value) ? value : []; const isCh = cArr.includes(o);
             return (
               <label key={o} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${dis?'opacity-50 pointer-events-none':'hover:bg-blue-50'} ${isCh?'bg-blue-100 border-blue-400 font-semibold':'bg-gray-50'}`}>
                 <input type="checkbox" className="w-4 h-4" checked={isCh} disabled={dis} onChange={(e) => onCheckboxChange(name, o, e.target.checked, cArr)} /> {o}
               </label>
             );
           })}
         </div>
       </div>
     );
  }
  return (
    <div className={`md:col-span-${span}`}>
      <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
      {opts ? (
         <select name={name} value={value||''} onChange={onChange} disabled={dis} className={cls} required={req}>
            <option value="">-Pilih-</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}
         </select>
      ) : (
         <input type={type} name={name} value={type==='date'?toInputDate(value):value||''} onChange={onChange} disabled={dis} className={cls} required={req} maxLength={name==='nik'?16:undefined} placeholder={label}/>
      )}
    </div>
  );
}

function InfografisTab({ data, filterRayon, type }) {
  const dAktif = data.filter(d => (type === 'majelis' || (d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah' && d.statusHidup !== 'Meninggal')) && (filterRayon === 'Semua' || String(d.noRayon) === filterRayon));
  if (type === 'majelis') {
     const countStats = (jabatan) => {
        const d = dAktif.filter(x => String(x.jabatanPelayanan).toLowerCase() === jabatan.toLowerCase());
        const l = d.filter(x => isL(x.jk)).length; const p = d.filter(x => isP(x.jk)).length;
        return { l, p, t: l + p };
     };
     const sPen = countStats('Penatua'); const sDia = countStats('Diaken');
     const sPeng = countStats('Pengajar');
     return (
        <div className="p-4 animate-in fade-in duration-300">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard title="Data Penatua" val1={sPen.l} val2={sPen.p} label1="Laki-laki" label2="Perempuan" color="purple" />
              <StatCard title="Data Diaken" val1={sDia.l} val2={sDia.p} label1="Laki-laki" label2="Perempuan" color="indigo" />
              <StatCard title="Data Pengajar" val1={sPeng.l} val2={sPeng.p} label1="Laki-laki" label2="Perempuan" color="teal" />
           </div>
        </div>
     );
  }

  const totL = dAktif.filter(d=>isL(d.jk)).length; const totP = dAktif.filter(d=>isP(d.jk)).length;
  const bapL = dAktif.filter(d=>d.baptis==='Ya'&&isL(d.jk)).length; const bapP = dAktif.filter(d=>d.baptis==='Ya'&&isP(d.jk)).length;
  const sidiL = dAktif.filter(d=>d.sidi==='Ya'&&isL(d.jk)).length; const sidiP = dAktif.filter(d=>d.sidi==='Ya'&&isP(d.jk)).length;

  // --- ARSITEKTUR ATURAN LOGIKA PASANGAN NIKAH BARU ---
  let nkA = 0, nkG = 0, nkS = 0;
  const groupedByKk = dAktif.reduce((acc, obj) => {
      const key = obj.idKk;
      if (key) {
          if (!acc[key]) acc[key] = [];
          acc[key].push(obj);
      }
      return acc;
  }, {});

  Object.values(groupedByKk).forEach(anggotaKk => {
      const kk = anggotaKk.find(a => a.statusKeluarga === 'Kepala Keluarga');
      const istri = anggotaKk.find(a => a.statusKeluarga === 'Istri');
      if (kk && istri && kk.jandaDuda !== 'Janda' && kk.jandaDuda !== 'Duda') {
          const jenisNikah = Array.isArray(kk.jenisNikah) ? kk.jenisNikah : [];
          if (jenisNikah.includes('Nikah Adat')) nkA++;
          if (jenisNikah.includes('Nikah Gereja/Masehi')) nkG++;
          if (jenisNikah.includes('Nikah Catatan Sipil/BS')) nkS++;
      }
  });

  return (
    <div className="p-4 animate-in fade-in duration-300">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
         <StatCard title="Total Jemaat (Jiwa)" val1={totL+totP} label1="Semua Gender" color="blue" />
         <StatCard title="Rasio Gender" val1={totL} val2={totP} label1="Laki-laki" label2="Perempuan" color="indigo" />
         <StatCard title="Anggota Baptis" val1={bapL} val2={bapP} label1="Laki-laki" label2="Perempuan" color="teal" />
         <StatCard title="Anggota Sidi" val1={sidiL} val2={sidiP} label1="Laki-laki" label2="Perempuan" color="emerald" />
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="text-gray-800 font-black mb-5 border-b pb-2">Statistik Pasangan Menikah</h4>
            <div className="grid grid-cols-3 gap-4">
               <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center"><p className="text-3xl font-black text-orange-600">{nkA}</p><p className="text-xs font-bold text-orange-800 mt-2 uppercase">Adat</p></div>
               <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center"><p className="text-3xl font-black text-rose-600">{nkG}</p><p className="text-xs font-bold text-rose-800 mt-2 uppercase">Gereja/Masehi</p></div>
               <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-center"><p className="text-3xl font-black text-purple-600">{nkS}</p><p className="text-xs font-bold text-purple-800 mt-2 uppercase">Sipil / BS</p></div>
            </div>
         </div>
       </div>
    </div>
  );
}

// --- KOMPONEN BARIS TABEL OPTIMIZED (REACT.MEMO) ---
const BarisTabelJemaat = React.memo(({ row, idx, startIndex, tabCols, activeTab, activeSubTabStatus, appUser, isEditable, onAction }) => {
  const lp = (v) => isL(v)?'L':(isP(v)?'P':'-');
  return (
    <tr className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
       <td className="px-4 py-4 text-center font-bold text-gray-400">{startIndex + idx + 1}</td>
       {tabCols.map((c, j) => <td key={`${row.dbId}-${j}`} className="px-4 py-4">{c.fmt ? c.fmt(row[c.k], row) : safeStr(row[c.k])}</td>)}
       {activeTab !== 'Riwayat Sistem' && (
          <td className="px-4 py-3 text-center flex items-center justify-center gap-1.5 sticky right-0 bg-white/95 backdrop-blur shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.05)] h-full">
             {activeTab === 'Status Jemaat' ? (
                <div className="flex flex-col gap-1 w-full">
                   {['Data Kematian', 'Pindah Jemaat', 'Pindah Masuk Jemaat'].includes(activeSubTabStatus) && (
                      <>
                         <button onClick={() => onAction('view', row)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition flex items-center justify-center gap-1 w-full text-xs font-bold" title="Lihat Detail"><Eye className="w-3 h-3" /> Detail</button>
                         {(appUser?.role === 'admin' && activeSubTabStatus !== 'Pindah Masuk Jemaat') && <button onClick={() => onAction('restore', row)} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition flex items-center justify-center gap-1 w-full text-xs font-bold"><RefreshCw className="w-3 h-3" /> Tarik</button>}
                      </>
                   )}
                </div>
             ) : isEditable ? (
                <>
                   <button onClick={() => onAction('edit', row)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition" title="Edit Data"><Edit className="w-4 h-4" /></button>
                   {appUser?.role === 'admin' && (
                      <button onClick={() => onAction('delete', row)} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition" title="Hapus Data"><Trash2 className="w-4 h-4" /></button>
                   )}
                   {activeTab === 'Data KK' && (
                      <>
                         <button onClick={() => onAction('add_member', row)} className="p-2 ml-1 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white rounded-lg font-black text-xs flex items-center transition"><Plus className="w-4 h-4"/></button>
                         <button onClick={() => onAction('print_kk', row)} className="p-2 ml-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-black text-xs flex items-center transition" title="Cetak"><Printer className="w-4 h-4"/></button>
                      </>
                   )}
                   {activeTab === 'Profil Majelis' && <button onClick={() => onAction('print_majelis', row)} className="p-2 ml-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-black text-xs flex items-center transition" title="Cetak"><Printer className="w-4 h-4"/></button>}
                </>
             ) : (
                appUser?.role === 'jemaat' ? <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-3 py-1.5 rounded-lg select-none">Hanya Lihat</span> :
                (activeTab === 'Data KK' ? <button onClick={() => onAction('print_kk', row)} className="p-1.5 ml-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-black text-xs flex items-center transition"><Printer className="w-3 h-3 inline mr-1"/> Cetak KK</button>
                : activeTab === 'Profil Majelis' ? <button onClick={() => onAction('print_majelis', row)} className="p-1.5 ml-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-black text-xs flex items-center transition"><Printer className="w-3 h-3 inline mr-1"/> Cetak Profil</button>
                : <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-1 rounded">Locked</span>)
             )}
          </td>
       )}
    </tr>
  );
});

function PrintKkTemplate({ kkToPrint, jemaatData, penatuaMap, churchProfile, onBack }) {
  if (!kkToPrint) return null;
  const dataKk = jemaatData.find(d => d.idKk === kkToPrint && d.statusKeluarga === 'Kepala Keluarga');
  const anggotaKk = jemaatData.filter(d => d.idKk === kkToPrint && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah').sort((a,b) => parseInt(a.noAnggota) - parseInt(b.noAnggota));
  if (!dataKk) return null;
  const b = "border border-black p-0.5";
  return (
    <div className="w-full bg-white text-black p-2 text-[9px] leading-tight font-sans mx-auto max-w-full">
       <style type="text/css">{"@page { size: A4 landscape; margin: 10mm; }"}</style>
       <div className="border-b-4 border-double border-black pb-2 mb-2 relative flex justify-center items-center">
          <div className="absolute left-0">
             <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
          </div>
          <div className="text-center w-full">
             <h1 className="text-base font-bold uppercase tracking-wider">{churchProfile.sinode || 'GEREJA MASEHI INJILI DI TIMOR (GMIT)'}</h1>
             {churchProfile.klasis && <h2 className="text-sm font-bold uppercase">KLASIS {churchProfile.klasis}</h2>}
             <h2 className="text-sm font-bold uppercase">JEMAAT {churchProfile.jemaat}</h2>
             {churchProfile.mataJemaat && <h3 className="text-sm font-bold uppercase">MATA JEMAAT {churchProfile.mataJemaat}</h3>}
             <p className="text-xs mt-1">Alamat: {churchProfile.alamat}</p>
          </div>
       </div>
       <h2 className="text-lg font-bold text-center mb-3 uppercase">KARTU KELUARGA JEMAAT</h2>
       <div className="grid grid-cols-3 gap-2 mb-2 text-[9px]">
          <div>
            <div className="flex"><span className="w-32 font-bold">Nama Kepala Keluarga</span><span>: {safeStr(dataKk.kepalaKeluarga)}</span></div>
            <div className="flex"><span className="w-32 font-bold">Nomor HP</span><span>: {safeStr(dataKk.noHp)}</span></div>
            <div className="flex"><span className="w-32 font-bold">Bentuk Rumah</span><span>: {safeStr(dataKk.bentukRumah)}</span></div>
            <div className="flex"><span className="w-32 font-bold">Status Rumah</span><span>: {safeStr(dataKk.statusRumah)}</span></div>
          </div>
          <div>
             <div className="flex"><span className="w-32 font-bold">Alamat Rayon</span><span>: Rayon {safeStr(dataKk.noRayon)}</span></div>
             <div className="flex"><span className="w-32 font-bold">Alamat Domisili</span><span>: {safeStr(dataKk.alamat)}</span></div>
          </div>
          <div>
             <div className="flex justify-end"><span className="w-24 font-bold text-right mr-1">No. KK</span><span>: {safeStr(dataKk.idKk)}</span></div>
          </div>
       </div>
       <h3 className="font-bold text-[10px] mb-1 uppercase bg-gray-200 p-0.5 text-center border border-black">Tabel 1: Identitas Umum</h3>
       <table className="w-full border-collapse border border-black mb-2 text-[9px] text-center">
          <thead><tr className="bg-gray-100"><th className={b}>NO</th><th className={b}>NAMA LENGKAP</th><th className={b}>NIK</th><th className={b}>JK</th><th className={b}>TEMPAT LAHIR</th><th className={b}>TGL LAHIR</th><th className={b}>DOMISILI</th><th className={b}>PENDIDIKAN</th><th className={b}>PEKERJAAN</th><th className={b}>PENGHASILAN</th><th className={b}>GOL DARAH</th><th className={b}>ASURANSI KES</th><th className={b}>DISABILITAS</th></tr></thead>
          <tbody>
             {anggotaKk.map((ang, i) => (
                <tr key={i}>
                   <td className={b}>{safeStr(ang.noAnggota || i+1)}</td><td className={`text-left font-bold uppercase whitespace-nowrap ${b}`}>{safeStr(ang.namaLengkap)}</td><td className={b}>{safeStr(ang.nik)}</td>
                   <td className={b}>{isL(ang.jk) ? 'L' : (isP(ang.jk) ? 'P' : '-')}</td><td className={b}>{safeStr(ang.tempatLahir)}</td><td className={b}>{toDisplayDate(ang.tanggalLahir)}</td>
                   <td className={b}>{safeStr(ang.alamat)}</td><td className={b}>{safeStr(ang.pendidikan)}</td><td className={b}>{safeStr(ang.pekerjaan)}</td>
                   <td className={`whitespace-nowrap ${b}`}>{safeStr(ang.penghasilan)}</td><td className={b}>{safeStr(ang.goldar)}</td><td className={b}>{safeStr(ang.asuransi)}</td>
                   <td className={b}>{ang.disabilitas === 'Ya' ? safeStr(ang.jenisDisabilitas) : '-'}</td>
                </tr>
             ))}
          </tbody>
       </table>
       <h3 className="font-bold text-[10px] mb-1 uppercase bg-gray-200 p-0.5 text-center border border-black">Tabel 2: Riwayat Agama & Keluarga</h3>
       <table className="w-full border-collapse border border-black mb-4 text-[9px] text-center">
          <thead><tr className="bg-gray-100"><th className={b}>NO</th><th className={b}>TEMPAT BAPTIS</th><th className={b}>TGL BAPTIS</th><th className={b}>PENDETA BAPTIS</th><th className={b}>TEMPAT SIDI</th><th className={b}>TGL SIDI</th><th className={b}>PENDETA SIDI</th><th className={b}>TEMPAT NIKAH</th><th className={b}>TGL NIKAH</th><th className={b}>PENDETA NIKAH</th><th className={b}>JENIS NIKAH</th><th className={b}>STATUS KELUARGA</th><th className={b}>JANDA/YATIM</th><th className={b}>JABATAN JEMAAT</th><th className={b}>JABATAN MASY.</th></tr></thead>
          <tbody>
             {anggotaKk.map((ang, i) => (
                <tr key={i}>
                   <td className={b}>{safeStr(ang.noAnggota || i+1)}</td><td className={b}>{safeStr(ang.gerejaBaptis)}</td><td className={b}>{toDisplayDate(ang.tanggalBaptis)}</td><td className={b}>{safeStr(ang.pendetaBaptis)}</td>
                   <td className={b}>{safeStr(ang.gerejaSidi)}</td><td className={b}>{toDisplayDate(ang.tanggalSidi)}</td><td className={b}>{safeStr(ang.pendetaSidi)}</td>
                   <td className={b}>{safeStr(ang.gerejaNikah)}</td><td className={b}>{toDisplayDate(ang.tanggalNikah)}</td><td className={b}>{safeStr(ang.pendetaNikah)}</td>
                   <td className={b}>{Array.isArray(ang.jenisNikah) ? ang.jenisNikah.join(', ') : safeStr(ang.jenisNikah)}</td><td className={b}>{safeStr(ang.statusKeluarga)}</td><td className={b}>{(ang.jandaDuda && ang.jandaDuda !== '') ? safeStr(ang.jandaDuda) : safeStr(ang.yatimPiatu)}</td>
                   <td className={b}>{safeStr(ang.jabatanJemaat)}</td><td className={b}>{safeStr(ang.jabatanMasyarakat)}</td>
                </tr>
             ))}
          </tbody>
       </table>
       <div className="flex justify-between mt-4 px-16 text-[10px]">
          <div className="text-center">
             <p className="mb-12">Kepala Keluarga,</p>
             <p className="font-bold underline uppercase">{safeStr(dataKk.kepalaKeluarga)}</p>
          </div>
          <div className="text-center">
             <p className="mb-1">Dikeluarkan Tanggal: {getFormatDate()}</p>
             <p>Majelis {churchProfile.mataJemaat || churchProfile.jemaat}</p>
             <p className="mb-12">Penatua Rayon {safeStr(dataKk.noRayon)}</p>
             <p className="font-bold underline uppercase">{safeStr(penatuaMap[dataKk.noRayon] || dataKk.penatua)}</p>
          </div>
       </div>
       <div className="flex items-center justify-center mt-6 gap-4 print:hidden">
          <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 font-bold text-white rounded shadow">Cetak Kertas Ini</button>
          <button onClick={onBack} className="px-4 py-2 bg-gray-500 font-bold text-white rounded shadow"><ArrowLeft className="w-4 h-4 inline mr-2"/> Kembali</button>
       </div>
    </div>
  );
}

function PrintMajelisTemplate({ majelisToPrint, majelisData, penatuaMap, churchProfile, onBack }) {
  if (!majelisToPrint) return null;
  const mj = majelisData.find(m => m.dbId === majelisToPrint);
  if (!mj) return null;
  const anakArr = Array.isArray(mj.anak) ? mj.anak : [];
  const b = "border border-black p-1";
  return (
    <div className="w-full bg-white text-black p-8 text-sm font-sans max-w-4xl mx-auto border shadow-lg print:border-none print:shadow-none print:m-0 print:p-0">
       <style type="text/css">{"@page { size: portrait; margin: 15mm; }"}</style>
       <div className="border-b-4 border-double border-black pb-4 mb-6 relative flex justify-center items-center">
          <div className="absolute left-0">
             <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
          </div>
          <div className="text-center w-full">
             <h1 className="text-xl font-bold uppercase tracking-wider">{churchProfile.sinode || 'GEREJA MASEHI INJILI DI TIMOR (GMIT)'}</h1>
             {churchProfile.klasis && <h2 className="text-lg font-bold uppercase">KLASIS {churchProfile.klasis}</h2>}
             <h2 className="text-lg font-bold uppercase">JEMAAT {churchProfile.jemaat}</h2>
             {churchProfile.mataJemaat && <h3 className="text-lg font-bold uppercase">MATA JEMAAT {churchProfile.mataJemaat}</h3>}
             <p className="text-sm mt-1">Alamat: {churchProfile.alamat}</p>
          </div>
       </div>
       <div className="text-center mb-6">
          <h1 className="text-2xl font-black uppercase">PROFIL PELAYAN / MAJELIS JEMAAT</h1>
          <h2 className="text-lg font-bold uppercase">RAYON {safeStr(mj.noRayon)}</h2>
       </div>
       <div className="flex gap-8 mb-6">
          <div className="w-1/4">
             <div className="w-32 h-40 border-2 border-black p-1 bg-gray-50 flex items-center justify-center overflow-hidden">
                {mj.fotoBase64 ? <img src={mj.fotoBase64} className="w-full h-full object-cover" alt="Pas Foto"/> : <span className="text-gray-400 font-bold text-center">PAS FOTO<br/>3x4</span>}
             </div>
          </div>
          <div className="w-3/4">
             <h3 className="font-bold text-lg border-b border-black mb-2 uppercase bg-gray-100 p-1">A. IDENTITAS DIRI</h3>
             <table className="w-full text-sm">
                <tbody>
                   <tr><td className="py-1 w-40 font-semibold">Nama Lengkap</td><td>: {safeStr(mj.namaLengkap)}</td></tr>
                   <tr><td className="py-1 font-semibold">Nama Panggilan</td><td>: {safeStr(mj.namaPanggilan)}</td></tr>
                   <tr><td className="py-1 font-semibold">Jabatan Pelayanan</td><td>: <span className="font-bold">{safeStr(mj.jabatanPelayanan)}</span></td></tr>
                   <tr><td className="py-1 font-semibold">Tempat, Tgl Lahir</td><td>: {safeStr(mj.tempatLahir)}, {toDisplayDate(mj.tanggalLahir)}</td></tr>
                   <tr><td className="py-1 font-semibold">Jenis Kelamin</td><td>: {safeStr(mj.jk)}</td></tr>
                   <tr><td className="py-1 font-semibold">Golongan Darah</td><td>: {safeStr(mj.goldar)}</td></tr>
                   <tr><td className="py-1 font-semibold">Anak Ke / Jml Sdr</td><td>: {safeStr(mj.anakKe)} dari {safeStr(mj.jumlahSaudara)} bersaudara</td></tr>
                   <tr><td className="py-1 font-semibold">Pekerjaan</td><td>: {safeStr(mj.pekerjaan)}</td></tr>
                </tbody>
             </table>
          </div>
       </div>
       <div className="mb-6">
          <h3 className="font-bold text-lg border-b border-black mb-2 uppercase bg-gray-100 p-1">B. RIWAYAT GEREJAWI PRIBADI</h3>
          <table className="w-full text-sm">
             <tbody>
                <tr><td className="py-1 w-48 font-semibold">Gereja & Tgl Baptis</td><td>: {safeStr(mj.gerejaBaptis)} ({toDisplayDate(mj.tanggalBaptis)})</td></tr>
                <tr><td className="py-1 font-semibold">Gereja & Tgl Sidi</td><td>: {safeStr(mj.gerejaSidi)} ({toDisplayDate(mj.tanggalSidi)})</td></tr>
                <tr><td className="py-1 font-semibold">Nama Ayah / Ibu Kandung</td><td>: {safeStr(mj.namaAyah)} / {safeStr(mj.namaIbu)}</td></tr>
             </tbody>
          </table>
       </div>
       <div className="mb-6">
          <h3 className="font-bold text-lg border-b border-black mb-2 uppercase bg-gray-100 p-1">C. DATA KELUARGA</h3>
          <table className="w-full text-sm mb-4">
             <tbody>
                <tr><td className="py-1 w-48 font-semibold">Status Menikah</td><td>: {Array.isArray(mj.statusMenikah)?mj.statusMenikah.join(', '):safeStr(mj.statusMenikah)}</td></tr>
                <tr><td className="py-1 font-semibold">Nama Suami/Istri</td><td>: <span className="font-bold">{safeStr(mj.namaPasangan)}</span></td></tr>
                <tr><td className="py-1 font-semibold">Tempat, Tgl Lahir Pasangan</td><td>: {safeStr(mj.tempatLahirPasangan)}, {toDisplayDate(mj.tanggalLahirPasangan)}</td></tr>
             </tbody>
          </table>
          <p className="font-bold mb-1">Data Anak:</p>
          <table className="w-full border-collapse border border-black text-xs text-center">
             <thead className="bg-gray-100"><tr><th className={b}>No</th><th className={b}>Nama Anak</th><th className={b}>Tempat, Tgl Lahir</th><th className={b}>Gereja Baptis</th><th className={b}>Gereja Sidi</th></tr></thead>
             <tbody>
                {anakArr.length > 0 ? anakArr.map((a, i) => (
                   <tr key={i}><td className={b}>{i+1}</td><td className={`text-left font-bold ${b}`}>{safeStr(a.nama)}</td><td className={b}>{safeStr(a.tempatLahir)}, {toDisplayDate(a.tanggalLahir)}</td><td className={b}>{safeStr(a.gerejaBaptis)} {a.tanggalBaptis ? `(${toDisplayDate(a.tanggalBaptis)})` : ''}</td><td className={b}>{safeStr(a.gerejaSidi)} {a.tanggalSidi ? `(${toDisplayDate(a.tanggalSidi)})` : ''}</td></tr>
                )) : <tr><td colSpan="5" className="border border-black p-2 italic text-gray-500">Tidak ada data anak tercatat.</td></tr>}
             </tbody>
          </table>
       </div>
       <div className="mt-10 text-right pr-8 text-sm">
          {/* PERUBAHAN: Menyesuaikan tempat tanggal dengan Mata Jemaat */}
          <p className="mb-16">Jemaat {churchProfile.mataJemaat || churchProfile.jemaat}, {getFormatDate()}</p>
          <p className="font-bold underline uppercase">{safeStr(mj.namaLengkap)}</p>
          <p>Pelayan / Majelis</p>
       </div>
       <div className="flex items-center justify-center mt-8 gap-4 print:hidden">
          <button onClick={() => window.print()} className="px-6 py-3 bg-purple-600 font-bold text-white rounded-xl shadow-lg flex items-center gap-2"><Printer className="w-5 h-5"/> Tekan Untuk Cetak Kertas Ini</button>
          <button onClick={onBack} className="px-6 py-3 bg-gray-500 font-bold text-white rounded-xl shadow-lg flex items-center gap-2"><ArrowLeft className="w-5 h-5"/> Kembali</button>
       </div>
    </div>
  );
}

function PrintListTemplate({ listToPrint, tabCols, filteredData, filterRayon, filterKategori, churchProfile, onBack }) {
  if (!listToPrint) return null;
  const b = "border border-black p-1";
  return (
    <div className="block w-full bg-white text-black p-4 md:p-8 text-sm font-sans max-w-4xl mx-auto border shadow-lg print:border-none print:shadow-none print:m-0 print:p-0">
       <style type="text/css">{"@page { size: A4 portrait; margin: 10mm; }"}</style>
       <div className="border-b-4 border-double border-black pb-3 mb-4 relative flex justify-center items-center">
          <div className="absolute left-0">
             <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
          </div>
          <div className="text-center w-full leading-tight">
             <h1 className="text-lg font-bold uppercase tracking-wider">{churchProfile.sinode || 'GEREJA MASEHI INJILI DI TIMOR (GMIT)'}</h1>
             {churchProfile.klasis && <h2 className="text-base font-bold uppercase">KLASIS {churchProfile.klasis}</h2>}
             <h2 className="text-base font-bold uppercase">JEMAAT {churchProfile.jemaat}</h2>
             {churchProfile.mataJemaat && <h3 className="text-base font-bold uppercase">MATA JEMAAT {churchProfile.mataJemaat}</h3>}
             <p className="text-xs mt-1">Alamat: {churchProfile.alamat}</p>
          </div>
       </div>
       <div className="text-center mb-4 leading-tight">
          <h1 className="text-xl font-black uppercase">LAPORAN DATA {safeStr(listToPrint).toUpperCase()}</h1>
          
          {(filterRayon !== 'Semua' || listToPrint === 'Pelayanan Kategori') && (
            <p className="font-semibold mt-1 text-sm">
               {filterRayon !== 'Semua' ? `Filter: Rayon ${safeStr(filterRayon)} ` : ''} 
               {listToPrint === 'Pelayanan Kategori' ? `| Kategori: ${safeStr(filterKategori)}` : ''}
            </p>
          )}
       </div>
       <table className="w-full border-collapse border border-black text-[10px] leading-tight text-center mb-6">
          <thead className="bg-gray-100">
             <tr>
                <th className={b}>NO</th>
                {tabCols.map(c => <th key={c.l} className={b}>{c.l.toUpperCase()}</th>)}
             </tr>
          </thead>
          <tbody>
             {(filteredData||[]).map((row, i) => (
                <tr key={i}>
                   <td className={b}>{i+1}</td>
                   {tabCols.map((c, j) => <td key={j} className={b}>{c.fmt ? c.fmt(row[c.k], row) : safeStr(row[c.k])}</td>)}
                </tr>
             ))}
             {(!filteredData || filteredData.length === 0) && (<tr><td colSpan={tabCols.length+1} className="border border-black p-2 italic text-gray-500">Tidak ada data.</td></tr>)}
          </tbody>
       </table>
       
       {/* --- PERUBAHAN SUSUNAN TANDA TANGAN --- */}
       <div className="flex justify-end mt-6 pr-4 text-xs">
          <div className="text-center">
             <p>{churchProfile.mataJemaat || churchProfile.jemaat}, {getFormatDate()}</p>
             <p>Majelis Mata Jemaat</p>
             <p className="mb-16">Sekretaris / Wakil Sekretaris,</p> {/* margin-bottom 16 untuk jarak TTD */}
             <p className="font-bold underline uppercase">{safeStr(churchProfile.namaSekretaris || 'NAMA SEKRETARIS')}</p>
          </div>
       </div>
       {/* --------------------------------------- */}

       <div className="flex items-center justify-center mt-6 gap-4 print:hidden">
          <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 font-bold text-white rounded shadow">Cetak Kertas Ini</button>
          <button onClick={onBack} className="px-4 py-2 bg-gray-500 font-bold text-white rounded shadow"><ArrowLeft className="w-4 h-4 inline mr-2"/> Kembali</button>
       </div>
    </div>
  );
}

// --- LOGIN SCREEN SCREEN (CLEAN CREDENTIAL NOTES) ---
function LoginScreen({ onLogin, penatuaMap, penatuaPassMap, churchProfile }) {
  const [role, setRole] = useState('jemaat');
  const [selectedRayon, setSelectedRayon] = useState('1');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const handleLogin = (e) => {
    e.preventDefault(); setErrorMsg('');
    if (role === 'admin' && password !== 'admin123') return setErrorMsg('Password Admin salah!');
    if (role === 'penatua') {
       const correctPass = penatuaPassMap[selectedRayon] || 'penatua123';
       if (password !== correctPass) return setErrorMsg('Password Penatua salah!');
    }
    onLogin({ role, name: role === 'penatua' ? penatuaMap[selectedRayon] : role });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4 bg-white rounded-full shadow-sm p-1" />
          <h1 className="text-2xl font-black text-gray-800 text-center tracking-tight">Sistem Informasi</h1>
          <p className="text-gray-500 font-medium text-center uppercase text-xs mt-2 leading-relaxed">
            {churchProfile?.sinode || 'GMIT'}
            {churchProfile?.klasis ? <><br />KLASIS {churchProfile.klasis}</> : ''}
            {churchProfile?.jemaat ? <><br />JEMAAT {churchProfile.jemaat}</> : <><br />NAMA GEREJA</>}
            {churchProfile?.mataJemaat ? <><br />MATA JEMAAT {churchProfile.mataJemaat}</> : ''}
          </p>
        </div>
        {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-semibold text-center">{errorMsg}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Masuk Sebagai</label><select value={role} onChange={(e) => { setRole(e.target.value); setPassword(''); setErrorMsg(''); }} className="w-full border p-2 rounded bg-gray-50 text-sm focus:ring-2 outline-none"><option value="jemaat">Jemaat (Read-Only)</option><option value="penatua">Penatua (Akses Edit Rayon)</option><option value="admin">Administrator (Akses Penuh)</option></select></div>
          {role === 'penatua' && <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Pilih Rayon</label><select value={selectedRayon} onChange={(e) => setSelectedRayon(e.target.value)} className="w-full border p-2 rounded bg-gray-50 text-sm focus:ring-2 outline-none">{Object.keys(penatuaMap).sort((a,b)=>parseInt(a)-parseInt(b)).map(r => <option key={r} value={r}>Rayon {r} - {penatuaMap[r]}</option>)}</select></div>}
          {role !== 'jemaat' && <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 rounded bg-gray-50 text-sm focus:ring-2 outline-none" /></div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-2 shadow-md transition-all">Masuk Dashboard</button>
        </form>
      </div>
    </div>
  );
}

// --- APP UTAMA ---
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [jemaatData, setJemaatData] = useState([]);
  const [majelisData, setMajelisData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [penatuaMap, setPenatuaMap] = useState(DEFAULT_PENATUA);
  const [penatuaPassMap, setPenatuaPassMap] = useState({});
  const [churchProfile, setChurchProfile] = useState(DEFAULT_CHURCH_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Data KK');
  const [subTabJemaat, setSubTabJemaat] = useState('Tabel Data');
  const [subTabMajelis, setSubTabMajelis] = useState('Tabel Data');
  const [activeSubTabStatus, setActiveSubTabStatus] = useState('Pelayanan Kategori');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRayon, setFilterRayon] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua Kategori');
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1);
  const [filterHistoryAction, setFilterHistoryAction] = useState('Semua');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [printMode, setPrintMode] = useState(null); 
  const [printId, setPrintId] = useState(null);
  const [modalMode, setModalMode] = useState(''); 
  const [formData, setFormData] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '' });
  const [showMenuOps, setShowMenuOps] = useState(false);
  const showAlert = (title, message) => setAlertDialog({ isOpen: true, title, message });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (inCanvas && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } else {
           await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth init error", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setFirebaseUser);
    return () => unsubscribe();
  }, []);

  // --- ARSITEKTUR KONTROL AMBIL DATA (ANTI-LAG GETDOCS) ---
  const fetchSemuaData = async () => {
    setIsLoading(true);
    try {
        const jemaatSnap = await getDocs(getDBCollection('jemaat'));
        setJemaatData(jemaatSnap.docs.map(d => ({ dbId: d.id, ...d.data() })));
        const majelisSnap = await getDocs(getDBCollection('majelis'));
        setMajelisData(majelisSnap.docs.map(d => ({ dbId: d.id, ...d.data() })));
        const historySnap = await getDocs(getDBCollection('history'));
        setHistoryData(historySnap.docs.map(d => ({ dbId: d.id, ...d.data() })).sort((a,b)=>b.timestamp - a.timestamp));
    } catch (err) {
        console.error("Gagal mengambil data pokok:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!firebaseUser) return;
    fetchSemuaData();
    const errHandler = (err) => { console.error("Firestore Settings Error:", err); };
    const u4 = onSnapshot(getDBDoc('settings', 'penatua_config'), (d) => { if(d.exists()) setPenatuaMap(d.data()); }, errHandler);
    const u5 = onSnapshot(getDBDoc('settings', 'penatua_pass'), (d) => { if(d.exists()) setPenatuaPassMap(d.data()); }, errHandler);
    const u6 = onSnapshot(getDBDoc('settings', 'church_profile'), (d) => { if(d.exists()) setChurchProfile(d.data()); }, errHandler);
    return () => { u4(); u5(); u6(); };
  }, [firebaseUser]);

  const rayonList = useMemo(() => Object.keys(penatuaMap).sort((a,b)=>parseInt(a)-parseInt(b)), [penatuaMap]);
  const canEdit = (row) => appUser?.role === 'admin' || (appUser?.role === 'penatua' && (!row || String(row.noRayon) === Object.keys(penatuaMap).find(key => penatuaMap[key] === appUser.name)));
  const recordHistory = async (action, col, target) => {
    try { await addDoc(getDBCollection('history'), { action, collection: col, target: target || 'Data', user: appUser?.name || appUser?.role || 'System', timestamp: Date.now() }); } catch(e) {}
  };

  const handleRestoreData = useCallback((row) => {
    setConfirmDialog({
      isOpen: true,
      title: "Tarik Data",
      message: `Tarik kembali data [${row.namaLengkap}] ke Jemaat Aktif?`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        try { 
          await updateDoc(getDBDoc('jemaat', row.dbId), { statusKeanggotaan: 'Aktif', statusHidup: 'Hidup', tanggalKematian: '', tanggalPenguburan: '', pindahKeJemaat: '', tanggalPindah: '' }); 
          await recordHistory('RESTORE', 'jemaat', row.namaLengkap);
          await fetchSemuaData();
        } catch (e) {}
      }
    });
  }, []);

  const handleCleanAll = (colName) => {
    setConfirmDialog({
      isOpen: true,
      title: "PERINGATAN KRITIS!",
      message: `HAPUS SELURUH DATA ${colName.toUpperCase()}? Tindakan ini tidak bisa dibatalkan!`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        setIsLoading(true);
        const dataToDel = colName === 'majelis' ? [...majelisData] : [...jemaatData];
        let successCount = 0;
        for (const d of dataToDel) { try { await deleteDoc(getDBDoc(colName, d.dbId)); successCount++; } catch(e){} }
        await recordHistory('HAPUS SEMUA', colName, `Seluruh Data (${successCount})`);
        await fetchSemuaData();
        setIsLoading(false); showAlert("Sukses", `Berhasil menghapus ${successCount} data.`);
      }
    });
  };

  const handleExportCSV = () => {
    const isMajelis = activeTab === 'Profil Majelis';
    const typeName = isMajelis ? 'majelis' : 'jemaat';
    let t = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><body><table border="1">`;
    if (isMajelis) {
        t += `<tr>${MAJELIS_HEADERS.map(h => `<th style="background-color:#9C27B0;color:white;">${h}</th>`).join('')}</tr>`;
        [...majelisData].forEach(d => {
           const r = [];
           Object.keys(MAJELIS_HEADER_MAP).forEach(h => { let val = d[MAJELIS_HEADER_MAP[h]] || ''; if(h.includes('Tgl') || h.includes('Tanggal')) val = toDisplayDate(val); r.push(val); });
           for(let i=0; i<6; i++) { const a = (Array.isArray(d.anak) && d.anak[i]) ? d.anak[i] : {}; r.push(safeStr(a.nama), safeStr(a.tempatLahir), toDisplayDate(a.tanggalLahir), safeStr(a.gerejaBaptis), toDisplayDate(a.tanggalBaptis), safeStr(a.gerejaSidi), toDisplayDate(a.tanggalSidi)); }
           t += `<tr>${r.map(v => `<td>${safeStr(v)}</td>`).join('')}</tr>`;
        });
    } else {
        t += `<tr>${JEMAAT_HEADERS.map(h => `<th style="background-color:#4CAF50;color:white;">${h}</th>`).join('')}</tr>`;
        [...jemaatData].sort((a,b) => (a.noRayon||'').localeCompare(b.noRayon||'') || (a.idKk||'').localeCompare(b.idKk||'')).forEach(d => {
           const row = [d.idKk, d.kepalaKeluarga, d.noRayon, d.urutanKk, d.bentukRumah, d.statusRumah, d.penatua, d.noAnggota, d.idJemaat, d.namaLengkap, `="${d.nik||''}"`, d.jk, d.goldar, d.tempatLahir, toDisplayDate(d.tanggalLahir), calculateAge(d.tanggalLahir), d.alamat, d.sukuAyah, d.sukuIbu, d.statusKeluarga, d.baptis, d.gerejaBaptis, toDisplayDate(d.tanggalBaptis), d.pendetaBaptis, d.sidi, d.gerejaSidi, toDisplayDate(d.tanggalSidi), d.pendetaSidi, d.nikah, Array.isArray(d.jenisNikah) ? d.jenisNikah.join(', ') : (d.jenisNikah || ''), d.gerejaNikah, toDisplayDate(d.tanggalNikah), d.pendetaNikah, d.pendidikan, d.pekerjaan, d.penghasilan, d.asuransi, d.jaminan, d.jandaDuda, d.yatimPiatu, d.disabilitas, d.jenisDisabilitas, d.jabatanJemaat, d.jabatanMasyarakat, d.statusKeanggotaan || 'Aktif', toDisplayDate(d.tanggalKematian), toDisplayDate(d.tanggalPenguburan), d.asalJemaat, toDisplayDate(d.tanggalMasuk), d.pindahKeJemaat, toDisplayDate(d.tanggalPindah)];
           t += `<tr>${row.map(v => `<td>${safeStr(v)}</td>`).join('')}</tr>`;
        });
    }
    t += `</table></body></html>`;
    const blob = new Blob([t], { type: "application/vnd.ms-excel" }); const l = document.createElement("a"); l.href = URL.createObjectURL(blob);
    l.download = `Data_${typeName}_${(churchProfile.jemaat || '').replace(/\s+/g, '_')}.xls`; document.body.appendChild(l);
    l.click(); document.body.removeChild(l);
  };

  const handleExportSinode = () => {
    let t = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><body><table border="1">`;
    const headers = ["Rayon", "Alamat", "No.Telp", "Nama Kepala Keluarga", "Nama Lengkap", "NIK", "Jenis Kelamin", "Tempat Lahir", "Tanggal lahir", "Bulan Lahir", "Tahun lahir", "Golongan Darah", "Status dalam Keluarga", "Baptis", "Sidi", "Nikah", "Status nikah", "Status nikah/Nikah Adat", "Status nikah/Nikah Gereja/Masehi", "Status nikah/Nikah Catatan Sipil/BS", "Suku Ayah", "Suku Ibu", "Pendidikan", "Pekerjaan utama", "Penghasilan", "Apakah mempunyai jaminan/asuransi kesehatan?", "Jaminan Kesehatan", "Jika asuransi lainnya, sebutkan!", "Janda / Duda", "Yatim / Piatu", "Disabilitas", "Jika ya, sebutkan ragam disabilitas", "_index", "_parent_index", "Usia"];
    t += `<tr>${headers.map(h => `<th style="background-color:#1E3A8A;color:white;">${h}</th>`).join('')}</tr>`;
    const activeData = jemaatData.filter(d => d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah' && d.statusHidup !== 'Meninggal');
    activeData.sort((a,b) => (a.noRayon||'').localeCompare(b.noRayon||'') || (a.idKk||'').localeCompare(b.idKk||''));
    let index = 1; let parentIndex = 1; let currentKk = '';
    activeData.forEach(d => {
      if (currentKk !== d.idKk) { if(currentKk !== '') parentIndex++; currentKk = d.idKk; }
      let hari = '', bulan = '', tahun = '';
      if (d.tanggalLahir) {
         const parts = d.tanggalLahir.split('-');
         if (parts.length === 3) {
            if (parts[0].length === 4) { tahun = parts[0]; bulan = NAMA_BULAN[parseInt(parts[1], 10) - 1] || ''; hari = parseInt(parts[2], 10).toString(); } 
            else { hari = parseInt(parts[0], 10).toString(); bulan = NAMA_BULAN[parseInt(parts[1], 10) - 1] || ''; tahun = parts[2]; }
         }
      }
      const jn = Array.isArray(d.jenisNikah) ? d.jenisNikah : []; const statusNikahStr = jn.join(' ');
      const isAdat = jn.includes('Nikah Adat') ? '1' : '0'; const isGereja = jn.includes('Nikah Gereja/Masehi') ? '1' : '0'; const isSipil = jn.includes('Nikah Catatan Sipil/BS') ? '1' : '0';
      const row = [`Rayon ${d.noRayon || ''}`, d.alamat || '', d.noHp || '0', d.kepalaKeluarga || '', d.namaLengkap || '', d.nik ? `="${d.nik}"` : '', d.jk || '', d.tempatLahir || '', hari, bulan, tahun, d.goldar || '', d.statusKeluarga || '', d.baptis || '', d.sidi || '', d.nikah || '', statusNikahStr, isAdat, isGereja, isSipil, d.sukuAyah || '', d.sukuIbu || '', d.pendidikan || '', d.pekerjaan || '', d.penghasilan || '', d.asuransi || '', d.jaminan === 'BPJS/Askes' ? 'BPJS/Askes' : '', (d.jaminan && d.jaminan !== 'BPJS/Askes') ? d.jaminan : '', d.jandaDuda === 'Tidak' ? '' : (d.jandaDuda || ''), d.yatimPiatu === 'Tidak' ? '' : (d.yatimPiatu || ''), d.disabilitas || 'Tidak', d.jenisDisabilitas || '', index++, parentIndex, calculateAge(d.tanggalLahir)];
      t += `<tr>${row.map(v => `<td>${safeStr(v)}</td>`).join('')}</tr>`;
    });
    t += `</table></body></html>`;
    const blob = new Blob([t], { type: "application/vnd.ms-excel" }); const l = document.createElement("a"); l.href = URL.createObjectURL(blob);
    l.download = `Laporan_Sinode_Jemaat_${(churchProfile.jemaat || '').replace(/\s+/g, '_')}.xls`; document.body.appendChild(l); l.click(); document.body.removeChild(l);
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const isMajelis = activeTab === 'Profil Majelis'; const typeName = isMajelis ? 'majelis' : 'jemaat';
    setIsLoading(true); const reader = new FileReader();
    reader.onload = async (event) => {
      const rows = parseCSV(event.target.result);
      if (rows.length < 2) { showAlert("Error", "Format CSV salah."); setIsLoading(false); return; }
      const headers = rows[0].map(h => h.replace(/['"]+/g, '').trim());
      let successCount = 0, duplicateCount = 0;
      const targetData = isMajelis ? majelisData : jemaatData;
      const existingIdentities = new Set(targetData.map(d => `${d.idJemaat || ''}-${d.namaLengkap}`.toLowerCase().trim()));

      for (let i=1; i<rows.length; i++) {
        if(rows[i].length<2) continue; const d = {}; const ank = [{},{},{},{},{},{}];
        headers.forEach((h, idx) => {
           let v = (rows[i][idx] || '').replace(/^="|"$/g, '');
           if(h==='Jenis Kelamin'||h==='JK') { v = isL(v)?'Laki-laki':(isP(v)?'Perempuan':v); }
           const hLow = h.toLowerCase();
           if(hLow.includes('tgl') || hLow.includes('tanggal') || hLow.includes('lahir') || hLow.includes('baptis') || hLow.includes('sidi') || hLow.includes('nikah')) {
               let dateVal = v.replace(/\s+/g, '');
               if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) { v = dateVal; } 
               else if (dateVal.includes('/')) {
                   const p = dateVal.split('/'); if(p.length === 3) { if(p[2].length === 4) v = `${p[2]}-${pad0(p[1])}-${pad0(p[0])}`; else if(p[0].length === 4) v = `${p[0]}-${pad0(p[1])}-${pad0(p[2])}`; }
               } else if (dateVal.includes('-')) {
                   const p = dateVal.split('-'); if(p.length === 3) { if(p[2].length === 4) v = `${p[2]}-${pad0(p[1])}-${pad0(p[0])}`; }
               }
           }
           if(isMajelis) {
               if(MAJELIS_HEADER_MAP[h]) { const safeKey = MAJELIS_HEADER_MAP[h].replace(/[~*/\[\]]/g, ''); if(safeKey === 'statusMenikah') d[safeKey] = v.split(',').map(s=>s.trim()); else d[safeKey] = v; } 
               else { const m = h.match(/(.+) Anak (\d)/); if(m && (parseInt(m[2])-1)>=0 && (parseInt(m[2])-1)<6) { const fk=m[1], ai=parseInt(m[2])-1; if(fk==='Nama') ank[ai].nama=v; if(fk==='Tempat Lahir') ank[ai].tempatLahir=v; if(fk.includes('Lahir')) ank[ai].tanggalLahir=v; if(fk==='Gereja Baptis') ank[ai].gerejaBaptis=v; if(fk.includes('Baptis')) ank[ai].tanggalBaptis=v; if(fk==='Gereja Sidi') ank[ai].gerejaSidi=v; if(fk.includes('Sidi')) ank[ai].tanggalSidi=v; } }
           } else {
               let k = JEMAAT_HEADER_MAP[h] || h; k = String(k).replace(/[~*/\[\]]/g, '').trim(); if(k==='jenisNikah' && v) d[k] = v.split(',').map(s=>s.trim()); else d[k] = v;
           }
        });
        if (isMajelis) d.anak = ank.filter(a => a.nama && a.nama.trim() !== '');
        if(!d.namaLengkap && !d.kepalaKeluarga) continue;
        const idKey = `${d.idJemaat || ''}-${d.namaLengkap}`.toLowerCase().trim();
        if(existingIdentities.has(idKey)) { duplicateCount++; continue; }
        if(!isMajelis) { d.statusKeanggotaan = 'Aktif'; d.statusHidup = 'Hidup'; }
        try { await addDoc(getDBCollection(typeName), d); successCount++; existingIdentities.add(idKey); } catch(e) {}
      }
      await recordHistory('IMPORT', typeName, `${successCount} Data CSV Masuk`);
      await fetchSemuaData();
      showAlert('Selesai!', `Berhasil masuk: ${successCount} data.\nDitolak (Dobel Nama): ${duplicateCount} data.`); 
      setIsLoading(false);
    };
    reader.readAsText(file); e.target.value = ''; 
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) return showAlert("Peringatan", "Maksimal ukuran foto adalah 800KB.");
      const reader = new FileReader(); reader.onloadend = () => setFormData(prev => ({ ...prev, fotoBase64: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const saveDocument = async (collectionName, data, id = null) => {
    try {
      const cleanData = {};
      Object.entries(data).forEach(([key, val]) => { if (val !== undefined && key !== 'dbId') { const safeKey = String(key).replace(/[~*/\[\]]/g, '').trim(); cleanData[safeKey] = val; } });
      if (id) { 
          await updateDoc(getDBDoc(collectionName, id), cleanData); await recordHistory('EDIT', collectionName, cleanData.namaLengkap || cleanData.kepalaKeluarga || id); 
      } else { 
          await addDoc(getDBCollection(collectionName), cleanData); await recordHistory('TAMBAH', collectionName, cleanData.namaLengkap || cleanData.kepalaKeluarga || 'Data Baru'); 
      }
      await fetchSemuaData();
    } catch (error) { showAlert("Error", "Gagal menyimpan data."); }
  };

  const requestDelete = useCallback((collectionName, id, name) => {
    setConfirmDialog({
      isOpen: true,
      title: "Konfirmasi Hapus",
      message: `Apakah Anda yakin ingin menghapus data ${name} secara permanen?`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        try { await deleteDoc(getDBDoc(collectionName, id)); await recordHistory('HAPUS', collectionName, name || id); await fetchSemuaData(); showAlert("Sukses", "Data berhasil dihapus!"); } catch (error) { showAlert("Error", "Gagal menghapus."); }
      }
    });
  }, [majelisData, jemaatData]);

  const handleFormSubmit = async (e) => {
    e.preventDefault(); const dataToSave = { ...formData }; const docId = dataToSave.dbId; delete dataToSave.dbId;
    if (modalMode === 'addKk' || modalMode === 'editKk') {
      dataToSave.namaLengkap = dataToSave.kepalaKeluarga; dataToSave.statusKeluarga = 'Kepala Keluarga';
      if(modalMode === 'addKk') { dataToSave.statusHidup = 'Hidup'; dataToSave.statusKeanggotaan = 'Aktif'; }
      if (modalMode === 'editKk' && docId) {
         const oldData = (jemaatData || []).find(d => d.dbId === docId);
         if (oldData && oldData.idKk !== dataToSave.idKk) {
             const familyMembers = (jemaatData || []).filter(d => d.idKk === oldData.idKk && d.dbId !== docId);
             for (const mem of familyMembers) {
                 const newIdJemaat = `AG${pad0(dataToSave.noRayon)}${pad0(dataToSave.urutanKk)}${pad0(mem.noAnggota)}`;
                 try { await updateDoc(getDBDoc('jemaat', mem.dbId), { idKk: dataToSave.idKk, noRayon: dataToSave.noRayon, urutanKk: dataToSave.urutanKk, penatua: dataToSave.penatua, idJemaat: newIdJemaat, alamat: dataToSave.alamat }); } catch(err){}
             }
         }
      }
      await saveDocument('jemaat', dataToSave, docId);
    } 
    else if (modalMode === 'addMajelis' || modalMode === 'editMajelis') { await saveDocument('majelis', dataToSave, docId); }
    else if (modalMode === 'addKematian') await saveDocument('jemaat', { statusHidup: 'Meninggal', statusKeanggotaan: 'Meninggal', tanggalKematian: dataToSave.tanggalKematian, tanggalPenguburan: dataToSave.tanggalPenguburan }, dataToSave.jemaatDbId);
    else if (modalMode === 'addPindah') await saveDocument('jemaat', { statusKeanggotaan: 'Pindah', pindahKeJemaat: dataToSave.pindahKeJemaat, tanggalPindah: dataToSave.tanggalPindah }, dataToSave.jemaatDbId);
    else if (modalMode === 'addPindahMasuk') await saveDocument('jemaat', { asalJemaat: dataToSave.asalJemaat, tanggalMasuk: dataToSave.tanggalMasuk }, dataToSave.jemaatDbId);
    else { dataToSave.statusKeanggotaan = dataToSave.statusKeanggotaan || 'Aktif'; await saveDocument('jemaat', dataToSave, docId); }
    setModalMode('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target; let updates = { [name]: value };
    if (modalMode === 'addKk' || modalMode === 'editKk') {
      const ry = name === 'noRayon' ? value : formData.noRayon, ur = name === 'urutanKk' ? value : formData.urutanKk;
      if(ry && ur) updates.idKk = `KK${pad0(ry)}${pad0(ur)}`;
      if (name === 'noRayon' && penatuaMap[value]) updates.penatua = penatuaMap[value];
    }
    if (modalMode === 'addJemaat' || modalMode === 'addAnggota' || modalMode === 'editJemaat') {
      const ry = name === 'noRayon' ? value : formData.noRayon, ur = name === 'urutanKk' ? value : formData.urutanKk, ag = name === 'noAnggota' ? value : formData.noAnggota;
      if(ry && ur && ag) updates.idJemaat = `AG${pad0(ry)}${pad0(ur)}${pad0(ag)}`;
    }
    if (name === 'baptis' && value === 'Belum') updates = { ...updates, gerejaBaptis: '', tanggalBaptis: '', pendetaBaptis: '' };
    if (name === 'sidi' && value === 'Belum') updates = { ...updates, gerejaSidi: '', tanggalSidi: '', pendetaSidi: '' };
    if (name === 'nikah' && value === 'Belum') updates = { ...updates, gerejaNikah: '', tanggalNikah: '', pendetaNikah: '', jenisNikah: [] };
    if (name === 'asuransi' && value === 'Tidak') updates = { ...updates, jaminan: '' };
    if (name === 'disabilitas' && value === 'Tidak') updates = { ...updates, jenisDisabilitas: '' };
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleCheckboxChange = (name, opt, isChecked, currentArr) => { handleFormChange({ target: { name, value: isChecked ? [...currentArr, opt] : currentArr.filter(x => x !== opt) } }); };
  const requestSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });

  const usedUrutanKkNum = useMemo(() => {
    if (!formData?.noRayon) return [];
    return (jemaatData || []).filter(d => d?.statusKeluarga === 'Kepala Keluarga' && String(d?.noRayon) === String(formData?.noRayon) && d?.dbId !== formData?.dbId).map(d => parseInt(d?.urutanKk)).filter(n => !isNaN(n));
  }, [jemaatData, formData?.noRayon, formData?.dbId]);

  const urutanKkOpts = useMemo(() => {
     const opts = []; for(let i=1; i<=100; i++) { if (!usedUrutanKkNum.includes(i)) opts.push(i); } return opts;
  }, [usedUrutanKkNum]);

  const usedNoAnggotaNum = useMemo(() => {
    if (!formData?.idKk) return [];
    return (jemaatData || []).filter(d => d?.idKk === formData?.idKk && d?.dbId !== formData?.dbId).map(d => parseInt(d?.noAnggota)).filter(n => !isNaN(n));
  }, [jemaatData, formData?.idKk, formData?.dbId]);

  const noAnggotaOpts = useMemo(() => {
     const opts = []; for(let i=1; i<=30; i++) { if (!usedNoAnggotaNum.includes(i)) opts.push(i); } return opts;
  }, [usedNoAnggotaNum]);

  const getTabHeaders = () => {
    const r = (v) => `R-${v}`; const bld = (v) => <span className="font-bold">{v}</span>; const lp = (v) => isL(v)?'L':(isP(v)?'P':'-');
    if (activeTab === 'Data KK') return [{l:'Kepala Keluarga',k:'kepalaKeluarga', fmt:v=><span className="font-bold text-blue-700">{v}</span>},{l:'Nomor HP',k:'noHp'}, {l:'Bentuk Rumah',k:'bentukRumah'}, {l:'Status Rumah',k:'statusRumah', fmt:v=><span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">{v}</span>}, {l:'Rayon',k:'noRayon', fmt:r}, {l:'Urutan KK',k:'urutanKk'}];
    if (activeTab === 'Data Jemaat') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-blue-900">{v}</span>},{l:'Rayon',k:'noRayon', fmt:r}, {l:'Kepala Keluarga',k:'kepalaKeluarga', fmt:bld},{l:'L/P',k:'jk', fmt:lp}, {l:'Status Keluarga',k:'statusKeluarga', fmt:v=><span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">{v}</span>}, {l:'Pekerjaan',k:'pekerjaan'}];
    if (activeTab === 'Status Jemaat') {
      if (activeSubTabStatus === 'Data Kematian') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-black text-gray-800">{v} <span className="text-red-500 text-xs italic">(Alm)</span></span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tanggal Kematian',k:'tanggalKematian', fmt:toDisplayDate},{l:'Tanggal Penguburan',k:'tanggalPenguburan', fmt:toDisplayDate},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Pindah Jemaat') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-black text-orange-700">{v} <span className="text-gray-500 text-xs italic">(Pindah)</span></span>},{l:'L/P',k:'jk', fmt:lp},{l:'Gereja Tujuan',k:'pindahKeJemaat'},{l:'Tanggal Pindah',k:'tanggalPindah', fmt:toDisplayDate},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Pindah Masuk Jemaat') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-blue-800">{v}</span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tanggal Masuk',k:'tanggalMasuk', fmt:toDisplayDate},{l:'Asal Jemaat',k:'asalJemaat'},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Anggota Baptis') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-teal-800">{v}</span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tempat Lahir',k:'tempatLahir'},{l:'Tanggal Lahir',k:'tanggalLahir', fmt:toDisplayDate},{l:'Tanggal Baptis',k:'tanggalBaptis', fmt:toDisplayDate},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Anggota Sidi') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-emerald-800">{v}</span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tempat Lahir',k:'tempatLahir'},{l:'Tanggal Lahir',k:'tanggalLahir', fmt:toDisplayDate},{l:'Tanggal Sidi',k:'tanggalSidi', fmt:toDisplayDate},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Anggota Nikah') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-purple-800">{v}</span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tanggal Lahir',k:'tanggalLahir', fmt:toDisplayDate},{l:'Tanggal Nikah',k:'tanggalNikah', fmt:toDisplayDate},{l:'Status Nikah',k:'jenisNikah', fmt:v=>Array.isArray(v)?v.join(', '):v},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Ulang Tahun' || activeSubTabStatus === 'Pelayanan Kategori') return [{l:'Nama Lengkap',k:'namaLengkap', fmt: activeSubTabStatus === 'Ulang Tahun' ? v=><span className="font-black text-pink-700 flex items-center gap-2">{v} <Gift className="w-4 h-4 inline"/></span> : bld},{l:'L/P',k:'jk', fmt:lp},{l:'Tanggal Lahir',k:'tanggalLahir', fmt:toDisplayDate},{l:'Usia',k:'tanggalLahir', fmt:v=><span className="font-black text-teal-700 text-lg">{calculateAge(v)}</span>},{l:'Rayon',k:'noRayon', fmt:r}];
    }
    if (activeTab === 'Profil Majelis') return [{l:'Foto', k:'fotoBase64', fmt:v=>v?<img src={v} className="w-10 h-10 rounded-full object-cover shadow border border-gray-200" alt="foto"/>:<span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-xs text-gray-400 border border-gray-200">?</span>}, {l:'Nama Lengkap', k:'namaLengkap', fmt:bld}, {l:'Rayon', k:'noRayon', fmt:r}, {l:'Jabatan', k:'jabatanPelayanan', fmt:v=><span className="text-purple-700 font-black">{v}</span>}, {l:'L/P', k:'jk', fmt:lp}, {l:'Pekerjaan', k:'pekerjaan'}];
    if (activeTab === 'Riwayat Sistem') return [{l:'Waktu',k:'timestamp', fmt:v=>new Date(v).toLocaleString('id-ID')},{l:'User',k:'user', fmt:bld}, {l:'Aksi',k:'action', fmt:v=><span className={`px-2 py-1 rounded text-xs font-bold text-white ${v==='TAMBAH'?'bg-green-500':v==='EDIT'?'bg-blue-500':v==='RESTORE'?'bg-indigo-500':v==='HAPUS SEMUA'?'bg-red-700':v==='IMPORT'?'bg-amber-500':'bg-red-500'}`}>{v}</span>}, {l:'Data Target',k:'target', fmt:(v,row)=>`${v} (${row.collection})`}];
    return [];
  };

  const tabCols = getTabHeaders();

  const filteredData = useMemo(() => {
    let d = []; const isActive = x => x?.statusKeanggotaan !== 'Meninggal' && x?.statusKeanggotaan !== 'Pindah' && x?.statusHidup !== 'Meninggal';
    if (activeTab === 'Data KK') d = jemaatData.filter(x => x?.statusKeluarga === 'Kepala Keluarga' && isActive(x));
    else if (activeTab === 'Data Jemaat') d = jemaatData.filter(isActive);
    else if (activeTab === 'Profil Majelis') d = [...majelisData];
    else if (activeTab === 'Status Jemaat') {
      if (activeSubTabStatus === 'Data Kematian') d = jemaatData.filter(x => x?.statusKeanggotaan === 'Meninggal' || x?.statusHidup === 'Meninggal');
      else if (activeSubTabStatus === 'Pindah Jemaat') d = jemaatData.filter(x => x?.statusKeanggotaan === 'Pindah');
      else if (activeSubTabStatus === 'Pindah Masuk Jemaat') d = jemaatData.filter(isActive).filter(x => x?.asalJemaat && String(x.asalJemaat).trim() !== '');
      else if (activeSubTabStatus === 'Anggota Baptis') d = jemaatData.filter(isActive).filter(x => x?.baptis === 'Ya');
      else if (activeSubTabStatus === 'Anggota Sidi') d = jemaatData.filter(isActive).filter(x => x?.sidi === 'Ya');
      else if (activeSubTabStatus === 'Anggota Nikah') d = jemaatData.filter(isActive).filter(x => x?.nikah === 'Ya');
      else if (activeSubTabStatus === 'Pelayanan Kategori') d = jemaatData.filter(isActive).filter(x => isMatchKat(x, filterKategori));
      else if (activeSubTabStatus === 'Ulang Tahun') d = jemaatData.filter(isActive).filter(x => getMonthFromDate(x?.tanggalLahir) === parseInt(filterBulan));
    } 
    else if (activeTab === 'Riwayat Sistem') d = filterHistoryAction !== 'Semua' ? historyData.filter(x => x?.action === filterHistoryAction) : [...historyData];

    if (activeTab !== 'Riwayat Sistem' && activeTab !== 'Pengaturan Rayon' && filterRayon !== 'Semua') d = d.filter(x => String(x?.noRayon) === filterRayon);
    if (searchTerm) { const ls = searchTerm.toLowerCase(); d = d.filter(x => Object.values(x).some(v => typeof v === 'string' && v.toLowerCase().includes(ls))); }

    if (sortConfig.key) {
      d.sort((a, b) => {
        let valA = a[sortConfig.key], valB = b[sortConfig.key];
        if (sortConfig.key === 'usia' || sortConfig.key === 'tanggalLahir') { valA = calculateAge(a.tanggalLahir); valB = calculateAge(b.tanggalLahir); } 
        else if (['urutanKk', 'noRayon', 'noAnggota'].includes(sortConfig.key)) { valA = parseInt(valA)||0; valB = parseInt(valB)||0; }
        valA = valA ?? ''; valB = valB ?? '';
        if (typeof valA === 'string') valA = valA.toLowerCase(); if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
       if (['Data KK', 'Data Jemaat', 'Status Jemaat'].includes(activeTab)) d.sort((a, b) => String(a.idJemaat||a.idKk||'').localeCompare(String(b.idJemaat||b.idKk||'')));
    }
    return d;
  }, [jemaatData, majelisData, historyData, activeTab, activeSubTabStatus, searchTerm, filterRayon, filterKategori, filterBulan, filterHistoryAction, sortConfig]);

  const totalItems = filteredData.length;
  const totalPages = itemsPerPage === 'Semua' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const currentData = useMemo(() => itemsPerPage === 'Semua' ? filteredData : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredData, currentPage, itemsPerPage]);
  
  useEffect(() => { setCurrentPage(1); }, [activeTab, activeSubTabStatus, subTabJemaat, subTabMajelis, searchTerm, itemsPerPage, filterRayon, filterKategori, filterBulan, filterHistoryAction]);

  // --- KUMPULAN TOMBOL AKSI ROUTER (USECALLBACK) ---
  const handleRowAction = useCallback((action, row) => {
     switch(action) {
        case 'view':
           setFormData(row); setModalMode('viewJemaat');
           break;
        case 'restore':
           handleRestoreData(row);
           break;
        case 'edit':
           setFormData(row); setModalMode(activeTab === 'Data KK' ? 'editKk' : activeTab === 'Profil Majelis' ? 'editMajelis' : 'editJemaat');
           break;
        case 'delete':
           requestDelete(activeTab === 'Profil Majelis' ? 'majelis' : 'jemaat', row.dbId, row.namaLengkap||row.kepalaKeluarga);
           break;
        case 'add_member':
           setFormData({ idKk: row.idKk, kepalaKeluarga: row.kepalaKeluarga, noHp: row.noHp, bentukRumah: row.bentukRumah, statusRumah: row.statusRumah, noRayon: row.noRayon, urutanKk: row.urutanKk, penatua: row.penatua, alamat: row.alamat, noAnggota: '', idJemaat: `AG${pad0(row.noRayon)}${pad0(row.urutanKk)}`, namaLengkap: '', jk: '', statusKeluarga: 'Anak kandung' });
           setModalMode('addAnggota');
           break;
        case 'print_kk':
           setPrintId(row.idKk); setPrintMode('kk');
           break;
        case 'print_majelis':
           setPrintId(row.dbId); setPrintMode('majelis');
           break;
        default:
           break;
     }
  }, [activeTab, requestDelete, handleRestoreData]);

  if (!appUser) return <LoginScreen onLogin={setAppUser} penatuaMap={penatuaMap} penatuaPassMap={penatuaPassMap} churchProfile={churchProfile} />;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 pb-10">
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-5 border-b bg-gray-50"><h3 className="text-xl font-black text-gray-800">{confirmDialog.title}</h3></div>
             <div className="p-6"><p className="text-gray-600 font-medium">{confirmDialog.message}</p></div>
             <div className="p-4 border-t bg-gray-100 flex justify-end gap-3">
               <button onClick={() => setConfirmDialog({ isOpen: false })} className="px-4 py-2 border rounded-xl text-gray-700 bg-white font-bold shadow-sm hover:bg-gray-200">Batal</button>
               <button onClick={confirmDialog.onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-md">Ya, Lanjutkan</button>
             </div>
          </div>
        </div>
      )}

      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-5 border-b bg-gray-50"><h3 className="text-xl font-black text-gray-800">{alertDialog.title}</h3></div>
             <div className="p-6"><p className="text-gray-600 font-medium whitespace-pre-line">{alertDialog.message}</p></div>
             <div className="p-4 border-t bg-gray-100 flex justify-end">
               <button onClick={() => setAlertDialog({ isOpen: false })} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md">Tutup</button>
             </div>
          </div>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mt-20 mb-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-xl font-black text-gray-800">{modalMode.includes('Kk') ? 'Formulir Kepala Keluarga' : modalMode === 'viewJemaat' ? 'Detail Lengkap Jemaat' : modalMode.includes('Majelis') ? 'Formulir Data Majelis' : 'Formulir Data Jemaat'}</h3>
              <button type="button" onClick={() => setModalMode('')} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
              <form id="crud-form" onSubmit={handleFormSubmit}>
                {(modalMode === 'addKk' || modalMode === 'editKk') && (
                  <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2"><Home className="w-5 h-5 inline mr-2"/> Data Kepala Keluarga</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput req label="Nomor Rayon" name="noRayon" type="select" opts={rayonList} value={formData.noRayon} onChange={handleFormChange} />
                      <FormInput req label="Urutan KK Ke-" name="urutanKk" type="select" opts={urutanKkOpts} value={formData.urutanKk} onChange={handleFormChange} />
                      <FormInput req label="ID KK (Otomatis)" name="idKk" value={formData.idKk} dis span={2} />
                      <FormInput req label="Nama Kepala Keluarga" name="kepalaKeluarga" value={formData.kepalaKeluarga} onChange={handleFormChange} />
                      <FormInput label="Nomor HP" name="noHp" value={formData.noHp} onChange={handleFormChange} />
                      <FormInput label="Bentuk Rumah" name="bentukRumah" type="select" opts={['Darurat','Semi Permanen','Permanen']} value={formData.bentukRumah} onChange={handleFormChange} />
                      <FormInput label="Status Rumah" name="statusRumah" type="select" opts={['Kost','Kontrak','Milik Sendiri','Menumpang','Rumah Dinas']} value={formData.statusRumah} onChange={handleFormChange} />
                      <FormInput label="Penatua (Rayon)" name="penatua" value={formData.penatua} dis span={2} />
                    </div>
                    <p className="text-sm text-gray-500 mt-4 italic">*Info: Alamat Lengkap & Data Pribadi diisi pada menu <strong>Data Jemaat</strong>.</p>
                  </div>
                )}

                {(modalMode === 'addAnggota' || modalMode === 'addJemaat' || modalMode === 'editJemaat') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                    <div className="md:col-span-2 bg-gray-100 p-5 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">
                        {(appUser?.role === 'admin' || appUser?.role === 'penatua') ? <Users className="w-5 h-5 inline mr-2 text-blue-600"/> : <Lock className="w-5 h-5 inline mr-2"/>} 
                        Pilih / Ubah Penempatan Keluarga
                      </h4>
                      {(modalMode === 'addJemaat' || modalMode === 'editJemaat') && (
                        <div className="mb-5 bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <label className="text-sm font-bold text-blue-900 block mb-2">Saring Berdasarkan Rayon Terlebih Dahulu:</label>
                          <div className="flex flex-col md:flex-row gap-3">
                            <select name="noRayon" value={formData.noRayon || ''} onChange={handleFormChange} className="w-full md:w-1/3 border-2 border-blue-300 p-2.5 rounded-lg bg-white outline-none">
                               <option value="">-- Pilih Rayon --</option>
                               {rayonList.map(r => <option key={r} value={r}>Rayon {r}</option>)}
                            </select>
                            <select value={formData.idKk || ''} onChange={(e) => {
                                const kk = jemaatData.find(k => String(k?.idKk) === String(e.target.value) && k?.statusKeluarga === 'Kepala Keluarga');
                                if(kk) {
                                   const newIdJemaat = formData.noAnggota ? `AG${pad0(kk.noRayon)}${pad0(kk.urutanKk)}${pad0(formData.noAnggota)}` : formData.idJemaat;
                                   setFormData(p => ({...p, idKk: kk.idKk, kepalaKeluarga: kk.kepalaKeluarga, noHp: kk.noHp, bentukRumah: kk.bentukRumah, statusRumah: kk.statusRumah, noRayon: kk.noRayon, urutanKk: kk.urutanKk, penatua: kk.penatua, alamat: kk.alamat, idJemaat: newIdJemaat }));
                                }
                              }} className="w-full md:w-2/3 border-2 border-blue-300 p-2.5 rounded-lg bg-white outline-none disabled:bg-gray-200" disabled={!formData.noRayon} >
                              <option value="">-- Pilih KK --</option>
                              {jemaatData.filter(d => d?.statusKeluarga === 'Kepala Keluarga' && String(d?.noRayon) === String(formData.noRayon)).map((k,idx) => <option key={idx} value={k.idKk}>{k.idKk} - {k.kepalaKeluarga}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput label="ID KK" value={formData.idKk} dis />
                        <FormInput label="Kepala Keluarga" value={formData.kepalaKeluarga} dis />
                        <FormInput label="Rayon" value={formData.noRayon} dis />
                      </div>
                    </div>
                    <h4 className="md:col-span-2 font-bold text-gray-800 border-b pb-2 mt-2 text-lg">Data Pribadi</h4>
                    {JEMAAT_FIELDS_PRIBADI.map(f => {
                       const fieldProps = { ...f }; if (f.name === 'noAnggota') fieldProps.opts = noAnggotaOpts;
                       return <FormInput key={f.name} {...fieldProps} value={formData[f.name]} onChange={handleFormChange} />
                    })}
                    <h4 className="md:col-span-2 font-bold text-gray-800 border-b pb-2 mt-4 text-lg">Agama & Pendidikan</h4>
                    <div className="md:col-span-2 grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
                      <FormInput label="Sudah Baptis?" name="baptis" type="select" opts={['Ya','Belum']} value={formData.baptis} onChange={handleFormChange} />
                      <FormInput label="Gereja Baptis" name="gerejaBaptis" dis={formData.baptis!=='Ya'} value={formData.gerejaBaptis} onChange={handleFormChange} />
                      <FormInput label="Tgl Baptis" name="tanggalBaptis" type="date" dis={formData.baptis!=='Ya'} value={formData.tanggalBaptis} onChange={handleFormChange} />
                      <FormInput label="Pendeta Baptis" name="pendetaBaptis" dis={formData.baptis!=='Ya'} value={formData.pendetaBaptis} onChange={handleFormChange} />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
                      <FormInput label="Sudah Sidi?" name="sidi" type="select" opts={['Ya','Belum']} value={formData.sidi} onChange={handleFormChange} />
                      <FormInput label="Gereja Sidi" name="gerejaSidi" dis={formData.sidi!=='Ya'} value={formData.gerejaSidi} onChange={handleFormChange} />
                      <FormInput label="Tgl Sidi" name="tanggalSidi" type="date" dis={formData.sidi!=='Ya'} value={formData.tanggalSidi} onChange={handleFormChange} />
                      <FormInput label="Pendeta Sidi" name="pendetaSidi" dis={formData.sidi!=='Ya'} value={formData.pendetaSidi} onChange={handleFormChange} />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
                      <FormInput label="Sudah Nikah?" name="nikah" type="select" opts={['Ya','Belum']} value={formData.nikah} onChange={handleFormChange} />
                      <FormInput label="Gereja Nikah" name="gerejaNikah" dis={formData.nikah!=='Ya'} value={formData.gerejaNikah} onChange={handleFormChange} />
                      <FormInput label="Tgl Nikah" name="tanggalNikah" type="date" dis={formData.nikah!=='Ya'} value={formData.tanggalNikah} onChange={handleFormChange} />
                      <FormInput label="Pendeta Nikah" name="pendetaNikah" dis={formData.nikah!=='Ya'} value={formData.pendetaNikah} onChange={handleFormChange} />
                      <FormInput label="Jenis Nikah" name="jenisNikah" isCheckboxGroup opts={['Nikah Adat', 'Nikah Gereja/Masehi', 'Nikah Catatan Sipil/BS']} dis={formData.nikah!=='Ya'} value={formData.jenisNikah} onCheckboxChange={handleCheckboxChange} span={4} />
                    </div>
                    {JEMAAT_EDU.map(f => <FormInput key={f.name} {...f} value={formData[f.name]} onChange={handleFormChange} />)}
                    <h4 className="md:col-span-2 font-bold text-gray-800 border-b pb-2 mt-4 text-lg">Kesehatan & Status Sosial</h4>
                    <FormInput label="Asuransi Kesehatan" name="asuransi" type="select" opts={['Ya','Tidak']} value={formData.asuransi} onChange={handleFormChange} />
                    <FormInput label="Jaminan" name="jaminan" type="select" opts={['BPJS/Askes','Asuransi Kesehatan lainnya']} dis={formData.asuransi!=='Ya'} value={formData.jaminan} onChange={handleFormChange} />
                    <FormInput label="Janda/Duda" name="jandaDuda" type="select" opts={['Tidak','Janda','Duda']} value={formData.jandaDuda} onChange={handleFormChange} />
                    <FormInput label="Yatim Piatu" name="yatimPiatu" type="select" opts={['Tidak','Yatim','Piatu','Yatim Piatu']} value={formData.yatimPiatu} onChange={handleFormChange} />
                    <FormInput label="Disabilitas" name="disabilitas" type="select" opts={['Ya','Tidak']} value={formData.disabilitas} onChange={handleFormChange} />
                    <FormInput label="Jenis Disabilitas" name="jenisDisabilitas" type="select" opts={['Tuna Netra', 'Tuna Rungu', 'Tuna Wicara', 'Tuna Daksa', 'Tuna Laras', 'Tuna Grahita']} dis={formData.disabilitas!=='Ya'} value={formData.jenisDisabilitas} onChange={handleFormChange} />
                    <FormInput label="Jabatan dalam Jemaat" name="jabatanJemaat" value={formData.jabatanJemaat} onChange={handleFormChange} />
                    <FormInput label="Jabatan di Masyarakat" name="jabatanMasyarakat" value={formData.jabatanMasyarakat} onChange={handleFormChange} />
                 </div>
                )}

                {(modalMode === 'addMajelis' || modalMode === 'editMajelis') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                    <div className="md:col-span-2 lg:col-span-3 mb-4 flex flex-col sm:flex-row items-center gap-6 bg-purple-50 p-6 rounded-xl border border-purple-100">
                      <div className="w-32 h-40 bg-white rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-purple-300 shadow-inner shrink-0 relative group">
                        {formData.fotoBase64 ? <img src={formData.fotoBase64} alt="Foto" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-purple-200" />}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs font-bold">Ganti Foto</span></div>
                      </div>
                      <div className="flex-1 w-full">
                         <label className="block text-sm font-black text-purple-900 mb-2">Upload Foto Profil Majelis</label>
                         <p className="text-xs text-purple-600 mb-4">Format disarankan: JPG/PNG, rasio 3x4. Maksimal ukuran 800KB.</p>
                         <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer border-2 border-purple-200 rounded-xl bg-white p-1"/>
                      </div>
                    </div>
                    {FORM_MAJELIS.map((sec, i) => (
                      <React.Fragment key={`sec-${i}`}>
                        <h4 className="md:col-span-2 lg:col-span-3 font-black text-gray-800 border-b-2 border-gray-100 pb-2 mt-4 text-lg w-full uppercase">{sec.t}</h4>
                        {sec.f.map((field, idx) => (
                          <React.Fragment key={`field-${i}-${idx}`}>
                              {field.t === 'sel' ? <FormInput label={field.l} name={field.k} type="select" opts={field.opts} value={formData[field.k]} onChange={handleFormChange} req={field.req} span={field.span} />
                              : field.t === 'chk' ? <FormInput label={field.l} name={field.k} isCheckboxGroup opts={field.opts} value={formData[field.k]} onCheckboxChange={handleCheckboxChange} span={field.span} />
                              : <FormInput type={field.t==='date'?'date':field.t==='num'?'number':'text'} label={field.l} name={field.k} value={formData[field.k]} onChange={handleFormChange} req={field.req} span={field.span} />}
                           </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                    <div className="md:col-span-2 lg:col-span-3 mt-6 border-t-2 border-purple-200 pt-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-black text-purple-900 text-lg uppercase">Data Identitas Anak</h4>
                        <button type="button" onClick={() => setFormData(p => ({...p, anak: [...(Array.isArray(p.anak)?p.anak:[]), {}]}))} className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors"><Plus className="w-4 h-4"/> Tambah Anak</button>
                      </div>
                      {(Array.isArray(formData.anak)?formData.anak:[]).map((a, i) => (
                        <div key={`anak-${i}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-white border-2 border-purple-100 rounded-xl mb-4 relative shadow-sm">
                          <div className="absolute top-0 left-0 bg-purple-600 text-white text-xs font-black px-4 py-1.5 rounded-br-xl rounded-tl-xl">Anak ke-{i+1}</div>
                          <button type="button" onClick={() => setFormData(p => ({...p, anak: (p.anak||[]).filter((_, idx)=>idx!==i)}))} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-2 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"><Trash2 className="w-4 h-4"/> Hapus</button>
                          <div className="md:col-span-2 lg:col-span-3 mt-6"><label className="text-xs font-bold text-gray-700 mb-1 block">Nama Lengkap Anak</label><input className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={a.nama||''} onChange={e=>{const n=[...formData.anak]; n[i].nama=e.target.value; setFormData(p=>({...p,anak:n}))}} placeholder="Masukkan nama anak"/></div>
                          <div><label className="text-xs font-semibold mb-1 block">Tempat Lahir</label><input className="w-full border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={a.tempatLahir||''} onChange={e=>{const n=[...formData.anak]; n[i].tempatLahir=e.target.value; setFormData(p=>({...p,anak:n}))}}/></div>
                          <div><label className="text-xs font-semibold mb-1 block">Tanggal Lahir</label><input type="date" className="w-full border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={toInputDate(a.tanggalLahir)} onChange={e=>{const n=[...formData.anak]; n[i].tanggalLahir=e.target.value; setFormData(p=>({...p,anak:n}))}}/></div>
                          <div><label className="text-xs font-semibold mb-1 block">Gereja Baptis</label><input className="w-full border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={a.gerejaBaptis||''} onChange={e=>{const n=[...formData.anak]; n[i].gerejaBaptis=e.target.value; setFormData(p=>({...p,anak:n}))}}/></div>
                          <div><label className="text-xs font-semibold mb-1 block">Tanggal Baptis</label><input type="date" className="w-full border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={toInputDate(a.tanggalBaptis)} onChange={e=>{const n=[...formData.anak]; n[i].tanggalBaptis=e.target.value; setFormData(p=>({...p,anak:n}))}}/></div>
                          <div><label className="text-xs font-semibold mb-1 block">Gereja Sidi</label><input className="w-full border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={a.gerejaSidi||''} onChange={e=>{const n=[...formData.anak]; n[i].gerejaSidi=e.target.value; setFormData(p=>({...p,anak:n}))}}/></div>
                          <div><label className="text-xs font-semibold mb-1 block">Tanggal Sidi</label><input type="date" className="w-full border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={toInputDate(a.tanggalSidi)} onChange={e=>{const n=[...formData.anak]; n[i].tanggalSidi=e.target.value; setFormData(p=>({...p,anak:n}))}}/></div>
                        </div>
                      ))}
                      {(!formData.anak || formData.anak.length === 0) && <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold">Belum ada data anak yang ditambahkan.</div>}
                    </div>
                  </div>
                )}

                {(modalMode === 'addKematian' || modalMode === 'addPindah' || modalMode === 'addPindahMasuk') && (
                  <div className="space-y-4 p-4">
                    <FormInput label="Pilih Rayon" name="noRayon" type="select" opts={rayonList} value={formData.noRayon} onChange={e=>{handleFormChange(e); setFormData(p=>({...p, idKk: '', jemaatDbId: ''}))}} />
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Pilih ID KK</label>
                      <select disabled={!formData.noRayon} name="idKk" value={formData.idKk||''} onChange={e=>{handleFormChange(e); setFormData(p=>({...p, jemaatDbId: ''}))}} className="w-full border p-2 rounded bg-gray-50 disabled:bg-gray-200 outline-none">
                         <option value="">-Pilih-</option>
                         {[...new Set(jemaatData.filter(d => d.noRayon === formData.noRayon && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah').map(d => d.idKk))].map(k=>{
                            const kNama = jemaatData.find(x => x.idKk === k && x.statusKeluarga === 'Kepala Keluarga')?.namaLengkap || 'Tanpa Nama';
                            return <option key={k} value={k}>{k} - {kNama}</option>;
                         })}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Pilih Jemaat</label>
                      <select disabled={!formData.idKk} name="jemaatDbId" value={formData.jemaatDbId||''} onChange={handleFormChange} className="w-full border p-2 rounded bg-gray-50 disabled:bg-gray-200 outline-none">
                         <option value="">-Pilih-</option>
                         {jemaatData.filter(d => d.idKk === formData.idKk && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah').map((j,i)=><option key={j.dbId} value={j.dbId}>{j.namaLengkap} ({j.statusKeluarga})</option>)}
                      </select>
                    </div>
                    <hr className="my-5 border-gray-300"/>
                    {modalMode === 'addPindahMasuk' ? ( <><FormInput req label="Asal Jemaat (Gereja Sebelumnya)" name="asalJemaat" value={formData.asalJemaat} onChange={handleFormChange} /><FormInput req type="date" label="Tanggal Pindah Masuk" name="tanggalMasuk" value={formData.tanggalMasuk} onChange={handleFormChange} /></> ) 
                    : modalMode === 'addPindah' ? ( <><FormInput req label="Gereja Tujuan" name="pindahKeJemaat" value={formData.pindahKeJemaat} onChange={handleFormChange} /><FormInput req type="date" label="Tanggal Pindah" name="tanggalPindah" value={formData.tanggalPindah} onChange={handleFormChange} /></> ) 
                    : ( <><FormInput req type="date" label="Tanggal Kematian" name="tanggalKematian" value={formData.tanggalKematian} onChange={handleFormChange} /><FormInput req type="date" label="Tanggal Penguburan" name="tanggalPenguburan" value={formData.tanggalPenguburan} onChange={handleFormChange} /></> )}
                  </div>
                )}

                {modalMode === 'viewJemaat' && (
                  <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                     {Object.keys(JEMAAT_HEADER_MAP).filter(h => !['ID KK', 'ID Jemaat', 'No Anggota', 'Urutan KK', 'No Rayon'].includes(h)).map(header => {
                        const key = JEMAAT_HEADER_MAP[header]; let val = formData[key];
                         if (['tanggalLahir', 'tanggalBaptis', 'tanggalSidi', 'tanggalNikah', 'tanggalKematian', 'tanggalPenguburan', 'tanggalPindah', 'tanggalMasuk'].includes(key)) val = toDisplayDate(val);
                         if (Array.isArray(val)) val = val.join(', ');
                         return (
                           <div key={key} className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{header}</p>
                             <p className="font-semibold text-gray-800 text-sm">{safeStr(val) || '-'}</p>
                           </div>
                         );
                     })}
                  </div>
                )}
              </form>
            </div>
            <div className="p-5 border-t bg-gray-100 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setModalMode('')} className="px-5 py-2.5 border rounded-xl text-gray-700 bg-white font-bold shadow-sm">{modalMode === 'viewJemaat' ? 'Tutup' : 'Batal'}</button>
              {modalMode !== 'viewJemaat' && <button type="submit" form="crud-form" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md flex items-center gap-2"><Upload className="w-4 h-4"/> Simpan Data</button>}
            </div>
          </div>
        </div>
      )}

      <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleImportCSV} />

      <div className={printMode === null ? 'hidden' : 'block'}>
         {printMode === 'kk' && <PrintKkTemplate kkToPrint={printId} jemaatData={jemaatData} penatuaMap={penatuaMap} churchProfile={churchProfile} onBack={() => setPrintMode(null)} />}
         {printMode === 'majelis' && <PrintMajelisTemplate majelisToPrint={printId} majelisData={majelisData} penatuaMap={penatuaMap} churchProfile={churchProfile} onBack={() => setPrintMode(null)} />}
         {printMode === 'list' && <PrintListTemplate listToPrint={activeSubTabStatus} tabCols={tabCols} filteredData={filteredData} filterRayon={filterRayon} filterKategori={filterKategori} churchProfile={churchProfile} onBack={() => setPrintMode(null)} />}
      </div>

      <div className={printMode !== null ? 'hidden' : 'block'}>
        <header className="sticky top-4 mx-4 mb-6 bg-white/95 backdrop-blur-md rounded-3xl shadow-sm z-40 px-6 py-4 border border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain bg-white rounded-full p-1 shadow-sm border border-gray-100" />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Sistem Data Terpadu</h1>
              <div className="text-xs font-bold hidden md:flex flex-col mt-1">
                <div className="flex items-center gap-1 mb-1 text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> 
                  DB Terkoneksi • Akses: <span className="uppercase">{appUser?.role}</span>
                </div>
                <div className="text-gray-500 text-[10px] leading-tight uppercase">
                  {churchProfile?.sinode || 'GMIT'}
                  {churchProfile?.klasis ? <><br />KLASIS {churchProfile.klasis}</> : ''}
                  {churchProfile?.jemaat ? <><br />JEMAAT {churchProfile.jemaat}</> : <><br />NAMA GEREJA</>}
                  {churchProfile?.mataJemaat ? <><br />MATA JEMAAT {churchProfile.mataJemaat}</> : ''} 
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden lg:flex gap-1 bg-gray-50 p-1.5 rounded-full border border-gray-200">
               {['Data KK', 'Data Jemaat', 'Profil Majelis', 'Status Jemaat', ...(appUser?.role === 'admin' ? ['Riwayat Sistem', 'Pengaturan Rayon'] : [])].map(tab => (
                <button key={tab} onClick={() => {setActiveTab(tab); setSortConfig({key:null, direction:'asc'});}} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}>
                  {tab === 'Riwayat Sistem' ? <span className="flex items-center gap-1"><History className="w-4 h-4"/> Admin Log</span> : tab === 'Pengaturan Rayon' ? <span className="flex items-center gap-1"><Settings className="w-4 h-4"/> Pengaturan</span> : <span className="flex items-center gap-1">{tab === 'Profil Majelis' ? <UserCheck className="w-4 h-4"/> : null} {tab}</span>}
                </button>
              ))}
            </div>
            <button onClick={() => { setSearchTerm(''); setFilterRayon('Semua'); setFilterKategori('Semua Kategori'); setSortConfig({key:null, direction:'asc'}); fetchSemuaData(); }} className="flex items-center gap-1 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 px-4 py-2.5 rounded-full text-sm font-black transition-colors shadow-sm"><RefreshCw className="w-4 h-4"/> <span className="hidden sm:inline">Refresh</span></button>
            <button onClick={() => setAppUser(null)} className="flex items-center gap-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 px-4 py-2.5 rounded-full text-sm font-black transition-colors shadow-sm"><LogOut className="w-4 h-4"/> <span className="hidden sm:inline">Keluar</span></button>
          </div>
        </header>

        <main className="px-4 md:px-8 max-w-[98%] mx-auto print:pt-4 print:px-0">
          <div className="flex lg:hidden overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide print:hidden">
             {['Data KK', 'Data Jemaat', 'Profil Majelis', 'Status Jemaat', ...(appUser?.role === 'admin' ? ['Riwayat Sistem', 'Pengaturan Rayon'] : [])].map((tab) => (
              <button key={tab} onClick={() => {setActiveTab(tab); setSortConfig({key:null, direction:'asc'});}} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-white border-2 text-gray-600 hover:bg-gray-100'}`}>{tab}</button>
            ))}
          </div>

          {activeTab === 'Data Jemaat' && (
            <div className="mb-4 print:hidden">
               <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase tracking-wider">Sub Menu Data Jemaat</label>
               <div className="relative inline-block w-full sm:w-auto">
                 <select value={subTabJemaat} onChange={(e) => setSubTabJemaat(e.target.value)} className="w-full sm:w-64 appearance-none bg-white border-2 border-blue-200 text-blue-700 text-sm font-bold py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm transition-all">
                    <option value="Tabel Data">Tabel Data Pokok</option>
                    <option value="Infografis">Dashboard Infografis</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none w-5 h-5" />
               </div>
            </div>
          )}

          {activeTab === 'Profil Majelis' && (
            <div className="mb-4 print:hidden">
              <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase tracking-wider">Sub Menu Profil Majelis</label>
               <div className="relative inline-block w-full sm:w-auto">
                 <select value={subTabMajelis} onChange={(e) => setSubTabMajelis(e.target.value)} className="w-full sm:w-64 appearance-none bg-white border-2 border-purple-200 text-purple-700 text-sm font-bold py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm transition-all">
                    <option value="Tabel Data">Tabel Data Majelis</option>
                    <option value="Infografis">Dashboard Infografis</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 pointer-events-none w-5 h-5" />
               </div>
            </div>
          )}

          {activeTab === 'Status Jemaat' && (
            <div className="mb-4 print:hidden">
               <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase tracking-wider">Sub Menu Laporan Status</label>
               <div className="relative inline-block w-full sm:w-auto">
                 <select value={activeSubTabStatus} onChange={(e) => setActiveSubTabStatus(e.target.value)} className={`w-full sm:w-72 appearance-none bg-white border-2 text-sm font-bold py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 cursor-pointer shadow-sm transition-all ${activeSubTabStatus === 'Ulang Tahun' ? 'border-pink-200 text-pink-700 focus:ring-pink-500' : 'border-indigo-200 text-indigo-700 focus:ring-indigo-500'}`}>
                    {['Pelayanan Kategori', 'Anggota Baptis', 'Anggota Sidi', 'Anggota Nikah', 'Pindah Masuk Jemaat', 'Pindah Jemaat', 'Data Kematian', 'Ulang Tahun'].map(sub => (
                       <option key={sub} value={sub}>{sub}</option>
                    ))}
                 </select>
                 <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none w-5 h-5 ${activeSubTabStatus === 'Ulang Tahun' ? 'text-pink-500' : 'text-indigo-500'}`} />
               </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 print:hidden"><RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" /><p className="text-gray-500 font-bold animate-pulse">Memuat Database...</p></div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
              {activeTab === 'Pengaturan Rayon' ? (
                 <div className="p-8">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div><h2 className="text-2xl font-black text-gray-800 flex items-center gap-2"><Settings className="w-6 h-6 text-gray-600"/> Manajemen Data & Pengaturan Rayon</h2><p className="text-gray-500 mt-2">Ubah profil gereja, nama penatua dan atur password login khusus untuk masing-masing Rayon.</p></div>
                      <button onClick={() => { const max = Math.max(...Object.keys(penatuaMap).map(Number)); setPenatuaMap({...penatuaMap, [max+1]: "Penatua Baru"}); setPenatuaPassMap({...penatuaPassMap, [max+1]: "penatua123"}); }} className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95 flex items-center gap-2"><Plus className="w-5 h-5"/> Tambah Rayon Baru</button>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Profil Gereja</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Nama Klasis</label>
                           <input type="text" className="w-full border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" value={churchProfile.klasis} onChange={e => setChurchProfile({...churchProfile, klasis: e.target.value})} placeholder="Contoh: KUPANG TENGAH" />
                         </div>
                         <div>
                           <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Nama Jemaat</label>
                           <input type="text" className="w-full border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" value={churchProfile.jemaat} onChange={e => setChurchProfile({...churchProfile, jemaat: e.target.value})} placeholder="Contoh: SYALOM HAUSUSU" />
                         </div>
                         <div>
                           <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Nama Mata Jemaat</label>
                           <input type="text" className="w-full border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" value={churchProfile.mataJemaat} onChange={e => setChurchProfile({...churchProfile, mataJemaat: e.target.value})} placeholder="Biarkan kosong jika tidak ada" />
                         </div>
                         <div>
                           {/* --- TAMBAHAN INPUT NAMA SEKRETARIS --- */}
                           <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Nama Sekretaris Jemaat</label>
                           <input type="text" className="w-full border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" value={churchProfile.namaSekretaris || ''} onChange={e => setChurchProfile({...churchProfile, namaSekretaris: e.target.value})} placeholder="Masukkan Nama Sekretaris..." />
                         </div>
                         <div className="md:col-span-2">
                           <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Alamat Lengkap Gereja</label>
                           <textarea className="w-full border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" rows="2" value={churchProfile.alamat} onChange={e => setChurchProfile({...churchProfile, alamat: e.target.value})} placeholder="Alamat detail..."></textarea>
                         </div>
                      </div>
                   </div>
                   <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Data Penatua Rayon</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                      {rayonList.map(r => (
                        <div key={r} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
                           {parseInt(r) > 6 && <button onClick={()=>{const n={...penatuaMap}; delete n[r]; setPenatuaMap(n); const p={...penatuaPassMap}; delete p[r]; setPenatuaPassMap(p);}} className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>}
                           <label className="text-sm font-bold text-gray-700 mb-1 block">Penatua Rayon {r}</label>
                           <input type="text" className="w-full border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none mb-4 text-sm font-semibold" value={penatuaMap[r]} onChange={e => setPenatuaMap({...penatuaMap, [r]: e.target.value})} />
                           <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Password Login Rayon {r}</label>
                           <input type="text" className="w-full border-2 border-dashed border-gray-300 bg-gray-50 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" value={penatuaPassMap[r] || ''} onChange={e => setPenatuaPassMap({...penatuaPassMap, [r]: e.target.value})} />
                        </div>
                      ))}
                   </div>
                   <div className="mt-6 flex justify-end">
                      <button onClick={async () => { try { 
                          await setDoc(getDBDoc('settings', 'penatua_config'), penatuaMap, {merge:true});
                          await setDoc(getDBDoc('settings', 'penatua_pass'), penatuaPassMap, {merge:true}); 
                          await setDoc(getDBDoc('settings', 'church_profile'), churchProfile, {merge:true}); 
                          showAlert("Sukses", "Data Profil Gereja & Penatua berhasil disimpan!");
                      } catch(e){ showAlert("Error", "Gagal menyimpan."); } 
                      }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">Simpan Pengaturan</button>
                   </div>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mr-4">
                        {activeTab === 'Data KK' && <Home className="w-6 h-6 text-blue-600" />}
                        {activeTab === 'Data Jemaat' && <Users className="w-6 h-6 text-green-600" />}
                        {activeTab === 'Profil Majelis' && <UserCheck className="w-6 h-6 text-purple-600" />}
                        {activeTab === 'Status Jemaat' && <Filter className="w-6 h-6 text-indigo-600" />}
                        {activeTab === 'Riwayat Sistem' && <History className="w-6 h-6 text-red-600" />}
                        {activeTab}
                      </h2>
                      {activeTab === 'Data KK' && (appUser?.role === 'admin' || appUser?.role === 'penatua') && <button onClick={() => { setFormData({ penatua: appUser?.role === 'penatua' ? appUser?.name : '' }); setModalMode('addKk'); }} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95"><Plus className="w-4 h-4"/> Buat KK Baru</button>}
                      {activeTab === 'Data Jemaat' && subTabJemaat !== 'Infografis' && (appUser?.role === 'admin' || appUser?.role === 'penatua') && (
                        <button onClick={() => { setFormData({ penatua: appUser?.role === 'penatua' ? appUser?.name : '' }); setModalMode('addJemaat'); }} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95"><Plus className="w-4 h-4"/> Tambah Data Jemaat</button>
                      )}
                      {activeTab === 'Data Jemaat' && subTabJemaat !== 'Infografis' && appUser?.role === 'admin' && (
                        <div className="relative">
                            <button onClick={() => setShowMenuOps(!showMenuOps)} className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95">Opsi Lain <ChevronDown className={`w-4 h-4 transform transition-transform ${showMenuOps ? 'rotate-180' : ''}`} /></button>
                            {showMenuOps && ( 
                               <>
                                  <div className="fixed inset-0 z-40" onClick={() => setShowMenuOps(false)}></div>
                                  <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                                     <button onClick={() => { setShowMenuOps(false); handleExportCSV(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm font-bold text-gray-700"><Download className="w-4 h-4 text-emerald-600"/> Download Excel Bawaan</button>
                                     <button onClick={() => { setShowMenuOps(false); handleExportSinode(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm font-bold text-gray-700"><Download className="w-4 h-4 text-blue-600"/> Laporan ke Sinode</button>
                                     <button onClick={() => { setShowMenuOps(false); fileInputRef.current.click(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm font-bold text-gray-700"><FileUp className="w-4 h-4 text-amber-500"/> Import CSV</button>
                                     <div className="h-px bg-gray-100 w-full"></div>
                                     <button onClick={() => { setShowMenuOps(false); handleCleanAll('jemaat'); }} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-left text-sm font-bold text-red-600"><Trash2 className="w-4 h-4"/> Kosongkan Data</button>
                                  </div>
                               </> 
                            )}
                        </div>
                      )}
                      {activeTab === 'Profil Majelis' && subTabMajelis !== 'Infografis' && appUser?.role === 'admin' && (
                        <div className="flex items-center gap-2 relative">
                          <button onClick={() => { setFormData({ anak: [] }); setModalMode('addMajelis'); setShowMenuOps(false); }} className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95"><Plus className="w-4 h-4"/> Tambah Majelis</button>
                          <div className="relative">
                            <button onClick={() => setShowMenuOps(!showMenuOps)} className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95">Opsi Lain <ChevronDown className={`w-4 h-4 transform transition-transform ${showMenuOps ? 'rotate-180' : ''}`} /></button>
                            {showMenuOps && ( <><div className="fixed inset-0 z-40" onClick={() => setShowMenuOps(false)}></div><div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"><button onClick={() => { setShowMenuOps(false); handleExportCSV(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm font-bold text-gray-700"><Download className="w-4 h-4 text-emerald-600"/> Download Excel Bawaan</button><button onClick={() => { setShowMenuOps(false); fileInputRef.current.click(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm font-bold text-gray-700"><FileUp className="w-4 h-4 text-amber-500"/> Import CSV</button><div className="h-px bg-gray-100 w-full"></div><button onClick={() => { setShowMenuOps(false); handleCleanAll('majelis'); }} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-left text-sm font-bold text-red-600"><Trash2 className="w-4 h-4"/> Kosongkan Data</button></div></> )}
                          </div>
                        </div>
                      )}
                      {activeTab === 'Status Jemaat' && (appUser?.role === 'admin' || appUser?.role === 'penatua') && activeSubTabStatus === 'Data Kematian' && <button onClick={() => { setFormData({}); setModalMode('addKematian'); }} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95"><Plus className="w-4 h-4"/> Lapor Kematian</button>}
                      {activeTab === 'Status Jemaat' && (appUser?.role === 'admin' || appUser?.role === 'penatua') && activeSubTabStatus === 'Pindah Jemaat' && <button onClick={() => { setFormData({}); setModalMode('addPindah'); }} className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95"><Plus className="w-4 h-4"/> Lapor Pindah Jemaat</button>}
                      {activeTab === 'Status Jemaat' && (appUser?.role === 'admin' || appUser?.role === 'penatua') && activeSubTabStatus === 'Pindah Masuk Jemaat' && <button onClick={() => { setFormData({}); setModalMode('addPindahMasuk'); }} className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95"><Plus className="w-4 h-4"/> Lapor Pindah Masuk</button>}
                      {activeTab === 'Status Jemaat' && appUser?.role !== 'jemaat' && <button onClick={() => { setPrintMode('list'); }} className="flex items-center gap-2 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-bold"><Printer className="w-4 h-4"/> Cetak Laporan</button>}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                      {activeTab === 'Riwayat Sistem' && <select value={filterHistoryAction} onChange={(e) => setFilterHistoryAction(e.target.value)} className="bg-red-50 border-2 border-red-200 text-red-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0"><option value="Semua">Semua Aksi</option><option value="TAMBAH">Tambah Data</option><option value="EDIT">Edit Data</option><option value="HAPUS">Hapus Data</option><option value="RESTORE">Tarik/Restore</option><option value="IMPORT">Import Data</option><option value="HAPUS SEMUA">Hapus Semua Data</option></select>}
                      {activeTab === 'Status Jemaat' && activeSubTabStatus === 'Pelayanan Kategori' && <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="bg-indigo-50 border-2 border-indigo-200 text-indigo-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0">{KATEGORI_PELAYANAN.map((k, i) => <option key={i} value={k}>{k}</option>)}</select>}
                      {activeTab === 'Status Jemaat' && activeSubTabStatus === 'Ulang Tahun' && <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="bg-pink-50 border-2 border-pink-200 text-pink-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0">{NAMA_BULAN.map((k, i) => <option key={i} value={i+1}>{k}</option>)}</select>}
                      {(activeTab !== 'Riwayat Sistem') && <select value={filterRayon} onChange={(e) => setFilterRayon(e.target.value)} className="bg-blue-50 border-2 border-blue-200 text-blue-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0"><option value="Semua">Semua Rayon</option>{rayonList.map(i => <option key={i} value={i}>Rayon {i}</option>)}</select>}
                      {!(activeTab === 'Data Jemaat' && subTabJemaat === 'Infografis') && !(activeTab === 'Profil Majelis' && subTabMajelis === 'Infografis') && (
                         <div className="relative w-full sm:w-auto flex-1"><Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Cari data..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full xl:w-60 pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700" /></div>
                      )}
                      {!(activeTab === 'Data Jemaat' && subTabJemaat === 'Infografis') && !(activeTab === 'Profil Majelis' && subTabMajelis === 'Infografis') && (
                         <select value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value === 'Semua' ? 'Semua' : Number(e.target.value))} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0"><option value={5}>Tampil 5</option><option value={10}>Tampil 10</option><option value={20}>Tampil 20</option><option value="Semua">Tampil Semua</option></select>
                      )}
                    </div>
                  </div>

                  <div className="p-0">
                    <div className="hidden print:block mb-4 border-b-2 border-black pb-4">
                       <h1 className="text-2xl font-bold uppercase text-center">Data {activeTab === 'Status Jemaat' ? activeSubTabStatus : activeTab === 'Data Jemaat' ? subTabJemaat : activeTab === 'Profil Majelis' ? subTabMajelis : activeTab}</h1>
                       <p className="text-center font-bold text-sm mt-1">{activeTab === 'Status Jemaat' && activeSubTabStatus === 'Pelayanan Kategori' ? `Kategori: ${filterKategori} | ` : ''}{activeTab === 'Status Jemaat' && activeSubTabStatus === 'Ulang Tahun' ? `Bulan: ${NAMA_BULAN[filterBulan-1]} | ` : ''}Rayon: {filterRayon}</p>
                       <p className="text-center font-medium text-sm">Jemaat {churchProfile?.jemaat}</p>
                    </div>

                    {activeTab === 'Data Jemaat' && subTabJemaat === 'Infografis' ? (
                      <div className="bg-gray-50 min-h-[50vh]"><InfografisTab data={jemaatData} filterRayon={filterRayon} type="jemaat" /></div>
                    ) : activeTab === 'Profil Majelis' && subTabMajelis === 'Infografis' ? (
                      <div className="bg-gray-50 min-h-[50vh]"><InfografisTab data={majelisData} filterRayon={filterRayon} type="majelis" /></div>
                    ) : (
                      <div className="overflow-x-auto min-h-[50vh]">
                        <table className="w-full text-left border-collapse min-w-max">
                          <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-500 text-xs font-black uppercase tracking-wider">
                               <SortableHeader label="No" sortKey="no" sortConfig={sortConfig} requestSort={requestSort} className="w-12 text-center" />
                               {tabCols.map(c => <SortableHeader key={c.l} label={c.l} sortKey={c.k} sortConfig={sortConfig} requestSort={requestSort} className={c.l==='Usia'?'text-center bg-pink-100 text-pink-800':''} />)}
                               {activeTab !== 'Riwayat Sistem' && <th className="px-4 py-3 border-b w-40 text-center select-none sticky right-0 bg-gray-100 shadow">Aksi</th>}
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                             {currentData.length === 0 ? <tr><td colSpan="20" className="px-4 py-12 text-center text-gray-400 font-bold"><Users className="w-12 h-12 mx-auto mb-3 opacity-50"/> Tidak ada data ditemukan.</td></tr> : currentData.map((row, idx) => {
                                return (
                                   <BarisTabelJemaat
                                      key={row.dbId||idx}
                                      row={row}
                                      idx={idx}
                                      startIndex={itemsPerPage === 'Semua' ? 0 : (currentPage - 1) * itemsPerPage}
                                      tabCols={tabCols}
                                      activeTab={activeTab}
                                      activeSubTabStatus={activeSubTabStatus}
                                      appUser={appUser}
                                      isEditable={canEdit(row)}
                                      onAction={handleRowAction}
                                   />
                                );
                             })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {!(activeTab === 'Profil Majelis' && subTabMajelis === 'Infografis') && !(activeTab === 'Data Jemaat' && subTabJemaat === 'Infografis') && (
                    <div className="bg-gray-50 p-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden rounded-b-3xl">
                      <p className="text-sm text-gray-500 font-bold">Menampilkan total: <span className="font-black text-blue-800 text-base">{totalItems}</span> Data</p>
                      {itemsPerPage !== 'Semua' && totalPages > 1 && (
                        <div className="flex items-center gap-3">
                          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"><ChevronLeft className="w-5 h-5" /></button>
                          <span className="text-sm text-gray-800 font-bold px-2">Hal {currentPage} dari {totalPages}</span>
                          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}