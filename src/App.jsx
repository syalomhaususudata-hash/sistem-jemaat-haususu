import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { RefreshCw, X, Upload, Printer, ArrowLeft, History, ChevronUp, ChevronDown, ChevronRight, ArrowUpDown, Trash2, Edit, Plus, Camera, Eye, LogOut, Gift, MoreVertical } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { initializeFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, setDoc, getDocs } from 'firebase/firestore';

// --- IMPORT FILE UTILS & COMPONENTS ---
import { 
  DEFAULT_PENATUA, DEFAULT_CHURCH_PROFILE, PEKERJAAN_LIST, KATEGORI_PELAYANAN, NAMA_BULAN, 
  JEMAAT_HEADER_MAP, MAJELIS_HEADER_MAP, FORM_MAJELIS, JEMAAT_FIELDS_PRIBADI, JEMAAT_EDU 
} from './utils/constants';

import { 
  pad0, safeStr, isL, isP, toInputDate, toDisplayDate, calculateAge, 
  parseCSV, getMonthFromDate, getFormatDate, isMatchKat 
} from './utils/helpers';

import LoginScreen from './components/LoginScreen';
import { PrintKkTemplate, PrintMajelisTemplate, PrintListTemplate, PrintAuditTemplate } from './components/PrintTemplates';
import DataKkTab from './components/DataKkTab';
import DataJemaatTab from './components/DataJemaatTab';
import ProfilMajelisTab from './components/ProfilMajelisTab';
import StatusJemaatTab from './components/StatusJemaatTab';
import PengaturanTab from './components/PengaturanTab';

// --- FIREBASE INIT ---
const inCanvas = typeof __firebase_config !== 'undefined' && __firebase_config;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Memaksa Firestore menggunakan Long Polling
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

const appId = typeof __app_id !== 'undefined' ? __app_id : 'sistem-jemaat-app';

const getDBCollection = (colName) => {
   if (inCanvas) return collection(db, 'artifacts', appId, 'public', 'data', colName);
   return collection(db, colName);
};

const getDBDoc = (colName, docId) => {
   if (inCanvas) return doc(db, 'artifacts', appId, 'public', 'data', colName, docId);
   return doc(db, colName, docId);
};

// --- GLOBAL UI COMPONENTS ---
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

function FormInput({ label, name, value, onChange, type="text", req=false, dis=false, opts=null, span=1, isCheckboxGroup=false, onCheckboxChange, list }) {
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
         <input type={type} name={name} list={list} value={type==='date'?toInputDate(value):value||''} onChange={onChange} disabled={dis} className={cls} required={req} maxLength={name==='nik'?16:undefined} placeholder={label}/>
      )}
    </div>
  );
}

function InfografisTab({ data, filterRayon, type }) {
  const dAktif = data.filter(d => (type === 'majelis' || (d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah' && d.statusHidup !== 'Meninggal')) && (filterRayon === 'Semua' || String(d.noRayon) === filterRayon));
  if (type === 'majelis') {
     const countStats = (jabatan) => {
        const d = dAktif.filter(x => String(x.jabatanPelayanan).toLowerCase() === jabatan.toLowerCase());
        const l = d.filter(x => isL(x.jk) || String(x.jk||'').toLowerCase().startsWith('l')).length; 
        const p = d.filter(x => isP(x.jk) || String(x.jk||'').toLowerCase().startsWith('p')).length;
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

  let nkA = 0, nkG = 0, nkS = 0;
  const groupedByKk = dAktif.reduce((acc, obj) => {
      const key = obj.idKk;
      if (key) { if (!acc[key]) acc[key] = []; acc[key].push(obj); }
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
  const nkB = dAktif.filter(d => {
      const jn = Array.isArray(d.jenisNikah) ? d.jenisNikah : [];
      return jn.includes('Pasangan belum menikah');
  }).length;
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center"><p className="text-3xl font-black text-orange-600">{nkA}</p><p className="text-xs font-bold text-orange-800 mt-2 uppercase">Adat</p></div>
               <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center"><p className="text-3xl font-black text-rose-600">{nkG}</p><p className="text-xs font-bold text-rose-800 mt-2 uppercase">Gereja/Masehi</p></div>
               <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-center"><p className="text-3xl font-black text-purple-600">{nkS}</p><p className="text-xs font-bold text-purple-800 mt-2 uppercase">Sipil / BS</p></div>
               <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center"><p className="text-3xl font-black text-slate-600">{nkB}</p><p className="text-xs font-bold text-slate-800 mt-2 uppercase">Belum Menikah</p></div>
            </div>
         </div>
       </div>
    </div>
  );
}

// KODE BARU: Ganti seluruh komponen BarisTabelJemaat lama di App.jsx dengan ini
const BarisTabelJemaat = React.memo(({ row, idx, startIndex, tabCols, activeTab, activeSubTabStatus, appUser, isEditable, onAction, jemaatData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <React.Fragment>
      <tr className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
         {/* 1. Kolom Nomor */}
         <td className="px-4 py-4 text-center font-bold text-gray-400">
           {startIndex + idx + 1}
         </td>

         {/* 2. Kolom Render Data Pokok (Pastikan HANYA ADA SATU tabCols.map) */}
         {tabCols.map((c, j) => (
           <td key={`${row.dbId}-${j}`} className="px-4 py-4">
             {activeTab === 'Data KK' && c.k === 'kepalaKeluarga' ? (
                <div className="flex items-center justify-between gap-2">
                   <span>{c.fmt ? c.fmt(row[c.k], row) : safeStr(row[c.k])}</span>
                   <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors shadow-sm bg-blue-50 border border-blue-100">
                     {isExpanded ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                   </button>
                </div>
             ) : (
                c.fmt ? c.fmt(row[c.k], row) : safeStr(row[c.k])
             )}
           </td>
         ))}

         {/* 3. Kolom Tombol Aksi */}
         {activeTab !== 'Riwayat Sistem' && (
          <td className="px-4 py-3 text-center flex items-center justify-center gap-1.5 sticky right-0 bg-white/95 backdrop-blur shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.05)] h-full">
              {activeTab === 'Status Jemaat' ? (
                <div className="flex flex-col gap-1 w-full">
                   {['Data Kematian', 'Pindah Jemaat', 'Pindah Masuk Jemaat'].includes(activeSubTabStatus) && (
                      <>
                         <button onClick={() => onAction('view', row)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition flex items-center justify-center gap-1 w-full text-xs font-bold" title="Lihat Detail"><Eye className="w-3 h-3" /> Detail</button>
                         {(appUser?.role === 'admin' && activeSubTabStatus !== 'Pindah Masuk Jemaat') && <button onClick={() => onAction('restore', row)} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition flex items-center justify-center gap-1 w-full text-xs font-bold"><RefreshCw className="w-3 h-3" /> Tarik</button>}
                         {appUser?.role === 'admin' && (
                            <button onClick={() => onAction('delete', row)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition flex items-center justify-center gap-1 w-full text-xs font-bold" title="Hapus Permanen"><Trash2 className="w-3 h-3" /> Hapus</button>
                         )}
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
                appUser?.role === 'jemaat' ? (
                   <button onClick={() => onAction('view', row)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition font-bold text-xs flex items-center justify-center gap-1 w-full"><Eye className="w-3 h-3"/> Detail</button>
                ) : (
                   activeTab === 'Data KK' ? <button onClick={() => onAction('print_kk', row)} className="p-1.5 ml-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-black text-xs flex items-center transition"><Printer className="w-3 h-3 inline mr-1"/> Cetak KK</button>
                   : activeTab === 'Profil Majelis' ? <button onClick={() => onAction('print_majelis', row)} className="p-1.5 ml-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-black text-xs flex items-center transition"><Printer className="w-3 h-3 inline mr-1"/> Cetak Profil</button>
                   : <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-1 rounded">Locked</span>
                )
             )}
          </td>
         )}
      </tr>

      {/* Baris Ekspansi Anggota Keluarga Dalam Satu KK (Desktop) - URUT BERDASARKAN NO ANGGOTA */}
      {isExpanded && activeTab === 'Data KK' && jemaatData && (
        <tr className="bg-gray-50 border-b border-gray-200">
          <td colSpan={tabCols.length + 2} className="p-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm pl-10">
                {jemaatData
                   .filter(d => d.idKk === row.idKk && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah')
                   .sort((a,b) => parseInt(a.noAnggota || 99) - parseInt(b.noAnggota || 99))
                   .map((anggota, i) => (
                  <div key={anggota.dbId} className="flex gap-2 items-center border-b pb-1">
                    <span className="font-bold w-4">{i+1}.</span>
                    <span className="font-semibold text-gray-800">{anggota.namaLengkap}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{anggota.statusKeluarga}</span>
                  </div>
                ))}
             </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
});

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
  const [adminPass, setAdminPass] = useState('admin123');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  
  // UI Tabs & Filters
  const [activeTab, setActiveTab] = useState('Data KK');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
  
  // Audit UI state
  const [showAuditDetail, setShowAuditDetail] = useState(false);
  const [auditFilter, setAuditFilter] = useState('Data KK');
  const [auditRayon, setAuditRayon] = useState('Semua');

  const showAlert = (title, message) => setAlertDialog({ isOpen: true, title, message });

  // KODE BARU (Tambahkan state dan ref ini)
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (inCanvas && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } else {
           await signInAnonymously(auth);
        }
      } catch (error) { console.error("Auth init error", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setFirebaseUser);
    return () => unsubscribe();
  }, []);

  const fetchSemuaData = async () => {
    setIsLoading(true);
    try {
        const jemaatSnap = await getDocs(getDBCollection('jemaat'));
        setJemaatData(jemaatSnap.docs.map(d => ({ dbId: d.id, ...d.data() })));
        const majelisSnap = await getDocs(getDBCollection('majelis'));
        setMajelisData(majelisSnap.docs.map(d => ({ dbId: d.id, ...d.data() })));
        const historySnap = await getDocs(getDBCollection('history'));
        setHistoryData(historySnap.docs.map(d => ({ dbId: d.id, ...d.data() })).sort((a,b)=>b.timestamp - a.timestamp));
    } catch (err) { console.error("Gagal mengambil data pokok:", err); }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!firebaseUser) return;
    fetchSemuaData();
    const errHandler = (err) => { console.error("Firestore Settings Error:", err); };
    const u4 = onSnapshot(getDBDoc('settings', 'penatua_config'), (d) => { if(d.exists()) setPenatuaMap(d.data()); }, errHandler);
    const u5 = onSnapshot(getDBDoc('settings', 'penatua_pass'), (d) => { if(d.exists()) setPenatuaPassMap(d.data()); }, errHandler);
    const u6 = onSnapshot(getDBDoc('settings', 'church_profile'), (d) => { if(d.exists()) setChurchProfile(d.data()); }, errHandler);
    const u7 = onSnapshot(getDBDoc('settings', 'admin_config'), (d) => { if(d.exists() && d.data().password) setAdminPass(d.data().password); }, errHandler);
    return () => { u4(); u5(); u6(); u7(); };
  }, [firebaseUser]);

  const rayonList = useMemo(() => Object.keys(penatuaMap).sort((a,b)=>parseInt(a)-parseInt(b)), [penatuaMap]);
  const canEdit = (row) => appUser?.role === 'admin' || (appUser?.role === 'penatua' && (!row || String(row.noRayon) === Object.keys(penatuaMap).find(key => penatuaMap[key] === appUser.name)));

  const recordHistory = async (action, col, target) => {
    try { await addDoc(getDBCollection('history'), { action, collection: col, target: target || 'Data', user: appUser?.name || appUser?.role || 'System', timestamp: Date.now() });
    } catch(e) {}
  };

  const handleSaveSettings = async () => {
     try { 
        await setDoc(getDBDoc('settings', 'penatua_config'), penatuaMap, {merge:true});
        await setDoc(getDBDoc('settings', 'penatua_pass'), penatuaPassMap, {merge:true}); 
        await setDoc(getDBDoc('settings', 'church_profile'), churchProfile, {merge:true}); 
        showAlert("Sukses", "Data Profil Gereja & Pengaturan berhasil disimpan!");
     } catch(e){ showAlert("Error", "Gagal menyimpan."); } 
  };

  const handleSaveAdminPass = async () => {
      try {
          await setDoc(getDBDoc('settings', 'admin_config'), { password: adminPass }, {merge:true});
          showAlert("Sukses", "Password Admin berhasil diubah!");
          return true;
      } catch(e) { showAlert("Error", "Gagal menyimpan password."); return false; }
  };

  const handleRestoreData = useCallback((row) => {
    setConfirmDialog({
      isOpen: true, title: "Tarik Data",
      message: `Tarik kembali data [${row.namaLengkap}] ke Jemaat Aktif?`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        try { 
          await updateDoc(getDBDoc('jemaat', row.dbId), { statusKeanggotaan: 'Aktif', statusHidup: 'Hidup', tanggalKematian: '', tanggalPenguburan: '', pindahKeJemaat: '', tanggalPindah: '' }); 
          await recordHistory('RESTORE', 'jemaat', row.namaLengkap); await fetchSemuaData();
        } catch (e) {}
      }
    });
  }, []);

  const handleCleanAll = (colName) => {
    setConfirmDialog({
      isOpen: true, title: "PERINGATAN KRITIS!",
      message: `HAPUS SELURUH DATA ${colName.toUpperCase()}? Tindakan ini tidak bisa dibatalkan!`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false }); setIsLoading(true);
        const dataToDel = colName === 'majelis' ? [...majelisData] : [...jemaatData];
        let successCount = 0;
        for (const d of dataToDel) { try { await deleteDoc(getDBDoc(colName, d.dbId)); successCount++; } catch(e){} }
        await recordHistory('HAPUS SEMUA', colName, `Seluruh Data (${successCount})`); await fetchSemuaData();
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
    l.download = `Data_${typeName}_${(churchProfile.jemaat || '').replace(/\s+/g, '_')}.xls`; document.body.appendChild(l); l.click(); document.body.removeChild(l);
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
    
      const activeKk = activeData.find(x => x.idKk === d.idKk && x.statusKeluarga === 'Kepala Keluarga');
      const fixNoHp = activeKk?.noHp || d.noHp || '0';
      const fixNamaKk = activeKk?.kepalaKeluarga || activeKk?.namaLengkap || d.kepalaKeluarga || '';
      const row = [`Rayon ${d.noRayon || ''}`, d.alamat || '', fixNoHp, fixNamaKk, d.namaLengkap || '', d.nik ? `="${d.nik}"` : '', d.jk || '', d.tempatLahir || '', hari, bulan, tahun, d.goldar || '', d.statusKeluarga || '', d.baptis || '', d.sidi || '', d.nikah || '', statusNikahStr, isAdat, isGereja, isSipil, d.sukuAyah || '', d.sukuIbu || '', d.pendidikan || '', d.pekerjaan || '', d.penghasilan || '', d.asuransi || '', d.jaminan === 'BPJS/Askes' ? 'BPJS/Askes' : '', (d.jaminan && d.jaminan !== 'BPJS/Askes') ? d.jaminan : '', d.jandaDuda === 'Tidak' ? '' : (d.jandaDuda || ''), d.yatimPiatu === 'Tidak' ? '' : (d.yatimPiatu || ''), d.disabilitas || 'Tidak', d.jenisDisabilitas || '', index++, parentIndex, calculateAge(d.tanggalLahir)];
      t += `<tr>${row.map(v => `<td>${safeStr(v)}</td>`).join('')}</tr>`;
    });
    t += `</table></body></html>`;
    const blob = new Blob([t], { type: "application/vnd.ms-excel" }); const l = document.createElement("a"); l.href = URL.createObjectURL(blob);
    l.download = `Laporan_Sinode_Jemaat_${(churchProfile.jemaat || '').replace(/\s+/g, '_')}.xls`; document.body.appendChild(l); l.click(); document.body.removeChild(l);
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const isMajelis = activeTab === 'Profil Majelis'; const typeName = isMajelis ? 'majelis' : 'jemaat';
    setIsLoading(true);
    const reader = new FileReader();
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
                   const p = dateVal.split('/');
                   if(p.length === 3) { if(p[2].length === 4) v = `${p[2]}-${pad0(p[1])}-${pad0(p[0])}`; else if(p[0].length === 4) v = `${p[0]}-${pad0(p[1])}-${pad0(p[2])}`; }
               } else if (dateVal.includes('-')) {
                   const p = dateVal.split('-');
                   if(p.length === 3) { if(p[2].length === 4) v = `${p[2]}-${pad0(p[1])}-${pad0(p[0])}`; }
               }
           }
           if(isMajelis) {
               if(MAJELIS_HEADER_MAP[h]) { const safeKey = MAJELIS_HEADER_MAP[h].replace(/[~*/\[\]]/g, '');
               if(safeKey === 'statusMenikah') d[safeKey] = v.split(',').map(s=>s.trim()); else d[safeKey] = v; } 
               else { const m = h.match(/(.+) Anak (\d)/);
               if(m && (parseInt(m[2])-1)>=0 && (parseInt(m[2])-1)<6) { const fk=m[1], ai=parseInt(m[2])-1; if(fk==='Nama') ank[ai].nama=v; if(fk==='Tempat Lahir') ank[ai].tempatLahir=v; if(fk.includes('Lahir')) ank[ai].tanggalLahir=v; if(fk==='Gereja Baptis') ank[ai].gerejaBaptis=v;
               if(fk.includes('Baptis')) ank[ai].tanggalBaptis=v; if(fk==='Gereja Sidi') ank[ai].gerejaSidi=v; if(fk.includes('Sidi')) ank[ai].tanggalSidi=v; } }
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
      showAlert('Selesai!', `Berhasil masuk: ${successCount} data.\nDitolak (Dobel Nama): ${duplicateCount} data.`); setIsLoading(false);
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
          await updateDoc(getDBDoc(collectionName, id), cleanData);
          await recordHistory('EDIT', collectionName, cleanData.namaLengkap || cleanData.kepalaKeluarga || id); 
      } else { 
          await addDoc(getDBCollection(collectionName), cleanData);
          await recordHistory('TAMBAH', collectionName, cleanData.namaLengkap || cleanData.kepalaKeluarga || 'Data Baru'); 
      }
      await fetchSemuaData();
    } catch (error) { showAlert("Error", "Gagal menyimpan data."); }
  };

  const requestDelete = useCallback((collectionName, id, name) => {
    setConfirmDialog({
      isOpen: true, title: "Konfirmasi Hapus", message: `Apakah Anda yakin ingin menghapus data ${name} secara permanen?`,
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false });
        try { await deleteDoc(getDBDoc(collectionName, id)); await recordHistory('HAPUS', collectionName, name || id); await fetchSemuaData(); showAlert("Sukses", "Data berhasil dihapus!"); } catch (error) { showAlert("Error", "Gagal menghapus."); }
      }
    });
  }, [majelisData, jemaatData]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    const docId = dataToSave.dbId; delete dataToSave.dbId;
    if (['addKematian', 'addPindah', 'addPindahMasuk'].includes(modalMode) && !dataToSave.jemaatDbId) { return showAlert("Peringatan", "Data Jemaat belum dipilih."); }

    try {
        if (modalMode === 'warisanKk') {
            const newKk = jemaatData.find(d => d.dbId === dataToSave.calonKkDbId);
            if (newKk) {
                await updateDoc(getDBDoc('jemaat', newKk.dbId), { statusKeluarga: 'Kepala Keluarga', kepalaKeluarga: newKk.namaLengkap || 'Tanpa Nama', bentukRumah: dataToSave.bentukRumah || '-', statusRumah: dataToSave.statusRumah || '-', noRayon: dataToSave.noRayon || '', urutanKk: dataToSave.urutanKk || '', penatua: dataToSave.penatua || '', alamat: dataToSave.alamat || '-' });
                if (dataToSave.deadKkDbId) await updateDoc(getDBDoc('jemaat', dataToSave.deadKkDbId), { statusKeluarga: 'Mantan KK' });
                const familyMembers = jemaatData.filter(d => d.idKk === dataToSave.idKk && d.dbId !== newKk.dbId && d.dbId !== dataToSave.deadKkDbId);
                for (const mem of familyMembers) await updateDoc(getDBDoc('jemaat', mem.dbId), { kepalaKeluarga: newKk.namaLengkap || 'Tanpa Nama' });
                await recordHistory('EDIT', 'jemaat', `Pewarisan KK ke ${newKk.namaLengkap}`); await fetchSemuaData();
                showAlert("Sukses", `Pewarisan berhasil! ${newKk.namaLengkap} kini menjadi Kepala Keluarga yang sah.`);
            } else { showAlert("Error", "Gagal memproses pewarisan."); }
            setModalMode('');
            return;
        }

        if (modalMode === 'addKk' || modalMode === 'editKk') {
          dataToSave.namaLengkap = dataToSave.kepalaKeluarga;
          dataToSave.statusKeluarga = 'Kepala Keluarga';
          if(modalMode === 'addKk') { dataToSave.statusHidup = 'Hidup'; dataToSave.statusKeanggotaan = 'Aktif'; }
          if (modalMode === 'editKk' && docId) {
             const oldData = (jemaatData || []).find(d => d.dbId === docId);
             if (oldData && oldData.idKk !== dataToSave.idKk) {
                 const familyMembers = (jemaatData || []).filter(d => d.idKk === oldData.idKk && d.dbId !== docId);
                 for (const mem of familyMembers) {
                     const newIdJemaat = `AG${pad0(dataToSave.noRayon)}${pad0(dataToSave.urutanKk)}${pad0(mem.noAnggota)}`;
                     try { await updateDoc(getDBDoc('jemaat', mem.dbId), { idKk: dataToSave.idKk, noRayon: dataToSave.noRayon, urutanKk: dataToSave.urutanKk, penatua: dataToSave.penatua, idJemaat: newIdJemaat, alamat: dataToSave.alamat });
                     } catch(err){}
                 }
             }
          }
          await saveDocument('jemaat', dataToSave, docId);
        } 
        else if (modalMode === 'addMajelis' || modalMode === 'editMajelis') { await saveDocument('majelis', dataToSave, docId); }
        else if (modalMode === 'addKematian' || modalMode === 'addPindah') {
            const jemaatTarget = jemaatData.find(d => d.dbId === dataToSave.jemaatDbId);
            const activeMembers = jemaatData.filter(d => d.idKk === jemaatTarget?.idKk && d.dbId !== dataToSave.jemaatDbId && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah');
            if (modalMode === 'addKematian') { await saveDocument('jemaat', { statusHidup: 'Meninggal', statusKeanggotaan: 'Meninggal', tanggalKematian: dataToSave.tanggalKematian || '', tanggalPenguburan: dataToSave.tanggalPenguburan || '' }, dataToSave.jemaatDbId); } 
            else { await saveDocument('jemaat', { statusKeanggotaan: 'Pindah', pindahKeJemaat: dataToSave.pindahKeJemaat || '', tanggalPindah: dataToSave.tanggalPindah || '' }, dataToSave.jemaatDbId); }
            if (jemaatTarget?.statusKeluarga === 'Kepala Keluarga' && activeMembers.length > 0) {
               const istriCandidate = activeMembers.find(m => m.statusKeluarga === 'Istri') || activeMembers[0];
               setFormData({ idKk: jemaatTarget.idKk || '', calonKkDbId: istriCandidate.dbId || '', kepalaKeluarga: istriCandidate.namaLengkap || '', deadKkDbId: jemaatTarget.dbId || '', bentukRumah: jemaatTarget.bentukRumah || '-', statusRumah: jemaatTarget.statusRumah || '-', noRayon: jemaatTarget.noRayon || '', urutanKk: jemaatTarget.urutanKk || '', penatua: jemaatTarget.penatua || '', alamat: jemaatTarget.alamat || '-' });
               setModalMode('warisanKk'); return; 
            }
        }
        else if (modalMode === 'addPindahMasuk') { await saveDocument('jemaat', { asalJemaat: dataToSave.asalJemaat || '', tanggalMasuk: dataToSave.tanggalMasuk || '' }, dataToSave.jemaatDbId); }
        else { dataToSave.statusKeanggotaan = dataToSave.statusKeanggotaan || 'Aktif'; await saveDocument('jemaat', dataToSave, docId); }
        setModalMode('');
    } catch (error) { console.error("Crash saat menyimpan:", error); showAlert("Error Sistem", "Terjadi kesalahan internal. Gagal menyimpan perubahan."); }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };

    // 1. GLOBAL: Jika mengubah noRayon, otomatis set nama penatua
    if (name === 'noRayon') {
       updates.penatua = penatuaMap[value] || '';
    }

    // 2. AUTOFILL MAJELIS DARI DATA JEMAAT
    if ((modalMode === 'addMajelis' || modalMode === 'editMajelis') && name === 'namaLengkap') {
       const foundJemaat = jemaatData.find(d => d.namaLengkap === value);
       if (foundJemaat) {
          updates.tempatLahir = foundJemaat.tempatLahir || '';
          updates.tanggalLahir = foundJemaat.tanggalLahir || '';
          updates.jk = foundJemaat.jk || '';
          updates.goldar = foundJemaat.goldar || '';
          updates.pekerjaan = foundJemaat.pekerjaan || '';
          updates.noRayon = foundJemaat.noRayon || '';
          updates.penatua = penatuaMap[foundJemaat.noRayon] || ''; // Otomatis isi penatua jika rayon ikut terisi
       }
    }

    // 3. GENERATOR ID KEPALA KELUARGA (KK)
    if (modalMode === 'addKk' || modalMode === 'editKk') {
      const ry = name === 'noRayon' ? value : formData.noRayon, ur = name === 'urutanKk' ? value : formData.urutanKk;
      if(ry && ur) updates.idKk = `KK${pad0(ry)}${pad0(ur)}`;
    }

    // 4. GENERATOR ID ANGGOTA JEMAAT
    if (modalMode === 'addJemaat' || modalMode === 'addAnggota' || modalMode === 'editJemaat') {
      const ry = name === 'noRayon' ? value : formData.noRayon, ur = name === 'urutanKk' ? value : formData.urutanKk, ag = name === 'noAnggota' ? value : formData.noAnggota;
      if(ry && ur && ag) updates.idJemaat = `AG${pad0(ry)}${pad0(ur)}${pad0(ag)}`;
    }

    // 5. RESET FIELD BERSYARAT (Kondisional)
    if (name === 'baptis' && value === 'Belum') updates = { ...updates, gerejaBaptis: '', tanggalBaptis: '', pendetaBaptis: '' };
    if (name === 'sidi' && value === 'Belum') updates = { ...updates, gerejaSidi: '', tanggalSidi: '', pendetaSidi: '' };
    if (name === 'nikah' && value === 'Belum') updates = { ...updates, gerejaNikah: '', tanggalNikah: '', pendetaNikah: '', jenisNikah: [] };
    if (name === 'asuransi' && value === 'Tidak') updates = { ...updates, jaminan: '' };
    if (name === 'disabilitas' && value === 'Tidak') updates = { ...updates, jenisDisabilitas: '' };
    
    // Simpan semua pembaruan ke dalam state
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleCheckboxChange = (name, opt, isChecked, currentArr) => { handleFormChange({ target: { name, value: isChecked ? [...currentArr, opt] : currentArr.filter(x => x !== opt) } }); };
  const requestSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });

  const usedUrutanKkNum = useMemo(() => {
    if (!formData?.noRayon) return [];
    return (jemaatData || []).filter(d => d?.statusKeluarga === 'Kepala Keluarga' && String(d?.noRayon) === String(formData?.noRayon) && d?.dbId !== formData?.dbId && d?.statusKeanggotaan !== 'Meninggal' && d?.statusKeanggotaan !== 'Pindah').map(d => parseInt(d?.urutanKk)).filter(n => !isNaN(n));
  }, [jemaatData, formData?.noRayon, formData?.dbId]);

  const urutanKkOpts = useMemo(() => { const opts = []; for(let i=1; i<=100; i++) { if (!usedUrutanKkNum.includes(i)) opts.push(i); } return opts; }, [usedUrutanKkNum]);

  const usedNoAnggotaNum = useMemo(() => {
    if (!formData?.idKk) return [];
    return (jemaatData || []).filter(d => d?.idKk === formData?.idKk && d?.dbId !== formData?.dbId).map(d => parseInt(d?.noAnggota)).filter(n => !isNaN(n));
  }, [jemaatData, formData?.idKk, formData?.dbId]);

  const noAnggotaOpts = useMemo(() => { const opts = []; for(let i=1; i<=30; i++) { if (!usedNoAnggotaNum.includes(i)) opts.push(i); } return opts; }, [usedNoAnggotaNum]);

  const getTabHeaders = () => {
    const r = (v) => `R-${v}`;
    const bld = (v) => <span className="font-bold">{v}</span>; const lp = (v) => isL(v)?'L':(isP(v)?'P':'-');
    if (activeTab === 'Data KK') return [{l:'Kepala Keluarga',k:'kepalaKeluarga', fmt:v=><span className="font-bold text-blue-700">{v}</span>},{l:'Nomor HP',k:'noHp'}, {l:'Bentuk Rumah',k:'bentukRumah'}, {l:'Status Rumah',k:'statusRumah', fmt:v=><span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">{v}</span>}, {l:'Rayon',k:'noRayon', fmt:r}, {l:'Urutan KK',k:'urutanKk'}];
    if (activeTab === 'Data Jemaat') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-blue-900">{v}</span>},{l:'Rayon',k:'noRayon', fmt:r}, {l:'Kepala Keluarga',k:'kepalaKeluarga', fmt:bld},{l:'L/P',k:'jk', fmt:lp}, {l:'Status Keluarga',k:'statusKeluarga', fmt:v=><span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">{v}</span>}, {l:'Pekerjaan',k:'pekerjaan'}];
    if (activeTab === 'Status Jemaat') {
      if (activeSubTabStatus === 'Data Kematian') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-black text-gray-800">{v} <span className="text-red-500 text-xs italic">(Alm)</span></span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tanggal Kematian',k:'tanggalKematian', fmt:toDisplayDate},{l:'Tanggal Penguburan',k:'tanggalPenguburan', fmt:toDisplayDate},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Pindah Jemaat') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-black text-orange-700">{v} <span className="text-gray-500 text-xs italic">(Pindah)</span></span>},{l:'L/P',k:'jk', fmt:lp},{l:'Gereja Tujuan',k:'pindahKeJemaat'},{l:'Tanggal Pindah',k:'tanggalPindah', fmt:toDisplayDate},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Pindah Masuk Jemaat') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-blue-800">{v}</span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tanggal Masuk',k:'tanggalMasuk', fmt:toDisplayDate},{l:'Asal Jemaat',k:'asalJemaat'},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Anggota Baptis') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-teal-800">{v}</span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tempat Lahir',k:'tempatLahir'},{l:'Tanggal Lahir',k:'tanggalLahir', fmt:toDisplayDate},{l:'Tanggal Baptis',k:'tanggalBaptis', fmt:toDisplayDate},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Anggota Sidi') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-emerald-800">{v}</span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tempat Lahir',k:'tempatLahir'},{l:'Tanggal Lahir',k:'tanggalLahir', fmt:toDisplayDate},{l:'Tanggal Sidi',k:'tanggalSidi', fmt:toDisplayDate},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Anggota Nikah') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-purple-800">{v}</span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tanggal Lahir',k:'tanggalLahir', fmt:toDisplayDate},{l:'Tanggal Nikah',k:'tanggalNikah', fmt:toDisplayDate},{l:'Status Nikah',k:'jenisNikah', fmt:v=>Array.isArray(v)?v.join(', '):v},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Pasangan Belum Menikah') return [{l:'Nama Lengkap',k:'namaLengkap', fmt:v=><span className="font-bold text-slate-700">{v}</span>},{l:'L/P',k:'jk', fmt:lp},{l:'Tanggal Lahir',k:'tanggalLahir', fmt:toDisplayDate},{l:'Rayon',k:'noRayon', fmt:r}];
      if (activeSubTabStatus === 'Ulang Tahun' || activeSubTabStatus === 'Pelayanan Kategori') return [{l:'Nama Lengkap',k:'namaLengkap', fmt: activeSubTabStatus === 'Ulang Tahun' ? v=><span className="font-black text-pink-700 flex items-center gap-2">{v} <Gift className="w-4 h-4 inline"/></span> : bld},{l:'L/P',k:'jk', fmt:lp},{l:'Tanggal Lahir',k:'tanggalLahir', fmt:toDisplayDate},{l:'Usia',k:'tanggalLahir', fmt:v=><span className="font-black text-teal-700 text-lg">{calculateAge(v)}</span>},{l:'Rayon',k:'noRayon', fmt:r}];
    }
    if (activeTab === 'Profil Majelis') return [
        {l:'Foto', k:'fotoBase64', fmt:v=>v?<img src={v} className="w-10 h-10 rounded-full object-cover shadow border border-gray-200" alt="foto"/>:<span className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-xs text-gray-400 border border-gray-200">?</span>}, 
        {l:'Nama Lengkap', k:'namaLengkap', fmt:(v, row) => {
          const isPurna = row.tglAkhirPelayanan && new Date() > new Date(row.tglAkhirPelayanan);
          return <div><span className="font-bold">{v}</span> {isPurna && <span className="ml-2 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Purna Tugas</span>}</div>;
        }}, 
        {l:'Rayon', k:'noRayon', fmt:r}, 
        {l:'Jabatan', k:'jabatanPelayanan', fmt:v=><span className="text-purple-700 font-black">{v}</span>}, 
        {l:'Masa Bakti', k:'tglAkhirPelayanan', fmt:(v, row)=> row.tglMulaiPelayanan ? `${new Date(row.tglMulaiPelayanan).getFullYear()} - ${v ? new Date(v).getFullYear() : 'Seterusnya'}` : '-'},
        {l:'L/P', k:'jk', fmt:lp}
      ];
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
      else if (activeSubTabStatus === 'Pasangan Belum Menikah') d = jemaatData.filter(isActive).filter(x => (x.jenisNikah||[]).includes('Pasangan belum menikah'));
      else if (activeSubTabStatus === 'Pelayanan Kategori') d = jemaatData.filter(isActive).filter(x => isMatchKat(x, filterKategori));
      else if (activeSubTabStatus === 'Ulang Tahun') d = jemaatData.filter(isActive).filter(x => getMonthFromDate(x?.tanggalLahir) === parseInt(filterBulan));
    } 
    else if (activeTab === 'Riwayat Sistem') d = filterHistoryAction !== 'Semua' ? historyData.filter(x => x?.action === filterHistoryAction) : [...historyData];

    if (activeTab !== 'Riwayat Sistem' && activeTab !== 'Pengaturan' && filterRayon !== 'Semua') d = d.filter(x => String(x?.noRayon) === filterRayon);
    
    if (searchTerm) { 
       const ls = searchTerm.toLowerCase(); 
       d = d.filter(x => Object.values(x).some(v => typeof v === 'string' && v.toLowerCase().includes(ls)));
    }

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
       if (['Data KK', 'Data Jemaat', 'Status Jemaat'].includes(activeTab)) {
          d.sort((a, b) => String(a.idJemaat||a.idKk||'').localeCompare(String(b.idJemaat||b.idKk||'')));
       } else if (activeTab === 'Profil Majelis') {
          d.sort((a, b) => parseInt(a.noRayon || 0) - parseInt(b.noRayon || 0));
       }
    }
    return d;
  }, [jemaatData, majelisData, historyData, activeTab, activeSubTabStatus, searchTerm, filterRayon, filterKategori, filterBulan, filterHistoryAction, sortConfig]);

  const totalItems = filteredData.length;
  const totalPages = itemsPerPage === 'Semua' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const currentData = useMemo(() => itemsPerPage === 'Semua' ? filteredData : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredData, currentPage, itemsPerPage]);

  const auditData = useMemo(() => {
     const reqKk = ['noHp', 'bentukRumah', 'statusRumah', 'alamat'];
     const baseJemaat = ['nik', 'tempatLahir', 'tanggalLahir', 'goldar', 'sukuAyah', 'sukuIbu', 'pendidikan', 'pekerjaan', 'penghasilan', 'jandaDuda', 'yatimPiatu'];
      const reqMajelis = [
          'tempatLahir', 'tanggalLahir', 'goldar', 'anakKe', 'jumlahSaudara', 'jabatanMasyarakat', 'jabatanGereja',
          'tempatNikah', 'tanggalNikah',
          'namaSd', 'tahunMulaiSd', 'tahunTamatSd',
          'namaSmp', 'tahunMulaiSmp', 'tahunTamatSmp',
          'namaSma', 'tahunMulaiSma', 'tahunTamatSma',
          'namaPt', 'jurusanPt', 'jenjangPt', 'tahunMasukPt', 'tahunTamatPt',
          'namaLembagaKerja', 'jabatanKerja', 'tahunMulaiKerja', 'tahunSelesaiKerja',
          'gerejaPelayananLama', 'jabatanPelayananLama', 'tahunMulaiPelayanan', 'tahunSelesaiPelayanan'
      ];
     let kkCount = 0, anggotaCount = 0, majelisCount = 0; const currentList = [];
     const isMissing = (val) => !val || val === '-' || String(val).trim() === '';
     (jemaatData || []).forEach(d => {
         if(d.statusKeanggotaan === 'Meninggal' || d.statusKeanggotaan === 'Pindah') return;
         if (d.statusKeluarga === 'Kepala Keluarga') {
            const missingKk = reqKk.filter(f => isMissing(d[f]));
            if (missingKk.length > 0) kkCount++;
            if (auditFilter === 'Data KK' && missingKk.length > 0) currentList.push({ id: d.dbId, nama: d.kepalaKeluarga || d.namaLengkap, tipe: 'Kepala Keluarga', missing: missingKk.join(', ') });
         }
         const missingJem = baseJemaat.filter(f => isMissing(d[f]));
         if (isMissing(d.baptis)) missingJem.push('Status Baptis');
         else if (d.baptis === 'Ya') { if (isMissing(d.gerejaBaptis)) missingJem.push('Gereja Baptis'); if (isMissing(d.tanggalBaptis)) missingJem.push('Tgl Baptis'); if (isMissing(d.pendetaBaptis)) missingJem.push('Pendeta Baptis'); }
         if (isMissing(d.sidi)) missingJem.push('Status Sidi');
         else if (d.sidi === 'Ya') { if (isMissing(d.gerejaSidi)) missingJem.push('Gereja Sidi'); if (isMissing(d.tanggalSidi)) missingJem.push('Tgl Sidi'); if (isMissing(d.pendetaSidi)) missingJem.push('Pendeta Sidi'); }
         if (isMissing(d.nikah)) missingJem.push('Status Nikah');
         else if (d.nikah === 'Ya') { if (isMissing(d.gerejaNikah)) missingJem.push('Gereja Nikah'); if (isMissing(d.tanggalNikah)) missingJem.push('Tgl Nikah'); if (isMissing(d.pendetaNikah)) missingJem.push('Pendeta Nikah');
         if (!d.jenisNikah || d.jenisNikah.length === 0) missingJem.push('Jenis Nikah'); }
         if (isMissing(d.asuransi)) missingJem.push('Status Asuransi');
         else if (d.asuransi === 'Ya' && isMissing(d.jaminan)) missingJem.push('Nama Jaminan Kesehatan');
         if (isMissing(d.disabilitas)) missingJem.push('Status Disabilitas');
         else if (d.disabilitas === 'Ya' && isMissing(d.jenisDisabilitas)) missingJem.push('Jenis Disabilitas');
         if (missingJem.length > 0) anggotaCount++;
         if (auditFilter === 'Data Jemaat' && missingJem.length > 0) currentList.push({ id: d.dbId, nama: d.namaLengkap || d.kepalaKeluarga, tipe: d.statusKeluarga, missing: missingJem.join(', ') });
     });
     (majelisData || []).forEach(d => {
         const missingMaj = reqMajelis.filter(f => isMissing(d[f]));
         if (missingMaj.length > 0) majelisCount++;
         if (auditFilter === 'Profil Majelis' && missingMaj.length > 0) currentList.push({ id: d.dbId, nama: d.namaLengkap, tipe: 'Majelis', missing: missingMaj.join(', ') });
     });
     return { kk: kkCount, anggota: anggotaCount, majelis: majelisCount, list: currentList };
  }, [jemaatData, majelisData, auditFilter]);

  const handlePrintAudit = () => {
     if (!auditData.list || auditData.list.length === 0) return showAlert("Info", "Luar biasa! Tidak ada data yang kosong pada kategori ini.");
     setPrintMode('audit');
  };

  useEffect(() => { setCurrentPage(1); }, [activeTab, activeSubTabStatus, subTabJemaat, subTabMajelis, searchTerm, itemsPerPage, filterRayon, filterKategori, filterBulan, filterHistoryAction]);

  const handleRowAction = useCallback((action, row) => {
   switch(action) {
      case 'view': setFormData(row); setModalMode(activeTab === 'Data KK' ? 'viewKk' : activeTab === 'Profil Majelis' ? 'viewMajelis' : 'viewJemaat'); break;
        case 'restore': handleRestoreData(row); break;
        case 'edit': setFormData(row); setModalMode(activeTab === 'Data KK' ? 'editKk' : activeTab === 'Profil Majelis' ? 'editMajelis' : 'editJemaat'); break;
        case 'delete': requestDelete(activeTab === 'Profil Majelis' ? 'majelis' : 'jemaat', row.dbId, row.namaLengkap||row.kepalaKeluarga); break;
        case 'add_member': setFormData({ idKk: row.idKk, kepalaKeluarga: row.kepalaKeluarga, noHp: row.noHp, bentukRumah: row.bentukRumah, statusRumah: row.statusRumah, noRayon: row.noRayon, urutanKk: row.urutanKk, penatua: row.penatua, alamat: row.alamat, noAnggota: '', idJemaat: `AG${pad0(row.noRayon)}${pad0(row.urutanKk)}`, namaLengkap: '', jk: '', statusKeluarga: 'Anak kandung' }); setModalMode('addAnggota'); break;
        case 'print_kk': setPrintId(row.idKk); setPrintMode('kk'); break;
        case 'print_majelis': setPrintId(row.dbId); setPrintMode('majelis'); break;
        default: break;
     }
  }, [activeTab, requestDelete, handleRestoreData]);

  if (!appUser) return <LoginScreen onLogin={setAppUser} penatuaMap={penatuaMap} penatuaPassMap={penatuaPassMap} churchProfile={churchProfile} adminPass={adminPass} />;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 pb-10">
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-5 border-b bg-gray-50"><h3 className="text-xl font-black text-gray-800">{confirmDialog.title}</h3></div>
             <div className="p-6"><p className="text-gray-600 font-medium">{confirmDialog.message}</p></div>
             <div className="p-4 border-t bg-gray-100 flex justify-end gap-3"><button onClick={() => setConfirmDialog({ isOpen: false })} className="px-4 py-2 border rounded-xl text-gray-700 bg-white font-bold shadow-sm hover:bg-gray-200">Batal</button><button onClick={confirmDialog.onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-md">Ya, Lanjutkan</button></div>
          </div>
        </div>
      )}

      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-5 border-b bg-gray-50"><h3 className="text-xl font-black text-gray-800">{alertDialog.title}</h3></div>
             <div className="p-6"><p className="text-gray-600 font-medium whitespace-pre-line">{alertDialog.message}</p></div>
             <div className="p-4 border-t bg-gray-100 flex justify-end"><button onClick={() => setAlertDialog({ isOpen: false })} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md">Tutup</button></div>
          </div>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:hidden">
          {/* Modal Container: Dioptimasi untuk HP dengan w-full max-h-[90vh] */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mt-20 mb-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl shrink-0">
              <h3 className="text-xl font-black text-gray-800">{modalMode === 'warisanKk' ? 'Pewarisan Kepala Keluarga' : modalMode === 'viewKk' ? 'Detail Data Kepala Keluarga' : modalMode === 'viewMajelis' ? 'Detail Profil Majelis' : modalMode === 'viewJemaat' ? 'Detail Lengkap Jemaat' : modalMode.includes('Kk') ? 'Formulir Kepala Keluarga' : modalMode.includes('Majelis') ? 'Formulir Data Majelis' : 'Formulir Data Jemaat'}</h3>
              <button type="button" onClick={() => setModalMode('')} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <form id="crud-form" onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
                {modalMode === 'warisanKk' && (
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">Tunjuk Kepala Keluarga Baru</h4>
                    <p className="text-sm text-gray-700 mb-5">Kepala Keluarga sebelumnya telah dinonaktifkan. Silakan konfirmasi pewaris KK di bawah ini.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-gray-700 mb-1 block uppercase tracking-wider">Pilih Anggota Pengganti (Prioritas: Istri)</label>
                          <select name="calonKkDbId" value={formData.calonKkDbId || ''} onChange={(e) => { const sel = jemaatData.find(x => x.dbId === e.target.value); setFormData(p => ({...p, calonKkDbId: e.target.value, kepalaKeluarga: sel?.namaLengkap})); }} className="w-full border-2 border-blue-300 p-3 rounded-xl bg-white text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                             {jemaatData.filter(d => d.idKk === formData.idKk && d.dbId !== formData.deadKkDbId && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah').map(m => (<option key={m.dbId} value={m.dbId}>{m.namaLengkap} (Status Lama: {m.statusKeluarga})</option>))}
                          </select>
                       </div>
                       <FormInput label="ID KK (Tetap)" value={formData.idKk} dis /> <FormInput label="Rayon" value={formData.noRayon || ''} dis /> <FormInput label="Nama Kepala Keluarga Baru" value={formData.kepalaKeluarga || ''} dis /> <FormInput label="Status Keluarga Baru" value="Kepala Keluarga" dis />
                    </div>
                  </div>
                )}
                {(modalMode === 'addKk' || modalMode === 'editKk') && (
                  <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">Data Kepala Keluarga</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput req label="Nomor Rayon" name="noRayon" type="select" opts={rayonList} value={formData.noRayon} onChange={handleFormChange} dis={appUser?.role === 'penatua'} />
                      <FormInput req label="Urutan KK Ke-" name="urutanKk" type="select" opts={urutanKkOpts} value={formData.urutanKk} onChange={handleFormChange} />
                      <FormInput label="ID KK (Otomatis)" name="idKk" value={formData.idKk} dis span={2} />
                      <FormInput req label="Nama Kepala Keluarga" name="kepalaKeluarga" value={formData.kepalaKeluarga} onChange={handleFormChange} />
                      <FormInput label="Nomor HP" name="noHp" value={formData.noHp} onChange={handleFormChange} />
                      <FormInput label="Bentuk Rumah" name="bentukRumah" type="select" opts={['Darurat','Semi Permanen','Permanen']} value={formData.bentukRumah} onChange={handleFormChange} />
                      <FormInput label="Status Rumah" name="statusRumah" type="select" opts={['Kost','Kontrak','Milik Sendiri','Menumpang','Rumah Dinas']} value={formData.statusRumah} onChange={handleFormChange} />
                      <FormInput label="Penatua (Rayon)" name="penatua" value={formData.penatua} dis span={2} />
                    </div>
                  </div>
                )}
                {(modalMode === 'addAnggota' || modalMode === 'addJemaat' || modalMode === 'editJemaat') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-2">
                    <div className="sm:col-span-2 md:col-span-3 bg-gray-100 p-5 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Pilih Penempatan Keluarga</h4>
                      {(modalMode === 'addJemaat' || modalMode === 'editJemaat') && (
                        <div className="mb-5 bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <label className="text-sm font-bold text-blue-900 block mb-2">Saring Berdasarkan Rayon Terlebih Dahulu:</label>
                          <div className="flex flex-col md:flex-row gap-3">
                            <select name="noRayon" value={formData.noRayon || ''} onChange={handleFormChange} className="w-full md:w-1/3 border-2 border-blue-300 p-2.5 rounded-lg bg-white outline-none"><option value="">-- Pilih Rayon --</option>{rayonList.map(r => <option key={r} value={r}>Rayon {r}</option>)}</select>
                            <select value={formData.idKk || ''} onChange={(e) => { const kk = jemaatData.find(k => String(k?.idKk) === String(e.target.value) && k?.statusKeluarga === 'Kepala Keluarga'); if(kk) { const newIdJemaat = formData.noAnggota ? `AG${pad0(kk.noRayon)}${pad0(kk.urutanKk)}${pad0(formData.noAnggota)}` : formData.idJemaat; setFormData(p => ({...p, idKk: kk.idKk, kepalaKeluarga: kk.kepalaKeluarga, noHp: kk.noHp, bentukRumah: kk.bentukRumah, statusRumah: kk.statusRumah, noRayon: kk.noRayon, urutanKk: kk.urutanKk, penatua: kk.penatua, alamat: kk.alamat, idJemaat: newIdJemaat })); } }} className="w-full md:w-2/3 border-2 border-blue-300 p-2.5 rounded-lg bg-white outline-none disabled:bg-gray-200" disabled={!formData.noRayon} ><option value="">-- Pilih KK --</option>{jemaatData.filter(d => d?.statusKeluarga === 'Kepala Keluarga' && String(d?.noRayon) === String(formData.noRayon) && d?.statusKeanggotaan !== 'Meninggal' && d?.statusKeanggotaan !== 'Pindah').sort((a,b) => String(a.idKk).localeCompare(String(b.idKk))).map((k,idx) => <option key={idx} value={k.idKk}>{k.idKk} - {k.kepalaKeluarga}</option>)}</select>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {modalMode === 'editJemaat' ? (
                           <div className="md:col-span-1">
                              <label className="text-xs font-semibold text-gray-600 mb-1 block">ID KK (Pindah KK)</label>
                              <select value={formData.idKk || ''} onChange={(e) => { const kkTujuan = jemaatData.find(k => k.idKk === e.target.value && k.statusKeluarga === 'Kepala Keluarga' && k.statusKeanggotaan !== 'Meninggal' && k.statusKeanggotaan !== 'Pindah'); if (kkTujuan) { const newIdJemaat = formData.noAnggota ? `AG${pad0(kkTujuan.noRayon)}${pad0(kkTujuan.urutanKk)}${pad0(formData.noAnggota)}` : formData.idJemaat; setFormData(p => ({ ...p, idKk: kkTujuan.idKk, kepalaKeluarga: kkTujuan.kepalaKeluarga, noRayon: kkTujuan.noRayon, urutanKk: kkTujuan.urutanKk, penatua: kkTujuan.penatua, alamat: kkTujuan.alamat, idJemaat: newIdJemaat })); } }} className="w-full border p-2 rounded bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"><option value={formData.idKk}>{formData.idKk} (KK Saat Ini)</option>{jemaatData.filter(d => d?.statusKeluarga === 'Kepala Keluarga' && d?.idKk !== formData.idKk && d?.statusKeanggotaan !== 'Meninggal' && d?.statusKeanggotaan !== 'Pindah').map(k => (<option key={`opt-${k.idKk}`} value={k.idKk}>{k.idKk} - {k.kepalaKeluarga}</option>))}</select>
                           </div>
                        ) : ( <FormInput label="ID KK" value={formData.idKk} dis /> )}
                        <FormInput label="Kepala Keluarga" value={formData.kepalaKeluarga} dis /> <FormInput label="Rayon" value={formData.noRayon} dis />
                      </div>
                    </div>
                    <h4 className="sm:col-span-2 md:col-span-3 font-bold text-gray-800 border-b pb-2 mt-2 text-lg">Data Pribadi</h4>
                    {JEMAAT_FIELDS_PRIBADI.map(f => { const fieldProps = { ...f }; if (f.name === 'noAnggota') fieldProps.opts = noAnggotaOpts; return <FormInput key={f.name} {...fieldProps} value={formData[f.name]} onChange={handleFormChange} /> })}
                    <h4 className="sm:col-span-2 md:col-span-3 font-bold text-gray-800 border-b pb-2 mt-4 text-lg">Agama & Pendidikan</h4>
                    <div className="sm:col-span-2 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
                      <FormInput label="Sudah Baptis?" name="baptis" type="select" opts={['Ya','Belum']} value={formData.baptis} onChange={handleFormChange} /> <FormInput label="Gereja Baptis" name="gerejaBaptis" dis={formData.baptis!=='Ya'} value={formData.gerejaBaptis} onChange={handleFormChange} /> <FormInput label="Tgl Baptis" name="tanggalBaptis" type="date" dis={formData.baptis!=='Ya'} value={formData.tanggalBaptis} onChange={handleFormChange} /> <FormInput label="Pendeta Baptis" name="pendetaBaptis" dis={formData.baptis!=='Ya'} value={formData.pendetaBaptis} onChange={handleFormChange} />
                    </div>
                    <div className="sm:col-span-2 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
                      <FormInput label="Sudah Sidi?" name="sidi" type="select" opts={['Ya','Belum']} value={formData.sidi} onChange={handleFormChange} /> <FormInput label="Gereja Sidi" name="gerejaSidi" dis={formData.sidi!=='Ya'} value={formData.gerejaSidi} onChange={handleFormChange} /> <FormInput label="Tgl Sidi" name="tanggalSidi" type="date" dis={formData.sidi!=='Ya'} value={formData.tanggalSidi} onChange={handleFormChange} /> <FormInput label="Pendeta Sidi" name="pendetaSidi" dis={formData.sidi!=='Ya'} value={formData.pendetaSidi} onChange={handleFormChange} />
                    </div>
                    <div className="sm:col-span-2 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
                      <FormInput label="Sudah Nikah?" name="nikah" type="select" opts={['Ya','Belum']} value={formData.nikah} onChange={handleFormChange} /> <FormInput label="Gereja Nikah" name="gerejaNikah" dis={formData.nikah!=='Ya'} value={formData.gerejaNikah} onChange={handleFormChange} /> <FormInput label="Tgl Nikah" name="tanggalNikah" type="date" dis={formData.nikah!=='Ya'} value={formData.tanggalNikah} onChange={handleFormChange} /> <FormInput label="Pendeta Nikah" name="pendetaNikah" dis={formData.nikah!=='Ya'} value={formData.pendetaNikah} onChange={handleFormChange} />
                      <FormInput label="Jenis Nikah" name="jenisNikah" isCheckboxGroup opts={['Nikah Adat', 'Nikah Gereja/Masehi', 'Nikah Catatan Sipil/BS', 'Pasangan belum menikah']} dis={formData.nikah!=='Ya'} value={formData.jenisNikah} onCheckboxChange={handleCheckboxChange} span={4} />
                    </div>
                    {JEMAAT_EDU.map(f => <FormInput key={f.name} {...f} value={formData[f.name]} onChange={handleFormChange} />)}
                    <h4 className="sm:col-span-2 md:col-span-3 font-bold text-gray-800 border-b pb-2 mt-4 text-lg">Kesehatan & Status Sosial</h4>
                    <FormInput label="Asuransi Kesehatan" name="asuransi" type="select" opts={['Ya','Tidak']} value={formData.asuransi} onChange={handleFormChange} /> <FormInput label="Jaminan" name="jaminan" type="select" opts={['BPJS/Askes','Asuransi Kesehatan lainnya']} dis={formData.asuransi!=='Ya'} value={formData.jaminan} onChange={handleFormChange} />
                    <FormInput label="Janda/Duda" name="jandaDuda" type="select" opts={['Tidak','Janda','Duda']} value={formData.jandaDuda} onChange={handleFormChange} /> <FormInput label="Yatim Piatu" name="yatimPiatu" type="select" opts={['Tidak','Yatim','Piatu','Yatim Piatu']} value={formData.yatimPiatu} onChange={handleFormChange} />
                    <FormInput label="Disabilitas" name="disabilitas" type="select" opts={['Ya','Tidak']} value={formData.disabilitas} onChange={handleFormChange} /> <FormInput label="Jenis Disabilitas" name="jenisDisabilitas" type="select" opts={['Tuna Netra', 'Tuna Rungu', 'Tuna Wicara', 'Tuna Daksa', 'Tuna Laras', 'Tuna Grahita']} dis={formData.disabilitas!=='Ya'} value={formData.jenisDisabilitas} onChange={handleFormChange} />
                    <FormInput label="Jabatan dalam Jemaat" name="jabatanJemaat" value={formData.jabatanJemaat} onChange={handleFormChange} /> <FormInput label="Jabatan di Masyarakat" name="jabatanMasyarakat" value={formData.jabatanMasyarakat} onChange={handleFormChange} />
                 </div>
                )}
                {(modalMode === 'addMajelis' || modalMode === 'editMajelis') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2">
                    <div className="sm:col-span-2 md:col-span-3 mb-4 flex flex-col sm:flex-row items-center gap-6 bg-purple-50 p-6 rounded-xl border border-purple-100">
                      <div className="w-32 h-40 bg-white rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-purple-300 shadow-inner shrink-0 relative group">
                        {formData.fotoBase64 ? <img src={formData.fotoBase64} alt="Foto" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-purple-200" />}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs font-bold">Ganti Foto</span></div>
                      </div>
                      <div className="flex-1 w-full"><label className="block text-sm font-black text-purple-900 mb-2">Upload Foto Profil Majelis</label><input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer border-2 border-purple-200 rounded-xl bg-white p-1"/></div>
                    </div>
                    {/* Daftar Pencarian Pintar (Datalist) */}
                    <datalist id="jemaat-names">
                       {jemaatData.filter(d => d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah').map(d => (
                         <option key={d.dbId} value={d.namaLengkap} />
                       ))}
                    </datalist>

                    {FORM_MAJELIS.map((sec, i) => (
                       <React.Fragment key={`sec-${i}`}>
                        <h4 className="sm:col-span-2 md:col-span-3 font-black text-gray-800 border-b-2 border-gray-100 pb-2 mt-4 text-lg w-full uppercase">{sec.t}</h4>
                        {sec.f.map((field, idx) => (
                           <React.Fragment key={`field-${i}-${idx}`}>
                              {field.t === 'sel' ? <FormInput label={field.l} name={field.k} type="select" opts={field.k === 'noRayon' ? rayonList : field.opts} value={formData[field.k]} onChange={handleFormChange} req={field.req} span={field.span} />
                              : field.t === 'chk' ? <FormInput label={field.l} name={field.k} isCheckboxGroup opts={field.opts} value={formData[field.k]} onCheckboxChange={handleCheckboxChange} span={field.span} />
                              : <FormInput type={field.t==='date'?'date':field.t==='num'?'number':'text'} label={field.l} name={field.k} value={formData[field.k]} onChange={handleFormChange} req={field.req} span={field.span} list={field.k === 'namaLengkap' ? 'jemaat-names' : undefined} />}
                           </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                    <div className="sm:col-span-2 md:col-span-3 mt-6 border-t-2 border-purple-200 pt-6">
                      <div className="flex justify-between items-center mb-6"><h4 className="font-black text-purple-900 text-lg uppercase">Data Identitas Anak</h4><button type="button" onClick={() => setFormData(p => ({...p, anak: [...(Array.isArray(p.anak)?p.anak:[]), {}]}))} className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors"><Plus className="w-4 h-4"/> Tambah Anak</button></div>
                      {(Array.isArray(formData.anak)?formData.anak:[]).map((a, i) => (
                        <div key={`anak-${i}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-white border-2 border-purple-100 rounded-xl mb-4 relative shadow-sm">
                          <button type="button" onClick={() => setFormData(p => ({...p, anak: (p.anak||[]).filter((_, idx)=>idx!==i)}))} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-2 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"><Trash2 className="w-4 h-4"/> Hapus</button>
                          <div className="md:col-span-2 lg:col-span-3 mt-6"><label className="text-xs font-bold text-gray-700 mb-1 block">Nama Lengkap Anak</label><input className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={a.nama||''} onChange={e=>{const n=[...formData.anak]; n[i].nama=e.target.value; setFormData(p=>({...p,anak:n}))}} placeholder="Masukkan nama anak"/></div>
                          <div><label className="text-xs font-semibold mb-1 block">Tempat Lahir</label><input className="w-full border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={a.tempatLahir||''} onChange={e=>{const n=[...formData.anak]; n[i].tempatLahir=e.target.value; setFormData(p=>({...p,anak:n}))}}/></div>
                          <div><label className="text-xs font-semibold mb-1 block">Tanggal Lahir</label><input type="date" className="w-full border p-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500" value={toInputDate(a.tanggalLahir)} onChange={e=>{const n=[...formData.anak]; n[i].tanggalLahir=e.target.value; setFormData(p=>({...p,anak:n}))}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(modalMode === 'addKematian' || modalMode === 'addPindah' || modalMode === 'addPindahMasuk') && (
                  <div className="space-y-4 p-4">
                    <FormInput label="Pilih Rayon" name="noRayon" type="select" opts={rayonList} value={formData.noRayon} onChange={e=>{handleFormChange(e); setFormData(p=>({...p, idKk: '', jemaatDbId: ''}))}} />
                    <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Pilih ID KK</label><select disabled={!formData.noRayon} name="idKk" value={formData.idKk||''} onChange={e=>{handleFormChange(e); setFormData(p=>({...p, jemaatDbId: ''}))}} className="w-full border p-2 rounded bg-gray-50 disabled:bg-gray-200 outline-none"><option value="">-Pilih-</option>{[...new Set(jemaatData.filter(d => d.noRayon === formData.noRayon && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah').map(d => d.idKk))].map(k=>{ const kNama = jemaatData.find(x => x.idKk === k && x.statusKeluarga === 'Kepala Keluarga')?.namaLengkap || 'Tanpa Nama'; return <option key={k} value={k}>{k} - {kNama}</option>; })}</select></div>
                    <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Pilih Jemaat</label><select required disabled={!formData.idKk} name="jemaatDbId" value={formData.jemaatDbId||''} onChange={handleFormChange} className="w-full border p-2 rounded bg-gray-50 disabled:bg-gray-200 outline-none"><option value="">-Pilih-</option>{jemaatData.filter(d => d.idKk === formData.idKk && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah').map((j,i)=><option key={j.dbId} value={j.dbId}>{j.namaLengkap} ({j.statusKeluarga})</option>)}</select></div>
                    <hr className="my-5 border-gray-300"/>
                    {modalMode === 'addPindahMasuk' ? ( <><FormInput req label="Asal Jemaat" name="asalJemaat" value={formData.asalJemaat} onChange={handleFormChange} /><FormInput req type="date" label="Tanggal Masuk" name="tanggalMasuk" value={formData.tanggalMasuk} onChange={handleFormChange} /></> ) 
                    : modalMode === 'addPindah' ? ( <><FormInput req label="Gereja Tujuan" name="pindahKeJemaat" value={formData.pindahKeJemaat} onChange={handleFormChange} /><FormInput req type="date" label="Tanggal Pindah" name="tanggalPindah" value={formData.tanggalPindah} onChange={handleFormChange} /></> ) 
                    : ( <><FormInput req type="date" label="Tanggal Kematian" name="tanggalKematian" value={formData.tanggalKematian} onChange={handleFormChange} /><FormInput req type="date" label="Tanggal Penguburan" name="tanggalPenguburan" value={formData.tanggalPenguburan} onChange={handleFormChange} /></> )}
                  </div>
                )}
                  {modalMode === 'viewKk' && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {['ID KK', 'Kepala Keluarga', 'No Rayon', 'Urutan KK', 'Bentuk Rumah', 'Status Rumah', 'Penatua Rayon', 'Alamat Domisili'].map(header => {
                        const key = JEMAAT_HEADER_MAP[header]; let val = formData[key];
                        return ( <div key={header} className="bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center"><p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">{header}</p><p className="font-semibold text-gray-800 text-sm">{safeStr(val) || '-'}</p></div> );
                     })}
                  </div>
                )}
                
                {modalMode === 'viewMajelis' && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[
                        { label: 'Jabatan Pelayanan', key: 'jabatanPelayanan' },
                        { label: 'Nama Lengkap', key: 'namaLengkap' },
                        { label: 'Tanggal Mulai Pelayanan', key: 'tglMulaiPelayanan', isDate: true },
                        { label: 'Tanggal Akhir Pelayanan', key: 'tglAkhirPelayanan', isDate: true }
                     ].map(f => {
                        let val = formData[f.key];
                        if (f.isDate) val = toDisplayDate(val);
                        return ( <div key={f.key} className="bg-purple-50 p-3 rounded-xl border border-purple-100 shadow-sm flex flex-col justify-center"><p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider mb-1">{f.label}</p><p className="font-semibold text-gray-800 text-sm">{safeStr(val) || '-'}</p></div> );
                     })}
                  </div>
                )}
                
                {modalMode === 'viewJemaat' && (
                  <div className="p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                     {Object.keys(JEMAAT_HEADER_MAP).filter(h => !['ID KK', 'ID Jemaat', 'No Anggota', 'Urutan KK', 'No Rayon', 'Pindah Ke Gereja', 'Tanggal Pindah', 'Tanggal Kematian', 'Tanggal Penguburan', 'Asal Jemaat', 'Tanggal Masuk', 'Status Keanggotaan'].includes(h)).map(header => {
                        const key = JEMAAT_HEADER_MAP[header]; let val = formData[key];
                         if (['tanggalLahir', 'tanggalBaptis', 'tanggalSidi', 'tanggalNikah', 'tanggalKematian', 'tanggalPenguburan', 'tanggalPindah', 'tanggalMasuk'].includes(key)) val = toDisplayDate(val);
                         if (Array.isArray(val)) val = val.join(', ');
                        return ( <div key={header} className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center"><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{header}</p><p className="font-semibold text-gray-800 text-sm">{safeStr(val) || '-'}</p></div> );
                     })}
           </div>
         )}
              </div>
              <div className="p-5 border-t bg-gray-100 flex justify-end gap-3 rounded-b-2xl shrink-0"><button type="button" onClick={() => setModalMode('')} className="px-5 py-2.5 border rounded-xl text-gray-700 bg-white font-bold shadow-sm">{modalMode === 'viewJemaat' ? 'Tutup' : 'Batal'}</button>{modalMode !== 'viewJemaat' && <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-md flex items-center gap-2"><Upload className="w-4 h-4"/> Simpan Data</button>}</div>
            </form>
          </div>
        </div>
      )}

      <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleImportCSV} />

      <div className={printMode === null ? 'hidden' : 'block'}>
         {printMode === 'kk' && <PrintKkTemplate kkToPrint={printId} jemaatData={jemaatData} penatuaMap={penatuaMap} churchProfile={churchProfile} onBack={() => setPrintMode(null)} />}
         {printMode === 'majelis' && <PrintMajelisTemplate majelisToPrint={printId} majelisData={majelisData} penatuaMap={penatuaMap} churchProfile={churchProfile} onBack={() => setPrintMode(null)} />}
         {printMode === 'list' && <PrintListTemplate listToPrint={activeSubTabStatus} tabCols={tabCols} filteredData={filteredData} filterRayon={filterRayon} filterKategori={filterKategori} churchProfile={churchProfile} onBack={() => setPrintMode(null)} />}
         {printMode === 'audit' && <PrintAuditTemplate auditData={auditData} auditFilter={auditFilter} auditRayon={auditRayon} churchProfile={churchProfile} onBack={() => setPrintMode(null)} />}
      </div>

      <div className={printMode !== null ? 'hidden' : 'block'}>
        <header className="sticky top-4 mx-4 mb-6 bg-white/95 backdrop-blur-md rounded-3xl shadow-sm z-40 px-6 py-4 border border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain bg-white rounded-full p-1 shadow-sm border border-gray-100" />
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">{churchProfile?.klasis || 'Klasis Belum Diatur'}</span>
              <h1 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight uppercase leading-tight mb-1">
                SISTEM DATA {churchProfile?.jemaat || ''} {churchProfile?.mataJemaat ? `- ${churchProfile?.mataJemaat}` : ''}
              </h1>
              <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-blue-600">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> 
                DB Terkoneksi • Akses: <span className="uppercase">{appUser?.role} {appUser?.role === 'penatua' ? `(${appUser?.name})` : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden lg:flex gap-1 bg-gray-50 p-1.5 rounded-full border border-gray-200">
               {['Data KK', 'Data Jemaat', 'Profil Majelis', 'Status Jemaat', ...(appUser?.role === 'admin' ? ['Riwayat Sistem', 'Pengaturan'] : [])].map(tab => (
                <button key={tab} onClick={() => {setActiveTab(tab); setSortConfig({key:null, direction:'asc'});}} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={() => { setSearchTerm(''); setFilterRayon('Semua'); setFilterKategori('Semua Kategori'); setSortConfig({key:null, direction:'asc'}); fetchSemuaData(); }} className="flex items-center gap-1 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 px-4 py-2.5 rounded-full text-sm font-black transition-colors shadow-sm"><RefreshCw className="w-4 h-4"/> <span className="hidden sm:inline">Refresh</span></button>
            <button onClick={() => setAppUser(null)} className="flex items-center gap-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 px-4 py-2.5 rounded-full text-sm font-black transition-colors shadow-sm"><LogOut className="w-4 h-4"/> <span className="hidden sm:inline">Keluar</span></button>
          </div>
        </header>

        <main className="px-4 md:px-8 max-w-[98%] mx-auto print:pt-4 print:px-0">
         
          <div ref={mobileMenuRef} className="flex lg:hidden justify-between items-center bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-gray-200 mb-4 print:hidden relative">
   <span className="font-black text-blue-800 tracking-wide text-lg">{activeTab}</span>
   <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
     <MoreVertical className="w-6 h-6" />
   </button>
   
   {showMobileMenu && (
     <div className="absolute top-[110%] right-0 bg-white shadow-xl border border-gray-200 rounded-2xl w-56 z-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
       {['Data KK', 'Data Jemaat', 'Profil Majelis', 'Status Jemaat', ...(appUser?.role === 'admin' ? ['Riwayat Sistem', 'Pengaturan'] : [])].map((tab) => (
         <button 
            key={tab} 
            onClick={() => {setActiveTab(tab); setSortConfig({key:null, direction:'asc'}); setShowMobileMenu(false);}} 
            className={`text-left px-5 py-3.5 text-sm font-bold border-b border-gray-50 last:border-0 transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
           {tab}
         </button>
       ))}
     </div>
   )}
</div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 print:hidden"><RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" /><p className="text-gray-500 font-bold animate-pulse">Memuat Database...</p></div>
          ) : (
            <>
               {activeTab === 'Pengaturan' ? (
                  <PengaturanTab
                     churchProfile={churchProfile} setChurchProfile={setChurchProfile}
                     penatuaMap={penatuaMap} setPenatuaMap={setPenatuaMap}
                     penatuaPassMap={penatuaPassMap} setPenatuaPassMap={setPenatuaPassMap}
                     adminPass={adminPass} setAdminPass={setAdminPass} rayonList={rayonList}
                     auditData={auditData} auditFilter={auditFilter} setAuditFilter={setAuditFilter}
                     auditRayon={auditRayon} setAuditRayon={setAuditRayon} 
                     showAuditDetail={showAuditDetail} setShowAuditDetail={setShowAuditDetail}
                     handlePrintAudit={handlePrintAudit} 
                     onSaveSettings={handleSaveSettings} onSaveAdminPass={handleSaveAdminPass}
                  />
               ) : activeTab === 'Data KK' ? (
                  <DataKkTab
                     jemaatData={jemaatData} penatuaMap={penatuaMap}
                     appUser={appUser} setFormData={setFormData} setModalMode={setModalMode}
                     filterRayon={filterRayon} setFilterRayon={setFilterRayon} rayonList={rayonList}
                     searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                     itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
                     sortConfig={sortConfig} requestSort={requestSort}
                     currentData={currentData} tabCols={tabCols}
                     currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} totalItems={totalItems}
                     churchProfile={churchProfile}
                     SortableHeader={SortableHeader} BarisTabelJemaat={BarisTabelJemaat} handleRowAction={handleRowAction}
                  />
               ) : activeTab === 'Data Jemaat' ? (
                  <DataJemaatTab
                     appUser={appUser} setFormData={setFormData} setModalMode={setModalMode} penatuaMap={penatuaMap}
                     subTabJemaat={subTabJemaat} setSubTabJemaat={setSubTabJemaat}
                     filterRayon={filterRayon} setFilterRayon={setFilterRayon} rayonList={rayonList}
                     searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                     itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
                     sortConfig={sortConfig} requestSort={requestSort}
                     currentData={currentData} tabCols={tabCols}
                     currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} totalItems={totalItems}
                     churchProfile={churchProfile}
                     SortableHeader={SortableHeader} BarisTabelJemaat={BarisTabelJemaat} handleRowAction={handleRowAction}
                     handleExportCSV={handleExportCSV} handleExportSinode={handleExportSinode} handleCleanAll={handleCleanAll} fileInputRef={fileInputRef}
                     InfografisTab={InfografisTab} jemaatData={jemaatData}
                     db={db} // <--- TAMBAHKAN BARIS INI
                  />
                  
              ) : activeTab === 'Profil Majelis' ? (
                  <ProfilMajelisTab
                     appUser={appUser} setFormData={setFormData} setModalMode={setModalMode} penatuaMap={penatuaMap}
                     subTabMajelis={subTabMajelis} setSubTabMajelis={setSubTabMajelis}
                     filterRayon={filterRayon} setFilterRayon={setFilterRayon} rayonList={rayonList}
                     searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                     itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
                     sortConfig={sortConfig} requestSort={requestSort}
                     currentData={currentData} tabCols={tabCols}
                     currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} totalItems={totalItems}
                     churchProfile={churchProfile}
                     SortableHeader={SortableHeader} BarisTabelJemaat={BarisTabelJemaat} handleRowAction={handleRowAction}
                     handleExportCSV={handleExportCSV} fileInputRef={fileInputRef} handleCleanAll={handleCleanAll}
                     InfografisTab={InfografisTab} majelisData={majelisData}
                  />
               ) : activeTab === 'Status Jemaat' ? (
                  <StatusJemaatTab
                     activeSubTabStatus={activeSubTabStatus} setActiveSubTabStatus={setActiveSubTabStatus}
                     appUser={appUser} setFormData={setFormData} setModalMode={setModalMode} setPrintMode={setPrintMode}
                     filterKategori={filterKategori} setFilterKategori={setFilterKategori} KATEGORI_PELAYANAN={KATEGORI_PELAYANAN}
                     filterBulan={filterBulan} setFilterBulan={setFilterBulan} NAMA_BULAN={NAMA_BULAN}
                     filterRayon={filterRayon} setFilterRayon={setFilterRayon} rayonList={rayonList}
                     currentData={currentData} tabCols={tabCols} sortConfig={sortConfig} requestSort={requestSort}
                     itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
                     currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} totalItems={totalItems}
                     churchProfile={churchProfile}
                     SortableHeader={SortableHeader} BarisTabelJemaat={BarisTabelJemaat} handleRowAction={handleRowAction}
                  />
               ) : activeTab === 'Riwayat Sistem' ? (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
                     <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mr-4"><History className="w-6 h-6 text-red-600" /> Riwayat Sistem</h2>
                        <select value={filterHistoryAction} onChange={(e) => setFilterHistoryAction(e.target.value)} className="bg-red-50 border-2 border-red-200 text-red-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0"><option value="Semua">Semua Aksi</option><option value="TAMBAH">Tambah Data</option><option value="EDIT">Edit Data</option><option value="HAPUS">Hapus Data</option><option value="RESTORE">Tarik/Restore</option><option value="IMPORT">Import Data</option><option value="HAPUS SEMUA">Hapus Semua Data</option></select>
                     </div>
                     <div className="w-full overflow-x-auto custom-scrollbar min-h-[50vh]">
                        <table className="w-full text-left border-collapse min-w-max">
                          <thead><tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-500 text-xs font-black uppercase tracking-wider"><SortableHeader label="No" sortKey="no" sortConfig={sortConfig} requestSort={requestSort} className="w-12 text-center" />{tabCols.map(c => <SortableHeader key={c.l} label={c.l} sortKey={c.k} sortConfig={sortConfig} requestSort={requestSort} />)}</tr></thead>
                          <tbody className="text-sm">
                            {currentData.length === 0 ? <tr><td colSpan="20" className="px-4 py-12 text-center text-gray-400 font-bold">Tidak ada riwayat.</td></tr> : currentData.map((row, idx) => ( <BarisTabelJemaat key={row.dbId||idx} row={row} idx={idx} startIndex={itemsPerPage === 'Semua' ? 0 : (currentPage - 1) * itemsPerPage} tabCols={tabCols} activeTab="Riwayat Sistem" appUser={appUser} isEditable={false} onAction={()=>{}} /> ))}
                          </tbody>
                        </table>
                     </div>
                  </div>
               ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}