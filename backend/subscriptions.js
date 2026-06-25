// =====================================================================
// meeshoParser.js — Meesho ke sales/tax report ko normalize karta hai
// =====================================================================

const { readRawRows, resolveColumnKeys, toNumber, toDateOrNull } = require("./parseSheet");
const { MEESHO_COLUMN_MAP } = require("./columnMaps");

function parseMeeshoFile(fileBuffer, filename) {
  const { rows, sheetUsed } = readRawRows(fileBuffer, filename);
  if (rows.length === 0) {
    return { lineItems: [], warnings: [`Meesho file "${filename}" mein koi data row nahi mili.`] };
  }

  const keys = resolveColumnKeys(rows[0], MEESHO_COLUMN_MAP);
  const warnings = [];
  const missingFields = ["orderId", "taxableValue", "hsnCode"].filter((f) => !keys[f]);
  if (missingFields.length) {
    warnings.push(
      `Meesho file mein yeh columns nahi mil paaye: ${missingFields.join(", ")}. ` +
        `columnMaps.js mein MEESHO_COLUMN_MAP check karke real header name add karo.`
    );
  }

  const lineItems = rows
    .filter((row) => row[keys.orderId]) // empty/summary rows skip
    .map((row) => {
      const taxableValue = toNumber(row[keys.taxableValue]);
      const cgst = toNumber(row[keys.cgst]);
      const sgst = toNumber(row[keys.sgst]);
      const igst = toNumber(row[keys.igst]);
      const taxRateRaw = toNumber(row[keys.taxRate]);
      const taxRate = taxRateRaw > 0 ? taxRateRaw : inferRateFromAmounts(taxableValue, cgst, sgst, igst);

      const statusRaw = String(row[keys.orderStatus] || "").toLowerCase();
      const orderStatus = statusRaw.includes("return")
        ? "RETURNED"
        : statusRaw.includes("cancel")
        ? "CANCELLED"
        : "DELIVERED";

      const buyerGstin = row[keys.buyerGstin] || null;

      return {
        platform: "MEESHO",
        orderId: String(row[keys.orderId]),
        invoiceNumber: null, // Meesho apne report mein invoice number alag se nahi deta
        invoiceDate: toDateOrNull(row[keys.invoiceDate]),
        hsnCode: row[keys.hsnCode] ? String(row[keys.hsnCode]) : null,
        productName: row[keys.productName] || null,
        taxableValue,
        taxRate,
        cgst,
        sgst,
        igst,
        tcsAmount: toNumber(row[keys.tcsAmount]),
        buyerState: row[keys.buyerState] || null,
        buyerGstin,
        supplyType: buyerGstin ? "B2B" : taxableValue > 100000 ? "B2CL" : "B2CS",
        orderStatus,
        rawRow: row,
      };
    });

  return { lineItems, warnings, sheetUsed };
}

function inferRateFromAmounts(taxableValue, cgst, sgst, igst) {
  if (!taxableValue) return 0;
  const totalTax = cgst + sgst + igst;
  const rate = (totalTax / taxableValue) * 100;
  return Math.round(rate * 100) / 100;
}

module.exports = { parseMeeshoFile };
