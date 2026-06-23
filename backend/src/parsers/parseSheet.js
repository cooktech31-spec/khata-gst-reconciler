// =====================================================================
// parseSheet.js — generic Excel/CSV reader + alias resolver
// =====================================================================
// Yeh file koi bhi .xlsx/.csv file ko JS objects ke array mein convert
// karti hai, aur columnMaps.js ki help se har row ke "logical fields"
// nikalti hai (chahe asli column header kuch bhi ho).
// =====================================================================

const XLSX = require("xlsx");

/**
 * File buffer (xlsx ya csv) ko array-of-objects mein parse karta hai.
 * @param {Buffer} fileBuffer
 * @param {string} originalFilename
 * @returns {Array<Object>} raw rows, header row ke hisaab se keyed
 */
function readRawRows(fileBuffer, originalFilename) {
  const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });

  // Kai platforms (especially Flipkart/Meesho) multiple sheets bhejte hain
  // (Summary, B2B, B2C, HSN, etc). Hum sabse zyada rows wali sheet uthate
  // hain — usually woh hi "transaction level" data hota hai.
  let bestSheetName = workbook.SheetNames[0];
  let bestRowCount = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
    if (rows.length > bestRowCount) {
      bestRowCount = rows.length;
      bestSheetName = sheetName;
    }
  }

  const sheet = workbook.Sheets[bestSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  return { rows, sheetUsed: bestSheetName, filename: originalFilename };
}

/**
 * Header row ke actual column names dekhke, columnMap ke aliases se
 * match karke ek "resolved key map" banata hai: { logicalField: actualHeader }
 */
function resolveColumnKeys(sampleRow, columnMap) {
  const actualHeaders = Object.keys(sampleRow || {});
  const resolved = {};

  for (const [logicalField, aliases] of Object.entries(columnMap)) {
    const match = actualHeaders.find((header) =>
      aliases.some((alias) => normalize(header) === normalize(alias))
    );
    if (match) resolved[logicalField] = match;
  }

  return resolved;
}

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const num = parseFloat(String(value).replace(/[,₹\s]/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

module.exports = { readRawRows, resolveColumnKeys, toNumber, toDateOrNull, normalize };
