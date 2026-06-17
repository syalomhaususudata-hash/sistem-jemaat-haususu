import React, { useState } from 'react';
import { Home, Plus, Search, ChevronLeft, ChevronRight, Users, ChevronDown, Edit, Trash2, Printer, UserPlus } from 'lucide-react';

export default function DataKkTab({
  appUser, setFormData, setModalMode, jemaatData,
  filterRayon, setFilterRayon, rayonList,
  searchTerm, setSearchTerm,
  itemsPerPage, setItemsPerPage,
  sortConfig, requestSort,
  currentData, tabCols,
  currentPage, totalPages, setCurrentPage, totalItems,
  churchProfile,
  SortableHeader, BarisTabelJemaat, handleRowAction
}) {
  // State untuk mengontrol kartu mana yang sedang terbuka (expand) di HP
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
        
        {/* TOP ACTION BAR */}
        <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mr-4">
              <Home className="w-6 h-6 text-blue-600" /> Data Kepala Keluarga
            </h2>
            {(appUser?.role === 'admin' || appUser?.role === 'penatua') && (
              <button onClick={() => { setFormData({ penatua: appUser?.role === 'penatua' ? appUser?.name : '' }); setModalMode('addKk'); }} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95">
                <Plus className="w-4 h-4"/> Buat KK Baru
              </button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <select value={filterRayon} onChange={(e) => setFilterRayon(e.target.value)} className="bg-blue-50 border-2 border-blue-200 text-blue-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0">
              <option value="Semua">Semua Rayon</option>
              {rayonList.map(i => <option key={i} value={i}>Rayon {i}</option>)}
            </select>
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Cari data..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full xl:w-60 pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700" />
            </div>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value === 'Semua' ? 'Semua' : Number(e.target.value))} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0">
              <option value={5}>Tampil 5</option>
              <option value={10}>Tampil 10</option>
              <option value={20}>Tampil 20</option>
              <option value="Semua">Tampil Semua</option>
            </select>
          </div>
        </div>

        {/* AREA DATA */}
        <div className="p-0">
          <div className="hidden print:block mb-4 border-b-2 border-black pb-4">
             <h1 className="text-2xl font-bold uppercase text-center">Data KK</h1>
             <p className="text-center font-bold text-sm mt-1">Rayon: {filterRayon}</p>
             <p className="text-center font-medium text-sm">Jemaat {churchProfile?.jemaat}</p>
          </div>

          {/* DESKTOP VIEW: TABEL KLASIK */}
          <div className="hidden md:block overflow-x-auto min-h-[50vh]">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-500 text-xs font-black uppercase tracking-wider">
                   <SortableHeader label="No" sortKey="no" sortConfig={sortConfig} requestSort={requestSort} className="w-12 text-center" />
                   {tabCols.map(c => <SortableHeader key={c.l} label={c.l} sortKey={c.k} sortConfig={sortConfig} requestSort={requestSort} className={c.l==='Usia'?'text-center bg-pink-100 text-pink-800':''} />)}
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
                          tabCols={tabCols} activeTab="Data KK"
                          appUser={appUser} 
                          isEditable={appUser?.role === 'admin' || (appUser?.role === 'penatua' && (!row || String(row.noRayon) === appUser.name))} 
                          onAction={handleRowAction}
                      />
                    ))
                 )}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW: TAMPILAN KARTU (CARDS) */}
          <div className="md:hidden flex flex-col p-4 gap-3 bg-gray-50 min-h-[50vh]">
             {currentData.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold"><Users className="w-12 h-12 mx-auto mb-3 opacity-50"/> Tidak ada data ditemukan.</div>
             ) : (
                currentData.map((row, idx) => (
                   <div key={row.dbId||idx} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
                      
                      {/* Kartu Utama (Bisa Diklik) */}
                      <div onClick={() => setExpandedId(prev => prev === row.idKk ? null : row.idKk)} className="p-4 flex items-center gap-4 cursor-pointer active:bg-blue-50">
                         <div className="flex flex-col items-center justify-center min-w-70px">
                              <span className="text-3xl font-black text-blue-600 leading-none">
                                  {jemaatData ? jemaatData.filter(d => d.idKk === row.idKk && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah').length : 0}
                              </span>
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Jiwa</span>
                          </div>
                         
                         <div className="w-px h-10 border-l-2 border-dashed border-gray-300"></div>
                         
                         <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm">{row.kepalaKeluarga}</h4>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                               Rayon: {row.noRayon} &bull; No KK: {row.urutanKk}
                            </p>
                         </div>
                         
                         <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedId === row.idKk ? 'rotate-180 text-blue-500' : ''}`} />
                      </div>

                      {/* Aksi Tambahan (Muncul Saat Kartu Diperluas) */}
                      {expandedId === row.idKk && (
                         <div className="bg-blue-50/50 border-t border-gray-100 p-4 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                            
                            {/* Tombol Cetak selalu ada jika role jemaat, penatua, admin */}
                            {appUser?.role !== 'jemaat' ? (
                               <button onClick={() => handleRowAction('print_kk', row)} className="flex-1 py-2.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"><Printer className="w-4 h-4"/> Cetak</button>
                            ) : (
                               <span className="flex-1 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold flex items-center justify-center select-none">Hanya Lihat</span>
                            )}
                            
                            {(appUser?.role === 'admin' || (appUser?.role === 'penatua' && String(row.noRayon) === appUser?.name)) && (
                               <>
                                  <button onClick={() => handleRowAction('add_member', row)} className="w-full py-2.5 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"><UserPlus className="w-4 h-4"/> Tambah Anggota ke KK ini</button>
                                  
                                  <button onClick={() => handleRowAction('edit', row)} className="flex-1 py-2.5 bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"><Edit className="w-4 h-4"/> Edit KK</button>
                                  
                                  {appUser?.role === 'admin' && (
                                     <button onClick={() => handleRowAction('delete', row)} className="flex-1 py-2.5 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"><Trash2 className="w-4 h-4"/> Hapus</button>
                                  )}
                               </>
                            )}
                         </div>
                      )}
                   </div>
                ))
             )}
          </div>
        </div>

        {/* PAGINASI */}
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

      </div>
    </div>
  );
}