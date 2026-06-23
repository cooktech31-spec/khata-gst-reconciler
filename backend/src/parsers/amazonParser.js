// =====================================================================
// amazonParser.js — Amazon MTR (Merchant Tax Report) ko normalize karta hai
// =====================================================================
// NOTE: Amazon ka MTR report kabhi-kabhi rate columns "Igst Rate"/"Cgst Rate"
// ke roop mein deta hai (percentage), kabhi sirf amount columns. Hum dono
// handle karte hain.

const { readRawRows, resolveColumnKeys, toNumber, toDateOrNull } = require("./parseSheet");
const { AMAZON_COLUMN_MAP } = require("./columnMaps");

function parseAmazonFile(fileBuffer, filename) {
  const { rows } = readRawRows(fileBuffer, filename);
  if (rows.length === 0) {
    return { lineItems: [], warnings: [`Amazon file "${filename}" mein koi data row nahi mili.`] };
  }

  const keys = resolveColumnKeys(rows[0], AMAZON_COLUMN_MAP);
  const warnings = [];
  const missingFields = ["orderId", "taxableValue", "hsnCode"].filter((f) => !keys[f]);
  if (missingFields.length) {
    warnings.push(
      `Amazon file mein yeh columns nahi mil paaye: ${missingFields.join(", ")}. ` +
        `columnMaps.js mein AMAZON_COLUMN_MAP check karke real header name add karo.`
    );
  }

  const lineItems = rows
    .filter((row) => row[keys.orderId])
    .map((row) => {
      const taxableValue = toNumber(row[keys.taxableValue]);
      const cgst = toNumber(row[keys.cgst]);
      const sgst = toNumber(row[keys.sgst]);
      const igst = toNumber(row[keys.igst]);
      const totalTax = cgst + sgst + igst;
      const taxRate = taxableValue ? Math.round(((totalTax / taxableValue) * 100) * 100) / 100 : 0;

      const txnType = String(row[keys.transactionType] || "").toLowerCase();
      const orderStatus = txnType.includes("refund")
        ? "RETURNED"
        : txnType.includes("cancel")
        ? "CANCELLED"
        : "DELIVERED";

      const buyerGstin = row[keys.buyerGstin] || null;

      return {
        platform: "AMAZON",
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

module.exports = { parseAmazonFile };
