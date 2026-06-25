// =====================================================================
// flipkartParser.js — Flipkart sales/tax report ko normalize karta hai
// =====================================================================

const { readRawRows, resolveColumnKeys, toNumber, toDateOrNull } = require("./parseSheet");
const { FLIPKART_COLUMN_MAP } = require("./columnMaps");

function parseFlipkartFile(fileBuffer, filename) {
  const { rows } = readRawRows(fileBuffer, filename);
  if (rows.length === 0) {
    return { lineItems: [], warnings: [`Flipkart file "${filename}" mein koi data row nahi mili.`] };
  }

  const keys = resolveColumnKeys(rows[0], FLIPKART_COLUMN_MAP);
  const warnings = [];
  const missingFields = ["orderId", "taxableValue", "hsnCode"].filter((f) => !keys[f]);
  if (missingFields.length) {
    warnings.push(
      `Flipkart file mein yeh columns nahi mil paaye: ${missingFields.join(", ")}. ` +
        `columnMaps.js mein FLIPKART_COLUMN_MAP check karke real header name add karo.`
    );
  }

  const lineItems = rows
    .filter((row) => row[keys.orderId])
    .map((row) => {
      const taxableValue = toNumber(row[keys.taxableValue]);
      const cgst = toNumber(row[keys.cgst]);
      const sgst = toNumber(row[keys.sgst]);
      const igst = toNumber(row[keys.igst]);
      const taxRateRaw = toNumber(row[keys.taxRate]);
      const totalTax = cgst + sgst + igst;
      const taxRate =
        taxRateRaw > 0 ? taxRateRaw : taxableValue ? Math.round((totalTax / taxableValue) * 10000) / 100 : 0;

      const statusRaw = String(row[keys.orderStatus] || "").toLowerCase();
      const orderStatus = statusRaw.includes("return")
        ? "RETURNED"
        : statusRaw.includes("cancel")
        ? "CANCELLED"
        : "DELIVERED";

      const buyerGstin = row[keys.buyerGstin] || null;

      return {
        platform: "FLIPKART",
        orderId: String(row[keys.orderId]),
        invoiceNumber: row[keys.invoiceNumber] || null,
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

  return { lineItems, warnings };
}

module.exports = { parseFlipkartFile };
