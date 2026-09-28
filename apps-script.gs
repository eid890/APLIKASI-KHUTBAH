/**
 * GOOGLE APPS SCRIPT - JADWAL KHOTBAH JUMAT
 * 
 * Fungsi:
 * 1. Auto-create semua sheet yang dibutuhkan
 * 2. Handle API request (GET/POST) dari frontend
 * 3. Read/Write data ke Google Sheets
 * 
 * Setup:
 * 1. Buka Google Sheet
 * 2. Tools → <> Script Editor
 * 3. Copy paste kode ini
 * 4. Save & Run setupDatabase()
 * 5. Deploy as Web App
 * 
 */

// ============ KONFIGURASI ============

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAMES = {
  KHOTIB: "khotib",
  MASJID: "masjid",
  JADWAL: "jadwal"
};

// ============ MAIN HANDLER ============

/**
 * Main function untuk handle GET & POST requests
 * URL yang di-deploy akan automatic call function ini
 */
function doGet(e) {
  try {
    const action = e.parameter.action || "";
    
    if (!action) {
      return HtmlService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Action parameter required"
      })).setMimeType(MimeType.JSON);
    }

    let result;

    switch(action) {
      case "getKhotib":
        result = getKhotib();
        break;
      case "getMasjid":
        result = getMasjid();
        break;
      case "getJadwal":
        result = getJadwal();
        break;
      case "health":
        result = { status: "ok", message: "API is running" };
        break;
      default:
        result = { status: "error", message: `Unknown action: ${action}` };
    }

    return HtmlService.createTextOutput(JSON.stringify(result))
      .setMimeType(MimeType.JSON);
  } catch(error) {
    Logger.log("Error in doGet: " + error);
    return HtmlService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(MimeType.JSON);
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || "";

    let result;

    switch(action) {
      case "addKhotib":
        result = addKhotib(data);
        break;
      case "addMasjid":
        result = addMasjid(data);
        break;
      case "addJadwal":
        result = addJadwal(data);
        break;
      case "deleteKhotib":
        result = deleteKhotib(data.id);
        break;
      case "deleteMasjid":
        result = deleteMasjid(data.id);
        break;
      case "deleteJadwal":
        result = deleteJadwal(data.id);
        break;
      default:
        result = { status: "error", message: `Unknown action: ${action}` };
    }

    return HtmlService.createTextOutput(JSON.stringify(result))
      .setMimeType(MimeType.JSON);
  } catch(error) {
    Logger.log("Error in doPost: " + error);
    return HtmlService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(MimeType.JSON);
  }
}

// ============ SETUP DATABASE ============

/**
 * Setup semua sheet yang dibutuhkan
 * RUN INI SEKALI SAJA!
 */
function setupDatabase() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create Khotib sheet
    createSheetIfNotExists(SHEET_NAMES.KHOTIB);
    const khotibSheet = ss.getSheetByName(SHEET_NAMES.KHOTIB);
    if (khotibSheet.getLastRow() === 0) {
      khotibSheet.appendRow(["ID", "Nama", "Level", "Kontak", "Spesialisasi", "Tanggal"]);
      // Add dummy data
      khotibSheet.appendRow([Date.now(), "Ustadz Ahmad", 1, "0812345678", "Fiqh", new Date()]);
      khotibSheet.appendRow([Date.now(), "Ustadz Budi", 2, "0812345679", "Aqidah", new Date()]);
    }

    // Create Masjid sheet
    createSheetIfNotExists(SHEET_NAMES.MASJID);
    const masjidSheet = ss.getSheetByName(SHEET_NAMES.MASJID);
    if (masjidSheet.getLastRow() === 0) {
      masjidSheet.appendRow(["ID", "Nama", "Level", "Lokasi", "Kontak Pengelola", "Tanggal"]);
      // Add dummy data
      masjidSheet.appendRow([Date.now(), "Masjid Nurul Huda", 1, "Palu", "0812345680", new Date()]);
      masjidSheet.appendRow([Date.now(), "Masjid Al-Ikhlas", 2, "Donggala", "0812345681", new Date()]);
    }

    // Create Jadwal sheet
    createSheetIfNotExists(SHEET_NAMES.JADWAL);
    const jadwalSheet = ss.getSheetByName(SHEET_NAMES.JADWAL);
    if (jadwalSheet.getLastRow() === 0) {
      jadwalSheet.appendRow(["ID", "Masjid ID", "Khotib ID", "Tanggal", "Catatan", "Created"]);
      jadwalSheet.appendRow([Date.now(), Date.now(), Date.now(), "2026-09-25", "Scheduled", new Date()]);
    }

    // Freeze header rows
    khotibSheet.setFrozenRows(1);
    masjidSheet.setFrozenRows(1);
    jadwalSheet.setFrozenRows(1);

    Logger.log("✅ Database setup berhasil!");
    return {
      status: "success",
      message: "Database setup berhasil! Sheets sudah siap digunakan."
    };
  } catch(error) {
    Logger.log("❌ Error setup database: " + error);
    return {
      status: "error",
      message: error.toString()
    };
  }
}

/**
 * Helper function untuk create sheet jika belum ada
 */
function createSheetIfNotExists(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(sheetName)) {
    ss.insertSheet(sheetName);
  }
}

// ============ KHOTIB OPERATIONS ============

function getKhotib() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.KHOTIB);
    const data = sheet.getDataRange().getValues();
    
    // Convert to array of objects
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return {
      status: "success",
      data: result,
      count: result.length
    };
  } catch(error) {
    Logger.log("Error getKhotib: " + error);
    return { status: "error", message: error.toString() };
  }
}

function addKhotib(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.KHOTIB);
    
    const newRow = [
      Date.now(),
      data.nama || "",
      data.level || "",
      data.kontak || "",
      data.spesialisasi || "",
      new Date()
    ];

    sheet.appendRow(newRow);

    return {
      status: "success",
      message: "Khotib berhasil ditambahkan",
      data: { id: newRow[0], ...data }
    };
  } catch(error) {
    Logger.log("Error addKhotib: " + error);
    return { status: "error", message: error.toString() };
  }
}

function deleteKhotib(id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.KHOTIB);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        sheet.deleteRow(i + 1);
        return {
          status: "success",
          message: "Khotib berhasil dihapus"
        };
      }
    }

    return {
      status: "error",
      message: "Khotib tidak ditemukan"
    };
  } catch(error) {
    Logger.log("Error deleteKhotib: " + error);
    return { status: "error", message: error.toString() };
  }
}

// ============ MASJID OPERATIONS ============

function getMasjid() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.MASJID);
    const data = sheet.getDataRange().getValues();
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return {
      status: "success",
      data: result,
      count: result.length
    };
  } catch(error) {
    Logger.log("Error getMasjid: " + error);
    return { status: "error", message: error.toString() };
  }
}

function addMasjid(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.MASJID);
    
    const newRow = [
      Date.now(),
      data.nama || "",
      data.level || "",
      data.lokasi || "",
      data.kontak || "",
      new Date()
    ];

    sheet.appendRow(newRow);

    return {
      status: "success",
      message: "Masjid berhasil ditambahkan",
      data: { id: newRow[0], ...data }
    };
  } catch(error) {
    Logger.log("Error addMasjid: " + error);
    return { status: "error", message: error.toString() };
  }
}

function deleteMasjid(id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.MASJID);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        sheet.deleteRow(i + 1);
        return {
          status: "success",
          message: "Masjid berhasil dihapus"
        };
      }
    }

    return {
      status: "error",
      message: "Masjid tidak ditemukan"
    };
  } catch(error) {
    Logger.log("Error deleteMasjid: " + error);
    return { status: "error", message: error.toString() };
  }
}

// ============ JADWAL OPERATIONS ============

function getJadwal() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.JADWAL);
    const data = sheet.getDataRange().getValues();
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return {
      status: "success",
      data: result,
      count: result.length
    };
  } catch(error) {
    Logger.log("Error getJadwal: " + error);
    return { status: "error", message: error.toString() };
  }
}

function addJadwal(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.JADWAL);
    
    const newRow = [
      Date.now(),
      data.masjidId || "",
      data.khotibId || "",
      data.tanggal || "",
      data.catatan || "",
      new Date()
    ];

    sheet.appendRow(newRow);

    return {
      status: "success",
      message: "Jadwal berhasil ditambahkan",
      data: { id: newRow[0], ...data }
    };
  } catch(error) {
    Logger.log("Error addJadwal: " + error);
    return { status: "error", message: error.toString() };
  }
}

function deleteJadwal(id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.JADWAL);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        sheet.deleteRow(i + 1);
        return {
          status: "success",
          message: "Jadwal berhasil dihapus"
        };
      }
    }

    return {
      status: "error",
      message: "Jadwal tidak ditemukan"
    };
  } catch(error) {
    Logger.log("Error deleteJadwal: " + error);
    return { status: "error", message: error.toString() };
  }
}

// ============ UTILITY FUNCTIONS ============

/**
 * Test API (buka browser & klik link yang di-deploy)
 */
function doTest() {
  return HtmlService.createHtmlOutput(`
    <h1>Test API</h1>
    <p><a href="?action=health" target="_blank">Test Health</a></p>
    <p><a href="?action=getKhotib" target="_blank">Get Khotib</a></p>
    <p><a href="?action=getMasjid" target="_blank">Get Masjid</a></p>
    <p><a href="?action=getJadwal" target="_blank">Get Jadwal</a></p>
  `);
}

/**
 * Deploy sebagai Web App
 * 
 * Deploy Steps:
 * 1. Click "Deploy" button (atas kanan)
 * 2. "New deployment" → Type: "Web app"
 * 3. Execute as: "Me"
 * 4. Who has access: "Anyone"
 * 5. Click "Deploy"
 * 6. Copy deployment URL
 * 
 * Hasil:
 * URL: https://script.google.com/macros/d/{SCRIPT_ID}/usercalc...
 * 
 * Testing:
 * https://...?action=getKhotib
 * https://...?action=getMasjid
 * https://...?action=getJadwal
 */
