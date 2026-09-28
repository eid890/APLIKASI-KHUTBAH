/**
 * =====================================================================
 *  JADWAL KHOTBAH JUMAT — BACKEND GOOGLE APPS SCRIPT  (v6.0)
 *  Pondok Pesantren Wihdatul Ummah Poso
 * =====================================================================
 *
 *  CARA PAKAI SINGKAT
 *  1. Paste seluruh kode ini ke editor Apps Script (ganti isi Kode.gs).
 *  2. Pilih fungsi  setupDatabase  di dropdown atas → klik ▶ Jalankan.
 *     → Spreadsheet database + semua sheet dibuat OTOMATIS.
 *     → Lihat "Log eksekusi": ada link spreadsheet & PIN admin.
 *  3. Deploy → Deployment baru → Aplikasi web
 *        Jalankan sebagai : Saya
 *        Yang memiliki akses: Siapa saja
 *     → Salin URL yang berakhiran  /exec
 *  4. Tempel URL itu di aplikasi (index.html).
 *
 *  Skrip ini bisa dipakai dengan DUA cara, dua-duanya aman:
 *   a) Proyek mandiri (dibuat dari script.google.com)  → spreadsheet
 *      baru dibuat otomatis.
 *   b) Dari dalam spreadsheet (Ekstensi → Apps Script) → spreadsheet
 *      itu sendiri yang dipakai.
 * =====================================================================
 */

// ======================= PENGATURAN =======================
const APP = {
  VERSI: '6.0',
  NAMA_DB: 'Database Jadwal Khotbah Jumat - PP Wihdatul Ummah Poso',
  PIN_DEFAULT: '123456',
  TZ: 'Asia/Makassar',          // WITA (Poso)
  // Opsional: isi ID spreadsheet tertentu jika ingin memakai spreadsheet
  // yang sudah ada. Biarkan kosong agar dibuat otomatis.
  SPREADSHEET_ID_MANUAL: ''
};

// Struktur tabel. Kolom pertama selalu 'id', kolom terakhir selalu 'dibuat'.
const SCHEMA = {
  khotib: {
    headers: ['id', 'nama', 'level', 'kontak', 'spesialisasi', 'aktif', 'dibuat'],
    wajib: ['nama', 'level']
  },
  masjid: {
    headers: ['id', 'nama', 'level', 'lokasi', 'kontak', 'aktif', 'dibuat'],
    wajib: ['nama', 'level']
  },
  jadwal: {
    headers: ['id', 'tanggal', 'masjidId', 'khotibId', 'catatan', 'override', 'dibuat'],
    wajib: ['tanggal', 'masjidId', 'khotibId']
  }
};

// ======================= FUNGSI YANG DIJALANKAN MANUAL =======================

/** ▶ JALANKAN INI PERTAMA KALI. Aman dijalankan berulang kali. */
function setupDatabase() {
  const ss = getSS_(true);
  ss.setSpreadsheetTimeZone(APP.TZ);

  Object.keys(SCHEMA).forEach(function (nama) { ensureSheet_(ss, nama); });

  // Hapus sheet bawaan yang kosong (Sheet1 / Lembar1)
  ss.getSheets().forEach(function (sh) {
    const n = sh.getName();
    if (!SCHEMA[n] && n.indexOf('_lama_') < 0 && sh.getLastRow() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(sh);
    }
  });

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_PIN')) props.setProperty('ADMIN_PIN', APP.PIN_DEFAULT);

  const pesan = [
    '✅ SETUP DATABASE BERHASIL',
    'Spreadsheet database : ' + ss.getUrl(),
    'Sheet dibuat         : ' + Object.keys(SCHEMA).join(', '),
    'PIN admin            : ' + props.getProperty('ADMIN_PIN') + '  (ganti lewat menu Pengaturan di aplikasi)',
    'Langkah berikutnya   : Deploy → Deployment baru → Aplikasi web (akses: Siapa saja)'
  ];
  pesan.forEach(function (p) { Logger.log(p); });
  try { ss.toast('Database siap digunakan', 'Jadwal Khotbah', 8); } catch (e) { /* mode mandiri */ }
  return pesan.join('\n');
}

/** Opsional: isi contoh data untuk mencoba aplikasi. */
function isiDataContoh() {
  const ss = getSS_(true);
  const all = readAll_(ss);
  if (all.khotib.length || all.masjid.length) {
    Logger.log('Data sudah ada, contoh tidak ditambahkan.');
    return;
  }
  [['Ust. Ahmad Fauzi', 1], ['Ust. Hasan Basri', 1], ['Ust. Ridwan', 2], ['Ust. Abdullah', 2], ['Ust. Salman', 3]]
    .forEach(function (k) { create_(ss, 'khotib', { nama: k[0], level: k[1], aktif: true }); });
  [['Masjid Nurul Iman', 1], ['Masjid Al-Ikhlas', 2], ['Masjid Raya Poso', 3]]
    .forEach(function (m) { create_(ss, 'masjid', { nama: m[0], level: m[1], lokasi: 'Poso', aktif: true }); });
  Logger.log('✅ Contoh data ditambahkan.');
}

/** Tampilkan PIN admin di log (jika lupa). */
function lihatPIN() {
  Logger.log('PIN admin: ' + (PropertiesService.getScriptProperties().getProperty('ADMIN_PIN') || APP.PIN_DEFAULT));
}

/** Kembalikan PIN ke default (123456). */
function resetPIN() {
  PropertiesService.getScriptProperties().setProperty('ADMIN_PIN', APP.PIN_DEFAULT);
  Logger.log('PIN dikembalikan ke: ' + APP.PIN_DEFAULT);
}

/** Putuskan hubungan ke spreadsheet lama (misal terhapus), lalu jalankan setupDatabase lagi. */
function resetKoneksiDatabase() {
  PropertiesService.getScriptProperties().deleteProperty('SPREADSHEET_ID');
  Logger.log('Koneksi database direset. Jalankan setupDatabase untuk membuat/menyambungkan ulang.');
}

/** Menu khusus jika skrip dibuka dari dalam spreadsheet. */
function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('🕌 Jadwal Khotbah')
      .addItem('Setup database', 'setupDatabase')
      .addItem('Isi data contoh', 'isiDataContoh')
      .addItem('Lihat PIN admin (di log)', 'lihatPIN')
      .addToUi();
  } catch (e) { /* bukan konteks spreadsheet */ }
}

// ======================= API WEB APP =======================

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  if (action === 'ping') {
    return json_({ ok: true, message: 'API Jadwal Khotbah aktif', versi: APP.VERSI });
  }
  return json_({ ok: false, message: 'Gunakan metode POST untuk aksi ini.' });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, message: 'Format permintaan tidak valid.' });
  }
  try {
    return json_(route_(body));
  } catch (err) {
    return json_({ ok: false, message: (err && err.message) ? err.message : String(err) });
  }
}

function route_(b) {
  const a = b.action;
  if (a === 'ping') return { ok: true, versi: APP.VERSI };

  cekPin_(b.pin);
  const ss = getSS_(false);

  if (a === 'login' || a === 'getAll') return { ok: true, data: readAll_(ss) };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    let hasil = null;
    switch (a) {
      case 'create': hasil = create_(ss, b.sheet, b.data); break;
      case 'update': hasil = update_(ss, b.sheet, b.id, b.data); break;
      case 'delete': hasil = delete_(ss, b.sheet, b.id, !!b.force); break;
      case 'saveJadwalBatch': hasil = saveBatch_(ss, b.items); break;
      case 'deleteJadwalTanggal': hasil = { terhapus: deleteByTanggal_(ss, b.tanggal) }; break;
      case 'gantiPin': gantiPin_(b.pinBaru); hasil = true; break;
      default: throw new Error('Aksi tidak dikenal: ' + a);
    }
    SpreadsheetApp.flush();
    return { ok: true, hasil: hasil, data: readAll_(ss) };
  } finally {
    lock.releaseLock();
  }
}

// ======================= KEAMANAN =======================

function cekPin_(pin) {
  const cache = CacheService.getScriptCache();
  const gagal = Number(cache.get('pin_gagal') || 0);
  if (gagal >= 10) throw new Error('Terlalu banyak percobaan PIN salah. Coba lagi 10 menit lagi.');
  const benar = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN') || APP.PIN_DEFAULT;
  if (String(pin || '') !== benar) {
    cache.put('pin_gagal', String(gagal + 1), 600);
    throw new Error('PIN salah.');
  }
}

function gantiPin_(pinBaru) {
  const p = String(pinBaru || '').trim();
  if (p.length < 4 || p.length > 20) throw new Error('PIN baru harus 4–20 karakter.');
  PropertiesService.getScriptProperties().setProperty('ADMIN_PIN', p);
}

// ======================= SPREADSHEET =======================

function getSS_(bolehBuat) {
  if (APP.SPREADSHEET_ID_MANUAL) return SpreadsheetApp.openById(APP.SPREADSHEET_ID_MANUAL);

  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SPREADSHEET_ID');
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      throw new Error('Spreadsheet database tidak bisa dibuka (mungkin terhapus). Jalankan resetKoneksiDatabase lalu setupDatabase.');
    }
  }

  let ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { ss = null; }
  if (!ss) {
    if (!bolehBuat) throw new Error('Database belum di-setup. Jalankan fungsi setupDatabase di editor Apps Script.');
    ss = SpreadsheetApp.create(APP.NAMA_DB);
  }
  props.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function ensureSheet_(ss, nama) {
  const headers = SCHEMA[nama].headers;
  let sh = ss.getSheetByName(nama);

  // Jika sheet sudah ada tapi strukturnya berbeda, simpan sebagai cadangan.
  if (sh && sh.getLastRow() > 0) {
    const cur = sh.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
    if (cur.join('|') !== headers.join('|')) {
      sh.setName(nama + '_lama_' + Utilities.formatDate(new Date(), APP.TZ, 'yyyyMMdd_HHmmss'));
      sh = null;
    }
  }
  if (!sh) sh = ss.insertSheet(nama);

  if (sh.getLastRow() === 0) {
    if (sh.getMaxRows() < 200) sh.insertRowsAfter(sh.getMaxRows(), 200 - sh.getMaxRows());
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#1f5a44').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    headers.forEach(function (h, i) {
      sh.getRange(2, i + 1, sh.getMaxRows() - 1, 1).setNumberFormat(formatKolom_(h));
    });
    sh.autoResizeColumns(1, headers.length);
  }
  return sh;
}

function sheet_(ss, nama) {
  return ss.getSheetByName(nama) || ensureSheet_(ss, nama);
}

function formatKolom_(h) {
  if (h === 'level') return '0';
  if (h === 'dibuat') return 'yyyy-mm-dd hh:mm';
  return '@'; // teks biasa → nomor HP "0812..." & tanggal tidak berubah
}

function cekNamaSheet_(nama) {
  if (!SCHEMA[nama]) throw new Error('Tabel tidak dikenal: ' + nama);
}

// ======================= BACA DATA =======================

function readAll_(ss) {
  return {
    khotib: readSheet_(ss, 'khotib'),
    masjid: readSheet_(ss, 'masjid'),
    jadwal: readSheet_(ss, 'jadwal')
  };
}

function readSheet_(ss, nama) {
  const sh = sheet_(ss, nama);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const headers = SCHEMA[nama].headers;
  const values = sh.getRange(2, 1, last - 1, headers.length).getValues();
  const out = [];
  values.forEach(function (r) {
    if (r[0] === '' || r[0] === null) return;
    const o = {};
    headers.forEach(function (h, i) { o[h] = normalisasi_(h, r[i]); });
    out.push(o);
  });
  return out;
}

function normalisasi_(h, v) {
  if (h === 'level') return Math.min(3, Math.max(1, Number(v) || 1));
  if (h === 'aktif') return (v === '' || v === null) ? true : keBool_(v);
  if (h === 'override') return keBool_(v);
  if (v instanceof Date) {
    return Utilities.formatDate(v, APP.TZ, h === 'tanggal' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm');
  }
  return (v === null || v === undefined) ? '' : String(v).trim();
}

function keBool_(v) {
  return ['YA', 'TRUE', '1', 'Y', 'AKTIF'].indexOf(String(v).trim().toUpperCase()) >= 0;
}

// ======================= VALIDASI =======================

function bersihkan_(nama, data) {
  const s = SCHEMA[nama];
  const o = {};
  s.headers.forEach(function (h) {
    if (h === 'id' || h === 'dibuat') return;
    let v = data[h];
    if (h === 'level') {
      v = Number(v);
      if ([1, 2, 3].indexOf(v) < 0) throw new Error('Level harus 1, 2, atau 3.');
    } else if (h === 'aktif') {
      v = (v === undefined || v === null || v === '') ? 'YA' : (keBool_(v) ? 'YA' : 'TIDAK');
    } else if (h === 'override') {
      v = keBool_(v) ? 'YA' : 'TIDAK';
    } else {
      v = String(v === undefined || v === null ? '' : v).trim().slice(0, 500);
    }
    o[h] = v;
  });
  s.wajib.forEach(function (h) {
    if (o[h] === '' || o[h] === undefined) throw new Error('Kolom "' + h + '" wajib diisi.');
  });
  if (nama === 'jadwal' && !/^\d{4}-\d{2}-\d{2}$/.test(o.tanggal)) {
    throw new Error('Format tanggal harus YYYY-MM-DD.');
  }
  return o;
}

function validasiJadwal_(all, item, abaikanId) {
  const m = all.masjid.filter(function (x) { return x.id === item.masjidId; })[0];
  const k = all.khotib.filter(function (x) { return x.id === item.khotibId; })[0];
  if (!m) throw new Error('Masjid tidak ditemukan.');
  if (!k) throw new Error('Khotib tidak ditemukan.');
  if (k.level > m.level && item.override !== 'YA') {
    throw new Error(k.nama + ' (Level ' + k.level + ') melebihi level ' + m.nama + ' (Level ' + m.level + '). Setujui pengecualian untuk tetap menyimpan.');
  }
  all.jadwal.forEach(function (j) {
    if (j.id === abaikanId || j.tanggal !== item.tanggal) return;
    if (j.masjidId === item.masjidId) throw new Error(m.nama + ' sudah punya khotib pada ' + item.tanggal + '.');
    if (j.khotibId === item.khotibId) throw new Error(k.nama + ' sudah bertugas di masjid lain pada ' + item.tanggal + '.');
  });
}

function cekNamaGanda_(list, nama, abaikanId, label) {
  const n = String(nama).trim().toLowerCase();
  list.forEach(function (x) {
    if (x.id !== abaikanId && String(x.nama).trim().toLowerCase() === n) {
      throw new Error(label + ' dengan nama "' + nama + '" sudah ada.');
    }
  });
}

// ======================= TULIS DATA =======================

function idBaru_(nama) {
  return nama.charAt(0).toUpperCase() + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 10);
}

function pastikanBaris_(sh, sampaiBaris) {
  const max = sh.getMaxRows();
  if (sampaiBaris > max) sh.insertRowsAfter(max, sampaiBaris - max + 100);
}

function tulisBaris_(sh, nama, barisAwal, objs) {
  if (!objs.length) return;
  const headers = SCHEMA[nama].headers;
  pastikanBaris_(sh, barisAwal + objs.length - 1);
  const range = sh.getRange(barisAwal, 1, objs.length, headers.length);
  range.setNumberFormats(objs.map(function () { return headers.map(formatKolom_); }));
  range.setValues(objs.map(function (o) { return headers.map(function (h) { return o[h]; }); }));
}

function barisDariId_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(2, 1, last - 1, 1).getDisplayValues().map(function (r) { return r[0]; });
  const i = ids.indexOf(String(id));
  return i < 0 ? -1 : i + 2;
}

function create_(ss, nama, data) {
  cekNamaSheet_(nama);
  const obj = bersihkan_(nama, data || {});
  const all = readAll_(ss);
  if (nama === 'jadwal') validasiJadwal_(all, obj, null);
  else cekNamaGanda_(all[nama], obj.nama, null, nama === 'khotib' ? 'Khotib' : 'Masjid');
  obj.id = idBaru_(nama);
  obj.dibuat = new Date();
  const sh = sheet_(ss, nama);
  tulisBaris_(sh, nama, sh.getLastRow() + 1, [obj]);
  return { id: obj.id };
}

function update_(ss, nama, id, data) {
  cekNamaSheet_(nama);
  const all = readAll_(ss);
  const lama = all[nama].filter(function (x) { return x.id === id; })[0];
  if (!lama) throw new Error('Data tidak ditemukan (mungkin sudah dihapus).');
  const gabung = Object.assign({}, lama, data || {});
  const obj = bersihkan_(nama, gabung);
  if (nama === 'jadwal') validasiJadwal_(all, obj, id);
  else cekNamaGanda_(all[nama], obj.nama, id, nama === 'khotib' ? 'Khotib' : 'Masjid');

  const sh = sheet_(ss, nama);
  const baris = barisDariId_(sh, id);
  if (baris < 0) throw new Error('Baris data tidak ditemukan.');
  const headers = SCHEMA[nama].headers;
  const tengah = headers.slice(1, headers.length - 1); // tanpa id & dibuat
  const range = sh.getRange(baris, 2, 1, tengah.length);
  range.setNumberFormats([tengah.map(formatKolom_)]);
  range.setValues([tengah.map(function (h) { return obj[h]; })]);
  return { id: id };
}

function delete_(ss, nama, id, paksa) {
  cekNamaSheet_(nama);
  const sh = sheet_(ss, nama);
  const baris = barisDariId_(sh, id);
  if (baris < 0) throw new Error('Data tidak ditemukan (mungkin sudah dihapus).');

  let jadwalTerhapus = 0;
  if (nama === 'khotib' || nama === 'masjid') {
    const kunci = nama === 'khotib' ? 'khotibId' : 'masjidId';
    const shJ = sheet_(ss, 'jadwal');
    const terkait = readSheet_(ss, 'jadwal').filter(function (j) { return j[kunci] === id; });
    if (terkait.length && !paksa) {
      throw new Error('TERKAIT:' + terkait.length);
    }
    if (terkait.length) {
      const set = {};
      terkait.forEach(function (j) { set[j.id] = true; });
      jadwalTerhapus = hapusBarisJika_(shJ, function (row) { return set[row[0]]; });
    }
  }
  sh.deleteRow(baris);
  return { jadwalTerhapus: jadwalTerhapus };
}

function hapusBarisJika_(sh, cocok) {
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const vals = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getDisplayValues();
  let n = 0;
  for (let i = vals.length - 1; i >= 0; i--) {
    if (cocok(vals[i])) { sh.deleteRow(i + 2); n++; }
  }
  return n;
}

function saveBatch_(ss, items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Tidak ada jadwal untuk disimpan.');
  if (items.length > 600) throw new Error('Maksimal 600 jadwal sekali simpan.');
  const all = readAll_(ss);
  const siap = [];
  const gagal = [];
  items.forEach(function (it, i) {
    try {
      const obj = bersihkan_('jadwal', it);
      validasiJadwal_(all, obj, null);
      obj.id = idBaru_('jadwal');
      obj.dibuat = new Date();
      all.jadwal.push({ id: obj.id, tanggal: obj.tanggal, masjidId: obj.masjidId, khotibId: obj.khotibId });
      siap.push(obj);
    } catch (err) {
      gagal.push({ index: i, pesan: err.message });
    }
  });
  const sh = sheet_(ss, 'jadwal');
  tulisBaris_(sh, 'jadwal', sh.getLastRow() + 1, siap);
  return { tersimpan: siap.length, gagal: gagal };
}

function deleteByTanggal_(ss, tanggal) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(tanggal))) throw new Error('Tanggal tidak valid.');
  return hapusBarisJika_(sheet_(ss, 'jadwal'), function (row) { return row[1] === tanggal; });
}

// ======================= UTIL =======================

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
