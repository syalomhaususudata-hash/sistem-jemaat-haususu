import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { safeStr, isL, isP, toDisplayDate, getFormatDate } from '../utils/helpers';

export function PrintKkTemplate({ kkToPrint, jemaatData, penatuaMap, churchProfile, onBack }) {
  if (!kkToPrint) return null;
  const dataKk = jemaatData.find(d => d.idKk === kkToPrint && d.statusKeluarga === 'Kepala Keluarga');
  const anggotaKk = jemaatData
    .filter(d => d.idKk === kkToPrint && d.statusKeanggotaan !== 'Meninggal' && d.statusKeanggotaan !== 'Pindah' && d.namaLengkap && d.namaLengkap.trim() !== '')
    .sort((a,b) => parseInt(a.noAnggota) - parseInt(b.noAnggota));
  
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
       
       <h3 className="font-bold text-[10px] mb-1 uppercase bg-gray-200 print:bg-transparent print:text-black p-0.5 text-center border border-black">Tabel 1: Identitas Umum</h3>
       <table className="w-full border-collapse border border-black mb-2 text-[9px] text-center">
          <thead><tr className="bg-gray-100 print:bg-transparent print:text-black"><th className={b}>NO</th><th className={b}>NAMA LENGKAP</th><th className={b}>NIK</th><th className={b}>JK</th><th className={b}>TEMPAT LAHIR</th><th className={b}>TGL LAHIR</th><th className={b}>DOMISILI</th><th className={b}>PENDIDIKAN</th><th className={b}>PEKERJAAN</th><th className={b}>PENGHASILAN</th><th className={b}>GOL DARAH</th><th className={b}>ASURANSI KES</th><th className={b}>DISABILITAS</th></tr></thead>
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
       
       <h3 className="font-bold text-[10px] mb-1 uppercase bg-gray-200 print:bg-transparent print:text-black p-0.5 text-center border border-black">Tabel 2: Riwayat Agama & Keluarga</h3>
       <table className="w-full border-collapse border border-black mb-4 text-[9px] text-center">
          <thead><tr className="bg-gray-100 print:bg-transparent print:text-black"><th className={b}>NO</th><th className={b}>TEMPAT BAPTIS</th><th className={b}>TGL BAPTIS</th><th className={b}>PENDETA BAPTIS</th><th className={b}>TEMPAT SIDI</th><th className={b}>TGL SIDI</th><th className={b}>PENDETA SIDI</th><th className={b}>TEMPAT NIKAH</th><th className={b}>TGL NIKAH</th><th className={b}>PENDETA NIKAH</th><th className={b}>JENIS NIKAH</th><th className={b}>STATUS KELUARGA</th><th className={b}>JANDA/YATIM</th><th className={b}>JABATAN JEMAAT</th><th className={b}>JABATAN MASY.</th></tr></thead>
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

export function PrintMajelisTemplate({ majelisToPrint, majelisData, penatuaMap, churchProfile, onBack }) {
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
             <h3 className="font-bold text-lg border-b border-black mb-2 uppercase bg-gray-100 print:bg-transparent print:text-black p-1">A. IDENTITAS DIRI</h3>
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
          <h3 className="font-bold text-lg border-b border-black mb-2 uppercase bg-gray-100 print:bg-transparent print:text-black p-1">B. RIWAYAT GEREJAWI PRIBADI</h3>
          <table className="w-full text-sm">
             <tbody>
                <tr><td className="py-1 w-48 font-semibold">Gereja & Tgl Baptis</td><td>: {safeStr(mj.gerejaBaptis)} ({toDisplayDate(mj.tanggalBaptis)})</td></tr>
                <tr><td className="py-1 font-semibold">Gereja & Tgl Sidi</td><td>: {safeStr(mj.gerejaSidi)} ({toDisplayDate(mj.tanggalSidi)})</td></tr>
                <tr><td className="py-1 font-semibold">Nama Ayah / Ibu Kandung</td><td>: {safeStr(mj.namaAyah)} / {safeStr(mj.namaIbu)}</td></tr>
             </tbody>
          </table>
       </div>
       
       <div className="mb-6">
          <h3 className="font-bold text-lg border-b border-black mb-2 uppercase bg-gray-100 print:bg-transparent print:text-black p-1">C. DATA KELUARGA</h3>
          <table className="w-full text-sm mb-4">
             <tbody>
                <tr><td className="py-1 w-48 font-semibold">Status Menikah</td><td>: {Array.isArray(mj.statusMenikah)?mj.statusMenikah.join(', '):safeStr(mj.statusMenikah)}</td></tr>
                <tr><td className="py-1 font-semibold">Nama Suami/Istri</td><td>: <span className="font-bold">{safeStr(mj.namaPasangan)}</span></td></tr>
                <tr><td className="py-1 font-semibold">Tempat, Tgl Lahir Pasangan</td><td>: {safeStr(mj.tempatLahirPasangan)}, {toDisplayDate(mj.tanggalLahirPasangan)}</td></tr>
             </tbody>
          </table>
          <p className="font-bold mb-1">Data Anak:</p>
          <table className="w-full border-collapse border border-black text-xs text-center">
             <thead className="bg-gray-100 print:bg-transparent print:text-black"><tr><th className={b}>No</th><th className={b}>Nama Anak</th><th className={b}>Tempat, Tgl Lahir</th><th className={b}>Gereja Baptis</th><th className={b}>Gereja Sidi</th></tr></thead>
             <tbody>
                {anakArr.length > 0 ? anakArr.map((a, i) => (
                   <tr key={i}><td className={b}>{i+1}</td><td className={`text-left font-bold ${b}`}>{safeStr(a.nama)}</td><td className={b}>{safeStr(a.tempatLahir)}, {toDisplayDate(a.tanggalLahir)}</td><td className={b}>{safeStr(a.gerejaBaptis)} {a.tanggalBaptis ? `(${toDisplayDate(a.tanggalBaptis)})` : ''}</td><td className={b}>{safeStr(a.gerejaSidi)} {a.tanggalSidi ? `(${toDisplayDate(a.tanggalSidi)})` : ''}</td></tr>
                )) : <tr><td colSpan="5" className="border border-black p-2 italic text-gray-500">Tidak ada data anak tercatat.</td></tr>}
             </tbody>
          </table>
       </div>
       
      {/* PASTIKAN ANDA MENEMPELKAN KODE MULAI DARI SINI */}
       <div className="mb-6">
          <h3 className="font-bold text-lg border-b border-black mb-2 uppercase bg-gray-100 print:bg-transparent print:text-black p-1">D. RIWAYAT PENDIDIKAN</h3>
          <table className="w-full border-collapse border border-black text-xs text-center">
             <thead className="bg-gray-100 print:bg-transparent print:text-black">
               <tr>
                   <th className={b}>Tingkat</th><th className={b}>Nama Institusi</th>
                   <th className={b}>Jurusan / Jenjang</th><th className={b}>Tahun Mulai</th><th className={b}>Tahun Tamat</th>
               </tr>
             </thead>
             <tbody>
                <tr>
                   <td className={`font-bold ${b}`}>SD</td><td className={`text-left ${b}`}>{safeStr(mj.namaSd)}</td>
                   <td className={b}>-</td><td className={b}>{safeStr(mj.tahunMulaiSd)}</td><td className={b}>{safeStr(mj.tahunTamatSd)}</td>
                </tr>
                <tr>
                   <td className={`font-bold ${b}`}>SMP</td><td className={`text-left ${b}`}>{safeStr(mj.namaSmp)}</td>
                   <td className={b}>-</td><td className={b}>{safeStr(mj.tahunMulaiSmp)}</td><td className={b}>{safeStr(mj.tahunTamatSmp)}</td>
                </tr>
                <tr>
                   <td className={`font-bold ${b}`}>SMA</td><td className={`text-left ${b}`}>{safeStr(mj.namaSma)}</td>
                   <td className={b}>-</td><td className={b}>{safeStr(mj.tahunMulaiSma)}</td><td className={b}>{safeStr(mj.tahunTamatSma)}</td>
                </tr>
                <tr>
                   <td className={`font-bold ${b}`}>PT</td><td className={`text-left ${b}`}>{safeStr(mj.namaPt)}</td>
                   <td className={b}>{safeStr(mj.jurusanPt)} {mj.jenjangPt ? `(${safeStr(mj.jenjangPt)})` : ''}</td>
                   <td className={b}>{safeStr(mj.tahunMasukPt)}</td><td className={b}>{safeStr(mj.tahunTamatPt)}</td>
                </tr>
             </tbody>
          </table>
       </div>

       <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 print:grid-cols-2">
          <div>
              <h3 className="font-bold text-lg border-b border-black mb-2 uppercase bg-gray-100 print:bg-transparent print:text-black p-1">E. RIWAYAT PEKERJAAN</h3>
              <table className="w-full text-sm">
                 <tbody>
                    <tr><td className="py-1 w-32 font-semibold align-top">Nama Lembaga</td><td className="align-top">: {safeStr(mj.namaLembagaKerja)}</td></tr>
                    <tr><td className="py-1 font-semibold align-top">Jabatan</td><td className="align-top">: {safeStr(mj.jabatanKerja)}</td></tr>
                    <tr><td className="py-1 font-semibold align-top">Periode</td><td className="align-top">: {mj.tahunMulaiKerja ? `${safeStr(mj.tahunMulaiKerja)} - ${safeStr(mj.tahunSelesaiKerja) || 'Sekarang'}` : '-'}</td></tr>
                 </tbody>
              </table>
          </div>
          <div>
              <h3 className="font-bold text-lg border-b border-black mb-2 uppercase bg-gray-100 print:bg-transparent print:text-black p-1">F. RIWAYAT PELAYANAN</h3>
              <table className="w-full text-sm">
                 <tbody>
                    <tr><td className="py-1 w-32 font-semibold align-top">Tempat Melayani</td><td className="align-top">: {safeStr(mj.gerejaPelayananLama)}</td></tr>
                    <tr><td className="py-1 font-semibold align-top">Jabatan Lama</td><td className="align-top">: {safeStr(mj.jabatanPelayananLama)}</td></tr>
                    <tr><td className="py-1 font-semibold align-top">Periode</td><td className="align-top">: {mj.tahunMulaiPelayanan ? `${safeStr(mj.tahunMulaiPelayanan)} - ${safeStr(mj.tahunSelesaiPelayanan) || 'Sekarang'}` : '-'}</td></tr>
                 </tbody>
              </table>
          </div>
       </div>
       {/* SAMPAI SINI SAJA */}

       <div className="mt-10 text-right pr-8 text-sm">
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

export function PrintListTemplate({ listToPrint, tabCols, filteredData, filterRayon, filterKategori, churchProfile, onBack }) {
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
          <thead className="bg-gray-100 print:bg-transparent print:text-black">
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
       
       <div className="flex justify-end mt-6 pr-4 text-xs">
          <div className="text-center">
             <p>{churchProfile.mataJemaat || churchProfile.jemaat}, {getFormatDate()}</p>
             <p>Majelis Mata Jemaat</p>
             <p className="mb-16">Sekretaris / Wakil Sekretaris,</p>
             <p className="font-bold underline uppercase">{safeStr(churchProfile.namaSekretaris || 'NAMA SEKRETARIS')}</p>
          </div>
       </div>
       
       <div className="flex items-center justify-center mt-6 gap-4 print:hidden">
          <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 font-bold text-white rounded shadow">Cetak Kertas Ini</button>
          <button onClick={onBack} className="px-4 py-2 bg-gray-500 font-bold text-white rounded shadow"><ArrowLeft className="w-4 h-4 inline mr-2"/> Kembali</button>
       </div>
    </div>
  );
}

// --- TAMBAHKAN DI BAGIAN PALING BAWAH FILE PrintTemplates.jsx ---

export function PrintAuditTemplate({ auditData, auditFilter, auditRayon, churchProfile, onBack }) {
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
          </div>
       </div>
       
       <div className="text-center mb-6 leading-tight">
          <h1 className="text-xl font-black uppercase text-red-600 print:text-black">LAPORAN AUDIT DATA BELUM LENGKAP</h1>
          <p className="font-bold mt-1 text-sm bg-gray-200 inline-block px-4 py-1 rounded-full print:bg-transparent print:p-0">
             Kategori: {auditFilter} | Rayon: {auditRayon}
          </p>
       </div>
       
        <table className="w-full border-collapse border border-black text-xs leading-tight text-left mb-6">
          <thead className="bg-gray-100 print:bg-transparent print:text-black text-center">
             <tr>
                <th className={b}>NO</th>
                <th className={b}>NAMA LENGKAP</th>
                <th className={b}>TIPE ANGGOTA</th>
                <th className={b}>KOLOM YANG BELUM DIISI (KOSONG)</th>
             </tr>
          </thead>
          <tbody>
             {(!auditData.list || auditData.list.length === 0) ? (
                 <tr><td colSpan="4" className="border border-black p-4 text-center italic font-bold">Semua data pada kategori dan rayon ini sudah terisi lengkap.</td></tr>
             ) : (
                 auditData.list.map((row, i) => (
                    <tr key={i}>
                       <td className={`text-center ${b}`}>{i+1}</td>
                       <td className={`font-bold ${b}`}>{safeStr(row.nama)}</td>
                       <td className={`text-center ${b}`}>{safeStr(row.tipe)}</td>
                       <td className={`text-red-600 font-semibold print:text-black ${b}`}>{safeStr(row.missing)}</td>
                    </tr>
                 ))
             )}
          </tbody>
       </table>
       
       <div className="flex items-center justify-center mt-8 gap-4 print:hidden">
          <button onClick={() => window.print()} className="px-6 py-2.5 bg-blue-600 font-bold text-white rounded shadow-md flex items-center gap-2"><Printer className="w-4 h-4"/> Cetak / Simpan sbg PDF</button>
          <button onClick={onBack} className="px-6 py-2.5 bg-gray-500 font-bold text-white rounded shadow-md flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Kembali</button>
       </div>
    </div>
  );
}