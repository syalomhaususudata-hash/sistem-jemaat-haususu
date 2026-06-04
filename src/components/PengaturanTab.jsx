import React, { useState } from 'react';
import { Settings, Plus, Trash2, Edit, Upload, Download } from 'lucide-react';

export default function PengaturanTab({
  // Props Data & Setter
  churchProfile, setChurchProfile,
  penatuaMap, setPenatuaMap,
  penatuaPassMap, setPenatuaPassMap,
  adminPass, setAdminPass,
  rayonList,
  
  // Props Audit
  auditData,
  auditFilter, setAuditFilter,
  auditRayon, setAuditRayon, // <--- PASTIKAN DUA INI ADA
  showAuditDetail, setShowAuditDetail,
  handlePrintAudit,          // <--- PASTIKAN INI JUGA ADA (Menggantikan handleDownloadAudit)
  
  // Props Aksi Simpan
  onSaveSettings,
  onSaveAdminPass
}) {
  // State lokal khusus untuk UI edit password
  const [isEditingAdminPass, setIsEditingAdminPass] = useState(false);

  const handleAddRayon = () => {
    const max = Math.max(...Object.keys(penatuaMap).map(Number)); 
    setPenatuaMap({...penatuaMap, [max+1]: "Penatua Baru"}); 
    setPenatuaPassMap({...penatuaPassMap, [max+1]: "penatua123"});
  };

  const handleDeleteRayon = (r) => {
    const n = {...penatuaMap}; delete n[r]; setPenatuaMap(n); 
    const p = {...penatuaPassMap}; delete p[r]; setPenatuaPassMap(p);
  };

  return (
    <div className="p-8 animate-in fade-in duration-300">
      
      {/* HEADER PENGATURAN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
           <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
             <Settings className="w-6 h-6 text-gray-600"/> Manajemen Data & Pengaturan
           </h2>
           <p className="text-gray-500 mt-2">Ubah profil gereja, nama penatua dan atur password login khusus untuk masing-masing Rayon.</p>
        </div>
        <button onClick={handleAddRayon} className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95 flex items-center gap-2">
           <Plus className="w-5 h-5"/> Tambah Rayon Baru
        </button>
      </div>

      {/* PROFIL GEREJA */}
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
            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Nama Sekretaris Jemaat</label>
            <input type="text" className="w-full border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" value={churchProfile.namaSekretaris || ''} onChange={e => setChurchProfile({...churchProfile, namaSekretaris: e.target.value})} placeholder="Masukkan Nama Sekretaris..." />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Alamat Lengkap Gereja</label>
            <textarea className="w-full border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" rows="2" value={churchProfile.alamat} onChange={e => setChurchProfile({...churchProfile, alamat: e.target.value})} placeholder="Alamat detail..."></textarea>
          </div>
        </div>
      </div>

      {/* DATA PENATUA */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Data Penatua Rayon</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6">
        {rayonList.map(r => (
          <div key={r} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
             {parseInt(r) > 6 && (
                <button onClick={() => handleDeleteRayon(r)} className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 bg-red-50 rounded">
                   <Trash2 className="w-4 h-4"/>
                </button>
             )}
             <label className="text-sm font-bold text-gray-700 mb-1 block">Penatua Rayon {r}</label>
             <input type="text" className="w-full border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none mb-4 text-sm font-semibold" value={penatuaMap[r]} onChange={e => setPenatuaMap({...penatuaMap, [r]: e.target.value})} />
             <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Password Login Rayon {r}</label>
             <input type="text" className="w-full border-2 border-dashed border-gray-300 bg-gray-50 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold" value={penatuaPassMap[r] || ''} onChange={e => setPenatuaPassMap({...penatuaPassMap, [r]: e.target.value})} />
          </div>
        ))}
      </div>

{/* TOMBOL SIMPAN PENGATURAN UMUM (DIPINDAH KE SINI) */}
      <div className="mt-2 mb-10 flex justify-end">
         <button onClick={onSaveSettings} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">
           Simpan Pengaturan (Profil & Penatua)
         </button>
      </div>

      {/* KEAMANAN ADMIN */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Keamanan Administrator</h3>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 max-w-md">
           <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Password Admin Saat Ini</label>
           <input 
              type={isEditingAdminPass ? "text" : "password"} 
              className={`w-full border-2 p-2.5 rounded-xl outline-none text-sm font-semibold transition-colors ${isEditingAdminPass ? 'border-blue-400 bg-white focus:ring-2' : 'border-gray-200 bg-gray-100'}`} 
              value={adminPass} 
              onChange={e => setAdminPass(e.target.value)} 
              disabled={!isEditingAdminPass} 
              placeholder="Masukkan password baru..." 
           />
        </div>
        <div>
           {isEditingAdminPass ? (
              <button 
                onClick={async () => {
                   const success = await onSaveAdminPass();
                   if (success) setIsEditingAdminPass(false);
                }} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                 <Upload className="w-4 h-4"/> Simpan Password
              </button>
           ) : (
              <button onClick={() => setIsEditingAdminPass(true)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2">
                 <Edit className="w-4 h-4"/> Ubah Password
              </button>
           )}
        </div>
      </div>

      {/* LAPORAN AUDIT */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
         <span>Laporan Audit (Data Belum Lengkap)</span>
      </h3>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
           <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
              <p className="text-3xl font-black text-red-600">{auditData.kk}</p>
              <p className="text-xs font-bold text-red-800 mt-1 uppercase">Kepala Keluarga Kosong</p>
           </div>
           <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
              <p className="text-3xl font-black text-amber-600">{auditData.anggota}</p>
              <p className="text-xs font-bold text-amber-800 mt-1 uppercase">Data Jemaat Kosong</p>
           </div>
           <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
              <p className="text-3xl font-black text-purple-600">{auditData.majelis}</p>
              <p className="text-xs font-bold text-purple-800 mt-1 uppercase">Profil Majelis Kosong</p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-4 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
           <div className="flex flex-col md:flex-row gap-4 w-full sm:w-auto">
               <div className="w-full sm:w-auto">
                   <label className="text-xs font-bold text-gray-600 mb-2 block uppercase">Pilih Kategori:</label>
                   <select value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)} className="w-full md:w-60 border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-bold bg-white">
                      <option value="Data KK">Data Kepala Keluarga</option>
                      <option value="Data Jemaat">Data Seluruh Jemaat</option>
                      <option value="Profil Majelis">Data Profil Majelis</option>
                   </select>
               </div>
               <div className="w-full sm:w-auto">
                   <label className="text-xs font-bold text-gray-600 mb-2 block uppercase">Filter Rayon:</label>
                   <select value={auditRayon} onChange={(e) => setAuditRayon(e.target.value)} className="w-full md:w-40 border-2 border-gray-300 p-2.5 rounded-xl focus:border-blue-500 outline-none text-sm font-bold bg-white">
                      <option value="Semua">Semua Rayon</option>
                      {rayonList.map(r => <option key={r} value={r}>Rayon {r}</option>)}
                   </select>
               </div>
           </div>
           
           <button onClick={handlePrintAudit} className="w-full sm:w-auto bg-red-100 hover:bg-red-600 hover:text-white text-red-700 font-black py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
               <Download className="w-5 h-5"/> Cetak / Simpan PDF
           </button>
        </div>

        <button onClick={() => setShowAuditDetail(!showAuditDetail)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
            {showAuditDetail ? 'Sembunyikan Detail Daftar Tabel' : `Lihat Detail Nama Yang Belum Lengkap (${auditFilter})`}
        </button>
        
        {showAuditDetail && (
            <div className="mt-4 max-h-80 overflow-y-auto border border-gray-200 rounded-xl custom-scrollbar">
               <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                     <tr>
                        <th className="p-3 border-b font-bold text-gray-600">Nama Lengkap</th>
                        <th className="p-3 border-b font-bold text-gray-600">Tipe Anggota</th>
                        <th className="p-3 border-b font-bold text-gray-600">Kolom Belum Diisi</th>
                     </tr>
                  </thead>
                  <tbody>
                     {auditData.list.length === 0 ? (
                        <tr><td colSpan="3" className="p-6 text-center text-gray-500 font-semibold italic">Hebat! Semua data pada {auditFilter} sudah terisi lengkap.</td></tr>
                     ) : (
                        auditData.list.map((item, idx) => (
                           <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-semibold text-gray-800">{item.nama}</td>
                              <td className="p-3 text-xs"><span className="bg-gray-200 text-gray-700 font-bold px-2 py-1 rounded-md">{item.tipe}</span></td>
                              <td className="p-3 text-red-600 text-xs font-bold">{item.missing}</td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
        )}
      </div>
    </div>
  );
}