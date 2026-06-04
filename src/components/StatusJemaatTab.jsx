import React from 'react';
import { ChevronDown, Plus, Printer, ChevronLeft, ChevronRight, Users, Filter } from 'lucide-react';

export default function StatusJemaatTab({
  // State & Setters
  activeSubTabStatus, setActiveSubTabStatus,
  appUser, setFormData, setModalMode, setPrintMode,
  filterKategori, setFilterKategori, KATEGORI_PELAYANAN,
  filterBulan, setFilterBulan, NAMA_BULAN,
  filterRayon, setFilterRayon, rayonList,
  
  // Data & Table
  currentData, tabCols, sortConfig, requestSort,
  itemsPerPage, setItemsPerPage,
  currentPage, totalPages, setCurrentPage, totalItems,
  churchProfile,
  
  // Components
  SortableHeader, BarisTabelJemaat, handleRowAction
}) {

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* 1. SUB MENU DROPDOWN */}
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
        
        {/* 2. TOP ACTION BAR (Tombol Lapor & Filter) */}
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
            {appUser?.role !== 'jemaat' && (
              <button onClick={() => setPrintMode('list')} className="flex items-center gap-2 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-bold transition hover:bg-indigo-100">
                <Printer className="w-4 h-4"/> Cetak Laporan
              </button>
            )}
          </div>

          {/* Filter Section */}
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

        {/* 3. BAGIAN TABEL */}
        <div className="p-0">
          <div className="hidden print:block mb-4 border-b-2 border-black pb-4">
             <h1 className="text-2xl font-bold uppercase text-center">Data {activeSubTabStatus}</h1>
             <p className="text-center font-bold text-sm mt-1">
               {activeSubTabStatus === 'Pelayanan Kategori' ? `Kategori: ${filterKategori} | ` : ''}
               {activeSubTabStatus === 'Ulang Tahun' ? `Bulan: ${NAMA_BULAN[filterBulan-1]} | ` : ''}
               Rayon: {filterRayon}
             </p>
             <p className="text-center font-medium text-sm">Jemaat {churchProfile?.jemaat}</p>
          </div>

          <div className="overflow-x-auto min-h-[50vh]">
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
                          key={row.dbId||idx}
                          row={row}
                          idx={idx}
                          startIndex={itemsPerPage === 'Semua' ? 0 : (currentPage - 1) * itemsPerPage}
                          tabCols={tabCols}
                          activeTab="Status Jemaat"
                          activeSubTabStatus={activeSubTabStatus}
                          appUser={appUser}
                          isEditable={appUser?.role === 'admin' || (appUser?.role === 'penatua' && String(row.noRayon) === appUser.name)}
                          onAction={handleRowAction}
                      />
                    ))
                 )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. PAGINASI BAWAH */}
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