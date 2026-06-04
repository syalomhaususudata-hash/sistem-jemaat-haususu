import React from 'react';
import { Home, Plus, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';

export default function DataKkTab({
  appUser, setFormData, setModalMode,
  filterRayon, setFilterRayon, rayonList,
  searchTerm, setSearchTerm,
  itemsPerPage, setItemsPerPage,
  sortConfig, requestSort,
  currentData, tabCols,
  currentPage, totalPages, setCurrentPage, totalItems,
  churchProfile,
  SortableHeader, BarisTabelJemaat, handleRowAction
}) {
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

        {/* TABEL DATA */}
        <div className="p-0">
          <div className="hidden print:block mb-4 border-b-2 border-black pb-4">
             <h1 className="text-2xl font-bold uppercase text-center">Data KK</h1>
             <p className="text-center font-bold text-sm mt-1">Rayon: {filterRayon}</p>
             <p className="text-center font-medium text-sm">Jemaat {churchProfile?.jemaat}</p>
          </div>

          <div className="overflow-x-auto min-h-[50vh]">
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