import React, { useState } from 'react';
import { ChevronDown, Plus, Printer, ChevronLeft, ChevronRight, Users, Filter, Eye, RefreshCw, Trash2, Download } from 'lucide-react';
import { calculateAge, toDisplayDate } from '../utils/helpers';
import * as XLSX from 'xlsx'; // Tambahkan library ini untuk fungsi Excel

export default function StatusJemaatTab({
  activeSubTabStatus, setActiveSubTabStatus,
  appUser, setFormData, setModalMode, setPrintMode,
  filterKategori, setFilterKategori, KATEGORI_PELAYANAN,
  filterBulan, setFilterBulan, NAMA_BULAN,
  filterRayon, setFilterRayon, rayonList,
  currentData, fullFilteredData, // <--- TAMBAHKAN DI SINI
  tabCols, sortConfig, requestSort,
  // ...
  itemsPerPage, setItemsPerPage,
  currentPage, totalPages, setCurrentPage, totalItems,
  churchProfile,
  SortableHeader, BarisTabelJemaat, handleRowAction
}) {

  const [expandedId, setExpandedId] = useState(null);

  const getCardSubtitle = (row) => {
    if (activeSubTabStatus === 'Data Kematian') return `Wafat: ${toDisplayDate(row.tanggalKematian)}`;
    if (activeSubTabStatus === 'Pindah Jemaat') return `Tujuan: ${row.pindahKeJemaat}`;
    if (activeSubTabStatus === 'Pindah Masuk Jemaat') return `Dari: ${row.asalJemaat}`;
    if (activeSubTabStatus === 'Anggota Baptis') return `Tgl Baptis: ${toDisplayDate(row.tanggalBaptis)}`;
    if (activeSubTabStatus === 'Anggota Sidi') return `Tgl Sidi: ${toDisplayDate(row.tanggalSidi)}`;
    if (activeSubTabStatus === 'Anggota Nikah') return `Tgl Nikah: ${toDisplayDate(row.tanggalNikah)}`;
    
    // ---> PERBAIKAN: Tambahkan Pengecekan !row.tanggalLahir <---
    if (activeSubTabStatus === 'Ulang Tahun') {
      if (!row.tanggalLahir) return 'Tgl Lahir: Belum didata • Usia: - Thn';
      return `Tgl Lahir: ${toDisplayDate(row.tanggalLahir)} • Usia: ${calculateAge(row.tanggalLahir)} Thn`;
    }
    
    if (activeSubTabStatus === 'Pelayanan Kategori') {
      if (!row.tanggalLahir) return 'Usia: - Thn';
      return `Usia: ${calculateAge(row.tanggalLahir)} Thn`;
    }
    
    return `Tgl Lahir: ${row.tanggalLahir ? toDisplayDate(row.tanggalLahir) : 'Belum didata'}`;
  };

  const isActionableStatus = ['Data Kematian', 'Pindah Jemaat', 'Pindah Masuk Jemaat'].includes(activeSubTabStatus);

const handleDownloadExcel = () => {
    // 1. Ambil data utuh jika tersedia dari App.jsx, jika tidak fallback ke currentData
    const sumberData = fullFilteredData ? fullFilteredData : currentData;
    let dataUlangTahun = [...sumberData];

    // 2. Pengurutan (Sorting): Berdasarkan Tanggal (Hari 1 s/d 31)
    dataUlangTahun.sort((a, b) => {
      // Amankan jika ada data jemaat yang tanggal lahirnya kosong
      if (!a.tanggalLahir) return 1; 
      if (!b.tanggalLahir) return -1;

      // Ambil angka harinya saja (1-31) untuk diurutkan
      const hariA = new Date(a.tanggalLahir).getDate();
      const hariB = new Date(b.tanggalLahir).getDate();
      
      // Jika Anda ingin mengurutkan berdasarkan UMUR (Tahun Lama ke Baru), 
      // hapus .getDate() di atas, dan gunakan:
      // return new Date(a.tanggalLahir) - new Date(b.tanggalLahir);
      
      return hariA - hariB; 
    });

    // 3. Format Data: Hanya Nama dan Tanggal (YYYY/MM/DD)
    const excelData = dataUlangTahun.map(row => {
      if (!row.tanggalLahir) {
         return { "Nama": row.namaLengkap, "Tanggal": "Belum didata" };
      }

      const dateObj = new Date(row.tanggalLahir);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');

      return {
        "Nama": row.namaLengkap,
        "Tanggal": `${yyyy}/${mm}/${dd}`
      };
    });

    // 4. Proses konversi ke Excel dan Trigger Download
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ulang Tahun");
    
    XLSX.writeFile(workbook, "Data_Ulang_Tahun_Bulan_Ini.xlsx");
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-4 print:hidden">
        <label className="text-[10px] font-black text-gray-400 mb-1 block uppercase tracking-wider">Sub Menu Laporan Status</label>
        <div className="relative inline-block w-full sm:w-auto">
          <select 
            value={activeSubTabStatus} 
            onChange={(e) => setActiveSubTabStatus(e.target.value)} 
            className={`w-full sm:w-72 appearance-none bg-white border-2 text-sm font-bold py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 cursor-pointer shadow-sm transition-all ${
              activeSubTabStatus === 'Ulang Tahun' ? 'border-pink-200 text-pink-700 focus:ring-pink-500' : 'border-indigo-200 text-indigo-700 focus:ring-indigo-500'
            }`}
          >
            {['Pelayanan Kategori', 'Anggota Baptis', 'Anggota Sidi', 'Anggota Nikah', 'Pasangan Belum Menikah', 'Pindah Masuk Jemaat', 'Pindah Jemaat', 'Data Kematian', 'Ulang Tahun'].map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none w-5 h-5 ${activeSubTabStatus === 'Ulang Tahun' ? 'text-pink-500' : 'text-indigo-500'}`} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
        <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
          
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mr-4">
              <Filter className="w-6 h-6 text-indigo-600" /> Status Jemaat
            </h2>

            {(appUser?.role === 'admin' || appUser?.role === 'penatua') && activeSubTabStatus === 'Data Kematian' && (
              <button onClick={() => { setFormData({}); setModalMode('addKematian'); }} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95">
                <Plus className="w-4 h-4"/> Lapor Kematian
              </button>
            )}
            {(appUser?.role === 'admin' || appUser?.role === 'penatua') && activeSubTabStatus === 'Pindah Jemaat' && (
              <button onClick={() => { setFormData({}); setModalMode('addPindah'); }} className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95">
                <Plus className="w-4 h-4"/> Lapor Pindah Jemaat
              </button>
            )}
            {(appUser?.role === 'admin' || appUser?.role === 'penatua') && activeSubTabStatus === 'Pindah Masuk Jemaat' && (
              <button onClick={() => { setFormData({}); setModalMode('addPindahMasuk'); }} className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95">
                <Plus className="w-4 h-4"/> Lapor Pindah Masuk
              </button>
            )}

            {/* ---> TAMBAHAN BARU: Tombol Download Excel khusus Ulang Tahun <--- */}
            {activeSubTabStatus === 'Ulang Tahun' && appUser?.role !== 'jemaat' && (
              <button onClick={handleDownloadExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition">
                <Download className="w-4 h-4"/> Download Excel
              </button>
            )}
     
            {appUser?.role !== 'jemaat' && (
              <button onClick={() => setPrintMode('list')} className="flex items-center gap-2 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-bold transition hover:bg-indigo-100">
                <Printer className="w-4 h-4"/> Cetak Laporan
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {activeSubTabStatus === 'Pelayanan Kategori' && (
              <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="bg-indigo-50 border-2 border-indigo-200 text-indigo-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0">
                {KATEGORI_PELAYANAN.map((k, i) => <option key={i} value={k}>{k}</option>)}
              </select>
            )}
            {activeSubTabStatus === 'Ulang Tahun' && (
              <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="bg-pink-50 border-2 border-pink-200 text-pink-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0">
                {NAMA_BULAN.map((k, i) => <option key={i} value={i+1}>{k}</option>)}
              </select>
            )}
            <select value={filterRayon} onChange={(e) => setFilterRayon(e.target.value)} className="bg-blue-50 border-2 border-blue-200 text-blue-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0">
              <option value="Semua">Semua Rayon</option>
              {rayonList.map(i => <option key={i} value={i}>Rayon {i}</option>)}
            </select>
            
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value === 'Semua' ? 'Semua' : Number(e.target.value))} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0">
              <option value={5}>Tampil 5</option>
              <option value={10}>Tampil 10</option>
              <option value={20}>Tampil 20</option>
              <option value="Semua">Tampil Semua</option>
            </select>
          </div>
        </div>

        <div className="p-0">
          <div className="hidden print:block mb-4 border-b-2 border-black pb-4">
             <h1 className="text-2xl font-bold uppercase text-center">Data {activeSubTabStatus}</h1>
             <p className="text-center font-bold text-sm mt-1">
               {activeSubTabStatus === 'Pelayanan Kategori' ? `Kategori: ${filterKategori} | ` : ''}
               {activeSubTabStatus === 'Ulang Tahun' ? `Bulan: ${NAMA_BULAN ? NAMA_BULAN[filterBulan-1] : 'Memuat...'} | ` : ''}
               Rayon: {filterRayon}
             </p>
             <p className="text-center font-medium text-sm">Jemaat {churchProfile?.jemaat}</p>
          </div>

          <div className="hidden md:block overflow-x-auto min-h-[50vh]">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-500 text-xs font-black uppercase tracking-wider">
                   <SortableHeader label="No" sortKey="no" sortConfig={sortConfig} requestSort={requestSort} className="w-12 text-center" />
                   {tabCols.map(c => (
                     <SortableHeader key={c.l} label={c.l} sortKey={c.k} sortConfig={sortConfig} requestSort={requestSort} className={c.l === 'Usia' ? 'text-center bg-pink-100 text-pink-800' : ''} />
                   ))}
                   <th className="px-4 py-3 border-b w-40 text-center select-none sticky right-0 bg-gray-100 shadow">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                 {currentData.length === 0 ? (
                    <tr><td colSpan="20" className="px-4 py-12 text-center text-gray-400 font-bold"><Users className="w-12 h-12 mx-auto mb-3 opacity-50"/> Tidak ada data ditemukan.</td></tr>
                 ) : (
                    currentData.map((row, idx) => (
                       <BarisTabelJemaat
                          key={row.dbId||idx} row={row} idx={idx}
                          startIndex={itemsPerPage === 'Semua' ? 0 : (currentPage - 1) * itemsPerPage}
                          tabCols={tabCols} activeTab="Status Jemaat" activeSubTabStatus={activeSubTabStatus}
                          appUser={appUser}
                          isEditable={appUser?.role === 'admin' || (appUser?.role === 'penatua' && String(row.noRayon) === appUser.name)}
                          onAction={handleRowAction}
                      />
                    ))
                 )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col p-4 gap-3 bg-gray-50 min-h-[50vh]">
             {currentData.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold"><Users className="w-12 h-12 mx-auto mb-3 opacity-50"/> Tidak ada data ditemukan.</div>
             ) : (
                currentData.map((row, idx) => (
                   <div key={row.dbId||idx} className="bg-white border border-indigo-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
                      <div onClick={() => isActionableStatus ? setExpandedId(prev => prev === row.dbId ? null : row.dbId) : null} className={`p-4 flex items-center gap-4 ${isActionableStatus ? 'cursor-pointer active:bg-indigo-50' : ''}`}>
                         <div className="flex flex-col items-center justify-center min-w-50px">
                            <span className="text-xl font-black text-indigo-600 leading-none">R-{row.noRayon}</span>
                         </div>
                         <div className="w-px h-10 border-l-2 border-dashed border-gray-300"></div>
                         <div className="flex-1">
                            <h4 className={`font-bold text-sm ${row.jk === 'Laki-laki' ? 'text-blue-800' : 'text-pink-800'}`}>{row.namaLengkap}</h4>
                            <p className="text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                               {getCardSubtitle(row)}
                            </p>
                         </div>
                         {isActionableStatus && (
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedId === row.dbId ? 'rotate-180 text-indigo-500' : ''}`} />
                         )}
                      </div>

                      {(isActionableStatus && expandedId === row.dbId) && (
                         <div className="bg-indigo-50/50 border-t border-indigo-100 p-4 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                            <button onClick={() => handleRowAction('view', row)} className="flex-1 py-2 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                               <Eye className="w-4 h-4"/> Detail
                            </button>
                            {(appUser?.role === 'admin' && activeSubTabStatus !== 'Pindah Masuk Jemaat') && (
                               <button onClick={() => handleRowAction('restore', row)} className="flex-1 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                                  <RefreshCw className="w-4 h-4"/> Tarik Data
                               </button>
                            )}
                            {appUser?.role === 'admin' && (
                               <button onClick={() => handleRowAction('delete', row)} className="flex-1 py-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                                  <Trash2 className="w-4 h-4"/> Hapus
                               </button>
                            )}
                         </div>
                      )}
                   </div>
                ))
             )}
          </div>
        </div>

        <div className="bg-gray-50 p-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden rounded-b-3xl">
           <p className="text-sm text-gray-500 font-bold">Menampilkan total: <span className="font-black text-blue-800 text-base">{totalItems}</span> Data</p>
          {itemsPerPage !== 'Semua' && totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-800 font-bold px-2">Hal {currentPage} dari {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition">
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>
          )}
        </div>
      </div>
    </div>
  );
}