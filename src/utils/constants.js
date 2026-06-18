// src/utils/constants.js
export const DEFAULT_PENATUA = { '1': "Penatua Rayon 1", '2': "Penatua Rayon 2", '3': "Penatua Rayon 3", '4': "Penatua Rayon 4", '5': "Penatua Rayon 5", '6': "Penatua Rayon 6" };
export const DEFAULT_CHURCH_PROFILE = { sinode: "GEREJA MASEHI INJILI DI TIMOR (GMIT)", klasis: "", jemaat: "NAMA GEREJA", mataJemaat: "", alamat: "Alamat Gereja", namaSekretaris: "Nama Sekretaris" };
export const PEKERJAAN_LIST = ["Tidak/Belum bekerja", "Ibu Rumah Tangga", "Pelajar", "Mahasiswa", "Pensiunan", "PNS", "TNI", "POLRI", "Tenaga Kontrak/Honorer", "Karyawan Swasta", "Pembantu Rumah Tangga", "Buruh/Serabutan", "Petani", "Peternak", "Nelayan", "Pedagang", "Pengrajin", "Penjahit", "Tukang Cukur", "Seniman", "Konsultan", "Kontraktor", "Pekerja Migran", "Wiraswasta lainnya", "Guru", "Dosen", "Pendeta", "Dokter", "Bidan/Perawat", "Lainnya"];
export const KATEGORI_PELAYANAN = ["Semua Kategori", "Lansia Laki-laki (>= 60 tahun)", "Lansia Perempuan (>= 60 tahun)", "Bapak GMIT (35-59 tahun)", "Perempuan GMIT (35-59 tahun)", "Pemuda Laki-laki (17-34 tahun)", "Pemuda Perempuan (17-34 tahun)", "Teruna Laki-laki (15-16 tahun)", "Teruna Perempuan (15-16 tahun)", "Remaja Laki-laki (12-14 tahun)", "Remaja Perempuan (12-14 tahun)", "Anak-anak Laki-laki (5-11 tahun)", "Anak-anak Perempuan (5-11 tahun)", "Balita Laki-laki (0-4 tahun)", "Balita Perempuan (0-4 tahun)"];
export const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export const JEMAAT_HEADERS = ["ID KK", "Kepala Keluarga", "No Rayon", "Urutan KK", "Bentuk Rumah", "Status Rumah", "Penatua Rayon", "No Anggota", "ID Jemaat", "Nama Lengkap", "NIK", "Jenis Kelamin", "Golongan Darah", "Tempat Lahir", "Tanggal Lahir", "Usia", "Alamat Domisili", "Suku Ayah", "Suku Ibu", "Status Keluarga", "Baptis", "Gereja Baptis", "Tgl Baptis", "Pendeta Baptis", "Sidi", "Gereja Sidi", "Tgl Sidi", "Pendeta Sidi", "Nikah", "Jenis Nikah", "Gereja Nikah", "Tgl Nikah", "Pendeta Nikah", "Pendidikan", "Pekerjaan", "Penghasilan", "Asuransi Kesehatan", "Jaminan", "Janda/Duda", "Yatim/Piatu", "Disabilitas", "Jenis Disabilitas", "Jabatan di Jemaat", "Jabatan di Masyarakat", "Status Keanggotaan", "Tanggal Kematian", "Tanggal Penguburan", "Asal Jemaat", "Tanggal Masuk", "Pindah Ke Gereja", "Tanggal Pindah"];
export const JEMAAT_HEADER_MAP = { "ID KK": "idKk", "Kepala Keluarga": "kepalaKeluarga", "No Rayon": "noRayon", "Urutan KK": "urutanKk", "Bentuk Rumah": "bentukRumah", "Status Rumah": "statusRumah", "Penatua Rayon": "penatua", "No Anggota": "noAnggota", "ID Jemaat": "idJemaat", "Nama Lengkap": "namaLengkap", "NIK": "nik", "Jenis Kelamin": "jk", "Golongan Darah": "goldar", "Tempat Lahir": "tempatLahir", "Tanggal Lahir": "tanggalLahir", "Alamat Domisili": "alamat", "Suku Ayah": "sukuAyah", "Suku Ibu": "sukuIbu", "Status Keluarga": "statusKeluarga", "Baptis": "baptis", "Nama Gereja Baptis": "gerejaBaptis", "Tanggal Baptis": "tanggalBaptis", "Pendeta yang Baptis": "pendetaBaptis", "Sudah Sidi": "sidi", "Nama Gereja Sidi": "gerejaSidi", "Tanggal Sidi": "tanggalSidi", "Pendeta yang Sidi": "pendetaSidi", "Sudah Nikah": "nikah", "Nama Gereja Pemberkatan Nikah": "gerejaNikah", "Tanggal Pemberkatan Nikah": "tanggalNikah", "Pendeta yang Berkat Nikah": "pendetaNikah", "Jenis Nikah": "jenisNikah", "Pendidikan": "pendidikan", "Pekerjaan": "pekerjaan", "Penghasilan": "penghasilan", "Asuransi Kesehatan": "asuransi", "Jaminan": "jaminan", "Janda/Duda": "jandaDuda", "Yatim/Piatu": "yatimPiatu", "Disabilitas": "disabilitas", "Jenis Disabilitas": "jenisDisabilitas", "Jabatan di Jemaat": "jabatanJemaat", "Jabatan di Masyarakat": "jabatanMasyarakat", "Status Keanggotaan": "statusKeanggotaan", "Tanggal Kematian": "tanggalKematian", "Tanggal Penguburan": "tanggalPenguburan", "Asal Jemaat": "asalJemaat", "Tanggal Masuk": "tanggalMasuk", "Pindah Ke Gereja": "pindahKeJemaat", "Tanggal Pindah": "tanggalPindah" };

export const MAJELIS_HEADERS = ["Nomor Rayon", "Nama Lengkap", "Nama Panggilan", "Tempat Lahir", "Tanggal Lahir", "Jenis Kelamin", "Status Menikah", "Pekerjaan", "Jabatan di Masyarakat", "Jabatan Pelayanan", "Jabatan Gereja", "Jabatan Organisasi Majelis", "Jumlah Saudara", "Anak Ke", "Golongan Darah", "Gereja Baptis", "Tanggal Baptis", "Gereja Sidi", "Tanggal Sidi", "Tempat Nikah", "Tanggal Nikah", "Nama Ayah", "Nama Ibu", "Nama Suami/Istri", "Tempat Lahir Pasangan", "Tanggal Lahir Pasangan", "Pekerjaan Pasangan", "Gereja Baptis Pasangan", "Tanggal Baptis Pasangan", "Gereja Sidi Pasangan", "Tanggal Sidi Pasangan", "Nama SD", "Tahun Mulai SD", "Tahun Tamat SD", "Nama SMP", "Tahun Mulai SMP", "Tahun Tamat SMP", "Nama SMA", "Tahun Mulai SMA", "Tahun Tamat SMA", "Nama PT", "Jurusan PT", "Jenjang PT", "Tahun Masuk PT", "Tahun Tamat PT", "Nama Lembaga Kerja", "Jabatan Kerja", "Tahun Mulai Kerja", "Tahun Selesai Kerja", "Gereja Pelayanan Lama", "Jabatan Pelayanan Lama", "Tahun Mulai Pelayanan", "Tahun Selesai Pelayanan"];

export const MAJELIS_HEADER_MAP = { "Nomor Rayon": "noRayon", "Nama Lengkap": "namaLengkap", "Nama Panggilan": "namaPanggilan", "Tempat Lahir": "tempatLahir", "Tanggal Lahir": "tanggalLahir", "Jenis Kelamin": "jk", "Status Menikah": "statusMenikah", "Pekerjaan": "pekerjaan", "Jabatan di Masyarakat": "jabatanMasyarakat", "Jabatan Pelayanan": "jabatanPelayanan", "Jabatan Gereja": "jabatanGereja", "Jabatan Organisasi Majelis": "jabatanOrganisasiMajelis", "Jumlah Saudara": "jumlahSaudara", "Anak Ke": "anakKe", "Golongan Darah": "goldar", "Gereja Baptis": "gerejaBaptis", "Tanggal Baptis": "tanggalBaptis", "Gereja Sidi": "gerejaSidi", "Tanggal Sidi": "tanggalSidi", "Tempat Nikah": "tempatNikah", "Tanggal Nikah": "tanggalNikah", "Nama Ayah": "namaAyah", "Nama Ibu": "namaIbu", "Nama Suami/Istri": "namaPasangan", "Tempat Lahir Pasangan": "tempatLahirPasangan", "Tanggal Lahir Pasangan": "tanggalLahirPasangan", "Pekerjaan Pasangan": "pekerjaanPasangan", "Gereja Baptis Pasangan": "gerejaBaptisPasangan", "Tanggal Baptis Pasangan": "tanggalBaptisPasangan", "Gereja Sidi Pasangan": "gerejaSidiPasangan", "Tanggal Sidi Pasangan": "tanggalSidiPasangan", "Nama SD": "namaSd", "Tahun Mulai SD": "tahunMulaiSd", "Tahun Tamat SD": "tahunTamatSd", "Nama SMP": "namaSmp", "Tahun Mulai SMP": "tahunMulaiSmp", "Tahun Tamat SMP": "tahunTamatSmp", "Nama SMA": "namaSma", "Tahun Mulai SMA": "tahunMulaiSma", "Tahun Tamat SMA": "tahunTamatSma", "Nama PT": "namaPt", "Jurusan PT": "jurusanPt", "Jenjang PT": "jenjangPt", "Tahun Masuk PT": "tahunMasukPt", "Tahun Tamat PT": "tahunTamatPt", "Nama Lembaga Kerja": "namaLembagaKerja", "Jabatan Kerja": "jabatanKerja", "Tahun Mulai Kerja": "tahunMulaiKerja", "Tahun Selesai Kerja": "tahunSelesaiKerja", "Gereja Pelayanan Lama": "gerejaPelayananLama", "Jabatan Pelayanan Lama": "jabatanPelayananLama", "Tahun Mulai Pelayanan": "tahunMulaiPelayanan", "Tahun Selesai Pelayanan": "tahunSelesaiPelayanan" };

// KODE BARU (Ganti seluruh array FORM_MAJELIS lama dengan ini)
export const FORM_MAJELIS = [
  {t: 'Profil Dasar', f: [
    {l:'Nomor Rayon', k:'noRayon', t:'sel', opts:['1','2','3','4','5','6','7','8','9','10'], span: 3},
    {l:'Nama Lengkap (Ketik/Pilih Data Jemaat)', k:'namaLengkap', span: 2},
    {l:'Nama Panggilan', k:'namaPanggilan', span: 1},
    {l:'Tempat Lahir', k:'tempatLahir', span: 2},
    {l:'Tanggal Lahir', k:'tanggalLahir', t:'date', span: 1},
    {l:'Jenis Kelamin', k:'jk', t:'sel', opts:['Laki-laki', 'Perempuan'], span: 2},
    {l:'Golongan Darah', k:'goldar', t:'sel', opts:['A', 'B', 'AB', 'O', 'Tidak Tahu'], span: 1},
    {l:'Anak Ke-', k:'anakKe', t:'num', span: 1},
    {l:'Dari Jumlah Saudara', k:'jumlahSaudara', t:'num', span: 2},
    {l:'Pekerjaan', k:'pekerjaan', t:'sel', opts:PEKERJAAN_LIST, span: 3},
    {l:'Jabatan dalam Masyarakat', k:'jabatanMasyarakat', span: 1},
    {t: 'sel', l: 'Jabatan Pelayanan', k: 'jabatanPelayanan', req: true, span: 1, opts: ['Penatua', 'Diaken', 'Pengajar', 'Koster']},
    {l:'Jabatan Organisasi Majelis', k:'jabatanOrganisasiMajelis', span: 1}
  ]},
  {t: 'Riwayat Agama', f: [
    {l:'Gereja Baptis', k:'gerejaBaptis', span: 2},
    {l:'Tgl Baptis', k:'tanggalBaptis', t:'date', span: 1},
    {l:'Gereja Sidi', k:'gerejaSidi', span: 2},
    {l:'Tgl Sidi', k:'tanggalSidi', t:'date', span: 1},
    {l:'Tempat/Gereja Pemberkatan Nikah', k:'tempatNikah', span: 2},
    {l:'Tanggal Nikah', k:'tanggalNikah', t:'date', span: 1},
    {l:'Status Menikah', k:'statusMenikah', t:'chk', span: 3, opts:['Nikah Adat', 'Nikah Gereja/Masehi', 'Nikah Catatan Sipil/BS']}
  ]},
  {t: 'Data Pasangan & Orang Tua', f: [
    {l:'Nama Ayah', k:'namaAyah', span: 2},
    {l:'Nama Ibu', k:'namaIbu', span: 1},
    {l:'Nama Suami/Istri', k:'namaPasangan', span: 3},
    {l:'Tempat Lahir Pasangan', k:'tempatLahirPasangan', span: 2},
    {l:'Tgl Lahir Pasangan', k:'tanggalLahirPasangan', t:'date', span: 1},
    {l:'Pekerjaan Pasangan', k:'pekerjaanPasangan', t:'sel', opts:PEKERJAAN_LIST, span: 3},
    {l:'Gereja Baptis Pasangan', k:'gerejaBaptisPasangan', span: 2},
    {l:'Tgl Baptis Pasangan', k:'tanggalBaptisPasangan', t:'date', span: 1},
    {l:'Gereja Sidi Pasangan', k:'gerejaSidiPasangan', span: 2},
    {l:'Tgl Sidi Pasangan', k:'tanggalSidiPasangan', t:'date', span: 1}
  ]},
  {t: 'Pendidikan', f: [
    {l:'Nama SD', k:'namaSd', span: 1}, {l:'Tahun Mulai SD', k:'tahunMulaiSd', t:'num', span: 1}, {l:'Tahun Tamat SD', k:'tahunTamatSd', t:'num', span: 1},
    {l:'Nama SMP', k:'namaSmp', span: 1}, {l:'Tahun Mulai SMP', k:'tahunMulaiSmp', t:'num', span: 1}, {l:'Tahun Tamat SMP', k:'tahunTamatSmp', t:'num', span: 1},
    {l:'Nama SMA', k:'namaSma', span: 1}, {l:'Tahun Mulai SMA', k:'tahunMulaiSma', t:'num', span: 1}, {l:'Tahun Tamat SMA', k:'tahunTamatSma', t:'num', span: 1},
    {l:'Nama Perguruan Tinggi', k:'namaPt', span: 3},
    {l:'Jurusan/Fakultas', k:'jurusanPt', span: 1}, {l:'Jenjang (D3/S1 dll)', k:'jenjangPt', span: 1}, {l:'Tahun Masuk PT', k:'tahunMasukPt', t:'num', span: 1}, 
    {l:'Tahun Tamat PT', k:'tahunTamatPt', t:'num', span: 3}
  ]},
  {t: 'Riwayat Pekerjaan', f: [
    {l:'Nama Lembaga/Perusahaan', k:'namaLembagaKerja', span:3}, 
    {l:'Jabatan/Posisi', k:'jabatanKerja', span:1}, {l:'Tahun Mulai Bekerja', k:'tahunMulaiKerja', t:'num', span:1}, {l:'Tahun Selesai Bekerja', k:'tahunSelesaiKerja', t:'num', span:1}
  ]},
  {t: 'Riwayat Pelayanan', f: [
    {l:'Pernah melayani? (Isi Nama Gereja)', k:'gerejaPelayananLama', span:3}, 
    {l:'Jabatan Lama', k:'jabatanPelayananLama', span: 1}, {l:'Periode Mulai (Tahun)', k:'tahunMulaiPelayanan', t:'num', span: 1}, {l:'Periode Selesai (Tahun)', k:'tahunSelesaiPelayanan', t:'num', span: 1},
    { t: 'date', l: 'Tanggal Mulai Pelayanan (Masa Bakti Ini)', k: 'tglMulaiPelayanan', span: 2 }, { t: 'date', l: 'Tanggal Akhir Pelayanan (Masa Bakti Ini)', k: 'tglAkhirPelayanan', span: 1 }
  ]}
];

// KODE BARU (Sudah dibersihkan & optimasi span/required)
export const JEMAAT_FIELDS_PRIBADI = [
  { name: 'noAnggota', label: 'No Anggota Keluarga Ke-', type: 'select', req: true, opts: [] },
  { name: 'namaLengkap', label: 'Nama Lengkap', req: true },
  { name: 'nik', label: 'NIK' },
  { name: 'jk', label: 'Jenis Kelamin', type: 'select', opts: ['Laki-laki', 'Perempuan'], req: true },
  { name: 'goldar', label: 'Golongan Darah', type: 'select', opts: ['A', 'B', 'AB', 'O', 'Tidak Tahu'] },
  { name: 'tempatLahir', label: 'Tempat Lahir' },
  { name: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date' },
  { name: 'alamat', label: 'Alamat Domisili Lengkap', span: 2 },
  { name: 'sukuAyah', label: 'Suku Ayah' },
  { name: 'sukuIbu', label: 'Suku Ibu' },
  { name: 'statusKeluarga', label: 'Status Dalam Keluarga', type: 'select', span: 1, opts: ['Kepala Keluarga', 'Istri', 'Anak kandung', 'Anak Angkat/asuh', 'Orangtua/Mertua', 'Kakek/Nenek', 'Saudara/Adik/Kakak', 'Cucu', 'Keponakan', 'Menantu', 'Famili/ipar', 'Lain-lain/Kost/Karyawan/Pembantu'], req: true }
];

export const JEMAAT_EDU = [
  { name: 'pendidikan', label: 'Pendidikan', type: 'select', opts: ['Tidak/Belum Sekolah', 'Tidak Tamat SD', 'SD', 'SMP/sederajat', 'SMA/sederajat', 'D I', 'D II', 'D III', 'D IV', 'S1', 'S2', 'S3'] },
  { name: 'pekerjaan', label: 'Pekerjaan', type: 'select', opts: PEKERJAAN_LIST }, { name: 'penghasilan', label: 'Penghasilan', type: 'select', opts: ['Tidak/belum ada penghasilan', 'dibawah Rp. 1 juta', 'Rp. 1 juta s/d Rp. 2.5 juta', 'Rp. 2.5 juta s/d Rp. 5 juta', 'diatas Rp. 5 juta'] }
];