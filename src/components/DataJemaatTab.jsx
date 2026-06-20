import React, { useState } from 'react';
import { Users, Plus, ChevronDown, Download, FileUp, Trash2, Search, ChevronLeft, ChevronRight, Eye, Edit } from 'lucide-react';
import { calculateAge, toDisplayDate } from '../utils/helpers';
import { collection, doc, writeBatch } from "firebase/firestore";

export default function DataJemaatTab({
  appUser, setFormData, setModalMode, penatuaMap,
  subTabJemaat, setSubTabJemaat,
  filterRayon, setFilterRayon, rayonList,
  searchTerm, setSearchTerm,
  itemsPerPage, setItemsPerPage,
  sortConfig, requestSort,
  currentData, tabCols,
  currentPage, totalPages, setCurrentPage, totalItems,
  churchProfile,
  SortableHeader, BarisTabelJemaat, handleRowAction,
  handleExportCSV, handleExportSinode, handleCleanAll, fileInputRef,
  InfografisTab, jemaatData,
  db // <--- TAMBAHKAN INI DI BARIS PALING BAWAH PROPS
}) {
   const [showMenuOps, setShowMenuOps] = useState(false);
   // ... (kode lainnya tetap sama)
   // State untuk mengatur kartu mana yang sedang diklik/dibuka di versi Mobile
   const [expandedId, setExpandedId] = useState(null);
    // Fungsi untuk menghasilkan kelas warna border yang konsisten berdasarkan String (idKk)
    const getColorClassById = (str) => {
      if (!str) return 'border-gray-200';
      const colors = ['border-blue-400', 'border-emerald-400', 'border-purple-400', 'border-amber-400', 'border-rose-400', 'border-indigo-400', 'border-teal-400', 'border-orange-400', 'border-pink-400', 'border-cyan-400'];
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      const index = Math.abs(hash) % colors.length;
      return colors[index];
    };

const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawData = JSON.parse(event.target.result);
        const rawValidData = [];

        // 1. Bersihkan baris kosong
        rawData.forEach(row => {
           if (row['Nama Lengkap']) rawValidData.push(row);
        });

        if (rawValidData.length === 0) {
           alert("Data JSON kosong atau format tidak sesuai."); return;
        }

        // 2. Persiapan Pemetaan dan Tracking ID
        const rayonTracker = {};
        // Ambil data urutan KK tertinggi saat ini agar tidak ada ID KK yang tumpang tindih
        jemaatData.forEach(d => {
           const ry = String(d.noRayon || '0').replace(/\D/g, '');
           const ur = parseInt(d.urutanKk || 0);
           if (!rayonTracker[ry] || ur > rayonTracker[ry]) {
               rayonTracker[ry] = ur;
           }
        });

        const familyGroups = {};
        const validDataToImport = [];
        let duplicateCount = 0;

        const pad0 = (num) => String(num).padStart(2, '0');
        const getMonthNumber = (monthName) => {
          if (!monthName) return '01';
          const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
          const index = NAMA_BULAN.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
          return index !== -1 ? pad0(index + 1) : '01';
        };

        // 3. Klasifikasi Data & Eksekusi Validasi
        rawValidData.forEach(row => {
            const namaLengkapRaw = String(row['Nama Lengkap'] || '').trim();
            const nikRaw = String(row['NIK'] || '').trim();
            const idJemaatRaw = String(row['ID Jemaat'] || row.idJemaat || '').trim();
            const idKkRaw = String(row['ID KK'] || row.idKk || '').trim();

            // VALIDASI DUPLIKAT TERBATAS (Hanya cek NIK/ID dan Nama, abaikan Tanggal Lahir)
            const isDuplicate = jemaatData.some(existing => 
                existing.namaLengkap?.toLowerCase() === namaLengkapRaw.toLowerCase() &&
                ( (existing.nik && existing.nik === nikRaw) || (existing.idJemaat && existing.idJemaat === idJemaatRaw) )
            );

            if (isDuplicate) {
                duplicateCount++;
                return; 
            }

            const tgl = pad0(row['Tanggal lahir'] || '1');
            const bln = getMonthNumber(row['Bulan Lahir']);
            const thn = row['Tahun lahir'] || '1900';
            
            let jenisNikah = row['Status nikah'] || '';
            if (row['Status nikah/Nikah Gereja/Masehi'] === 'Ya' || row['Status nikah/Nikah Gereja/Masehi'] == 1) jenisNikah = 'Nikah Gereja/Masehi';
            else if (row['Status nikah/Nikah Adat'] === 'Ya' || row['Status nikah/Nikah Adat'] == 1) jenisNikah = 'Nikah Adat';
            else if (row['Status nikah/Nikah Catatan Sipil/BS'] === 'Ya' || row['Status nikah/Nikah Catatan Sipil/BS'] == 1) jenisNikah = 'Nikah Catatan Sipil/BS';

            const rayonClean = String(row['Rayon'] || '').replace(/\D/g, '') || '0';

            const baseData = {
                noRayon: rayonClean,
                alamat: String(row['Alamat'] || '').trim(),
                noTelp: String(row['No.Telp'] || '').trim(),
                kepalaKeluarga: String(row['Nama Kepala Keluarga'] || '').trim(),
                namaLengkap: namaLengkapRaw,
                nik: nikRaw,
                jk: String(row['Jenis Kelamin'] || '').trim().toUpperCase().startsWith('L') ? 'Laki-laki' : 'Perempuan',
                tempatLahir: String(row['Tempat Lahir'] || '').trim(),
                tanggalLahir: `${thn}-${bln}-${tgl}`,
                goldar: String(row['Golongan Darah'] || 'Tidak Tahu').trim(),
                statusKeluarga: String(row['Status dalam Keluarga'] || '').trim(),
                baptis: String(row['Baptis'] || '').trim(),
                sidi: String(row['Sidi'] || '').trim(),
                nikah: String(row['Nikah'] || '').trim(),
                jenisNikah: jenisNikah,
                sukuAyah: String(row['Suku Ayah'] || '').trim(),
                sukuIbu: String(row['Suku Ibu'] || '').trim(),
                pendidikan: String(row['Pendidikan'] || '').trim(),
                pekerjaan: String(row['Pekerjaan utama'] || '').trim(),
                penghasilan: String(row['Penghasilan'] || '').trim(),
                asuransi: String(row['Apakah mempunyai jaminan/asuransi kesehatan?'] || '').trim(),
                jaminan: String(row['Jaminan Kesehatan'] || row['Jika asuransi lainnya, sebutkan!'] || '').trim(),
                jandaDuda: String(row['Janda / Duda'] || '').trim(),
                yatimPiatu: String(row['Yatim / Piatu'] || '').trim(),
                disabilitas: String(row['Disabilitas'] || '').trim(),
                jenisDisabilitas: String(row['Jika ya, sebutkan ragam disabilitas'] || '').trim(),
                statusKeanggotaan: 'Aktif',
                statusHidup: 'Hidup',
                createdAt: Date.now()
            };

            // MANAJEMEN ID OTOMATIS
            if (idKkRaw && idJemaatRaw) {
                // Mempertahankan ID bawaan dari JSON (Tetap)
                validDataToImport.push({ 
                    ...baseData, 
                    idKk: idKkRaw, 
                    idJemaat: idJemaatRaw,
                    noAnggota: String(row['No Anggota'] || row.noAnggota || '1'),
                    urutanKk: String(row['Urutan KK'] || row.urutanKk || '1')
                });
            } else {
                // Data baru tanpa ID (Masuk grup untuk generate ID)
                const kepalaKeluargaKey = baseData.kepalaKeluarga.toUpperCase();
                const groupKey = `${rayonClean}_${kepalaKeluargaKey}`;

                if (!familyGroups[groupKey]) {
                    if (!rayonTracker[rayonClean]) rayonTracker[rayonClean] = 0;
                    rayonTracker[rayonClean]++; 
                    familyGroups[groupKey] = {
                        urutanKk: rayonTracker[rayonClean],
                        members: []
                    };
                }
                familyGroups[groupKey].members.push(baseData);
            }
        });

        // 4. Generate ID untuk Keluarga Baru
        Object.values(familyGroups).forEach(group => {
            const urutanKkFinal = group.urutanKk;
            
            // Urutkan Kepala Keluarga No.1, Istri No.2
            group.members.sort((a, b) => {
                const statusA = String(a.statusKeluarga).toLowerCase();
                const statusB = String(b.statusKeluarga).toLowerCase();
                if (statusA.includes('kepala')) return -1;
                if (statusB.includes('kepala')) return 1;
                if (statusA.includes('istri')) return -1;
                if (statusB.includes('istri')) return 1;
                return 0;
            });

            group.members.forEach((memberData, index) => {
                const noAnggotaFinal = index + 1;
                const ry = memberData.noRayon;
                
                const idKkGenerated = `KK${pad0(ry)}${pad0(urutanKkFinal)}`;
                const idJemaatGenerated = `AG${pad0(ry)}${pad0(urutanKkFinal)}${pad0(noAnggotaFinal)}`;

                validDataToImport.push({
                    ...memberData,
                    idKk: idKkGenerated,
                    idJemaat: idJemaatGenerated,
                    urutanKk: urutanKkFinal.toString(),
                    noAnggota: noAnggotaFinal.toString()
                });
            });
        });

        if (validDataToImport.length === 0) {
           alert(`Tidak ada data baru yang berhasil diproses. Ditemukan ${duplicateCount} data duplikat/ditolak.`); return;
        }

        // 5. Batch Upload ke Firestore
        const chunkSize = 400;
        for (let i = 0; i < validDataToImport.length; i += chunkSize) {
           const chunk = validDataToImport.slice(i, i + chunkSize);
           const batch = writeBatch(db);
           chunk.forEach((dataRow) => {
               const docRef = doc(collection(db, "jemaat"));
               batch.set(docRef, dataRow);
           });
           await batch.commit();
        }

        alert(`MIGRASI SUKSES!\n${validDataToImport.length} data jemaat berhasil diimpor.\nData duplikat ditolak: ${duplicateCount} data.`);
        e.target.value = null;

      } catch (error) {
         console.error("Gagal import JSON:", error);
         alert("Terjadi kesalahan sistem saat memproses data JSON.");
      }
    };
    reader.readAsText(file);
  };

   return (
    <div className="animate-in fade-in duration-300">
       {/* SUB MENU PENGALIH TABEL & GRAFIK */}
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

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden print:border-none print:shadow-none">
            {/* TOP ACTION BAR */}
            <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mr-4">
                   <Users className="w-6 h-6 text-green-600" /> Data Jemaat
                </h2>
                
                {subTabJemaat !== 'Infografis' && (appUser?.role === 'admin' || appUser?.role === 'penatua') && (
                    <button onClick={() => { setFormData({ penatua: appUser?.role === 'penatua' ? appUser?.name : '' }); setModalMode('addJemaat'); }} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95">
                      <Plus className="w-4 h-4"/> Tambah Data Jemaat
                    </button>
                )}

                {subTabJemaat !== 'Infografis' && appUser?.role === 'admin' && (
                    <div className="relative">
                       <button onClick={() => setShowMenuOps(!showMenuOps)} className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95">
                         Opsi Lain <ChevronDown className={`w-4 h-4 transform transition-transform ${showMenuOps ? 'rotate-180' : ''}`} />
                       </button>
                       {showMenuOps && ( 
                           <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowMenuOps(false)}></div>
                              <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                                 <button onClick={() => { setShowMenuOps(false); handleExportCSV(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm font-bold text-gray-700"><Download className="w-4 h-4 text-emerald-600"/> Download Excel Bawaan</button>
                                 <button onClick={handleExportSinode} className="... whitespace-nowrap ...">
                                 Laporan ke Sinode
                                 </button>
                                 <label className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-left text-sm font-bold text-emerald-700 cursor-pointer border-t border-gray-100 m-0">
   <FileUp className="w-4 h-4 text-emerald-500"/> Eksekusi Import JSON
   <input 
      type="file" 
      accept=".json" 
      onChange={(e) => { setShowMenuOps(false); handleImportJSON(e); }} 
      className="hidden" 
   />
</label>
                                 <button onClick={() => { setShowMenuOps(false); fileInputRef.current.click(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm font-bold text-gray-700"><FileUp className="w-4 h-4 text-amber-500"/> Import CSV</button>
                                 <div className="h-px bg-gray-100 w-full"></div>
                                 <button onClick={() => { setShowMenuOps(false); handleCleanAll('jemaat'); }} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-left text-sm font-bold text-red-600"><Trash2 className="w-4 h-4"/> Kosongkan Data</button>
                              </div>
                           </> 
                       )}
                    </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                  <select value={filterRayon} onChange={(e) => setFilterRayon(e.target.value)} className="bg-blue-50 border-2 border-blue-200 text-blue-800 text-sm font-bold rounded-xl px-4 py-3 outline-none w-full sm:w-auto shrink-0">
                    <option value="Semua">Semua Rayon</option>
                    {rayonList.map(i => <option key={i} value={i}>Rayon {i}</option>)}
                  </select>

               {subTabJemaat !== 'Infografis' && (
                  <>
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
                  </>
               )}
              </div>
            </div>

            {/* AREA RENDER UTAMA */}
            <div className="p-0">
                <div className="hidden print:block mb-4 border-b-2 border-black pb-4">
                   <h1 className="text-2xl font-bold uppercase text-center">Data {subTabJemaat}</h1>
                   <p className="text-center font-bold text-sm mt-1">Rayon: {filterRayon}</p>
                   <p className="text-center font-medium text-sm">Jemaat {churchProfile?.jemaat}</p>
                </div>

                {subTabJemaat === 'Infografis' ? (
                   <div className="bg-gray-50 min-h-[50vh]">
                      <InfografisTab data={jemaatData} filterRayon={filterRayon} type="jemaat" />
                   </div>
                ) : (
                   <>
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
                                      tabCols={tabCols} activeTab="Data Jemaat"
                                      appUser={appUser} 
                                      isEditable={appUser?.role === 'admin' || (appUser?.role === 'penatua' && penatuaMap[row?.noRayon] === appUser?.name)}
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
                               <div key={row.dbId||idx} className={`bg-white border border-gray-200 border-l-8 ${getColorClassById(row.idKk)} rounded-2xl shadow-sm overflow-hidden transition-all duration-200`}>
                                  {/* Kartu Utama (Bisa Diklik) */}
                                  <div onClick={() => setExpandedId(prev => prev === row.dbId ? null : row.dbId)} className="p-4 flex items-center gap-4 cursor-pointer active:bg-blue-50">
                                     <div className="flex flex-col items-center justify-center min-w-50px">
                                        <span className="text-3xl font-black text-red-600 leading-none">{calculateAge(row.tanggalLahir)}</span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Tahun</span>
                                     </div>
                                     
                                     <div className="w-px h-10 border-l-2 border-dashed border-gray-300"></div>
                                     
                                     <div className="flex-1">
                                        <h4 className="font-bold text-blue-900 text-sm">{row.namaLengkap}</h4>
                                        {/* KODE BARU */}
                                        <p className="text-xs font-semibold text-gray-600 mt-1">
                                          Nama KK: <span className="font-bold text-gray-800">{row.kepalaKeluarga || '-'}</span>
                                        </p>
                                     </div>
                                     
                                     <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedId === row.dbId ? 'rotate-180 text-blue-500' : ''}`} />
                                  </div>

                                  {/* Aksi Tambahan (Muncul Saat Kartu Diperluas) */}
                                  {expandedId === row.dbId && (
                                     <div className="bg-blue-50/50 border-t border-gray-100 p-4 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                                        <button onClick={() => handleRowAction('view', row)} className="flex-1 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"><Eye className="w-4 h-4"/> Detail</button>
                                        
                                        {(appUser?.role === 'admin' || (appUser?.role === 'penatua' && penatuaMap[row?.noRayon] === appUser?.name)) && (
                                           <>
                                              <button onClick={() => handleRowAction('edit', row)} className="flex-1 py-2.5 bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"><Edit className="w-4 h-4"/> Edit</button>
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
                   </>
                )}
            </div>

            {/* PAGINASI */}
            {subTabJemaat !== 'Infografis' && (
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
        </div>
    </div>
   );
}