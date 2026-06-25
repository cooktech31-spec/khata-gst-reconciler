// =====================================================================
// exportExcel.js — GSTR-1-ready multi-sheet Excel banata hai
// =====================================================================
// Sheets: Summary, HSN Summary (Table 12), B2C State-wise (Table 7),
// B2B Invoices (Table 4), Flagged Items, TCS Reconciliation
// =====================================================================

const ExcelJS = require("exceljs");

async function buildReconciliationWorkbook(result, companyContext, period) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "GST Reconciler";
  workbook.created = new Date();

  addSummarySheet(workbook, result, companyContext, period);
  addHsnSheet(workbook, result.hsnSummary);
  addStateSheet(workbook, result.stateSummary);
  addB2BSheet(workbook, result.b2bInvoices);
  addFlaggedSheet(workbook, result.flaggedItems);

  return workbook;
}

function styleHeaderRow(row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2B45" } };
  row.alignment = { vertical: "middle" };
}

function addSummarySheet(workbook, result, companyContext, period) {
  const sheet = workbook.addWorksheet("Summary");
  sheet.columns = [{ width: 32 }, { width: 24 }];

  sheet.addRow(["Company", companyContext.legalName]);
  sheet.addRow(["GSTIN", companyContext.gstin]);
  sheet.addRow(["Period", `${period.month}/${period.year}`]);
  sheet.addRow([]);

  const headerRow = sheet.addRow(["Metric", "Value"]);
  styleHeaderRow(headerRow);

  const s = result.summary;
  sheet.addRow(["Total Delivered Orders", s.totalOrders]);
  sheet.addRow(["Returned Orders", s.returnedOrders]);
  sheet.addRow(["Cancelled Orders", s.cancelledOrders]);
  sheet.addRow(["Total Taxable Value (₹)", s.totalTaxableValue]);
  sheet.addRow(["Total Tax Collected (₹)", s.totalTax]);
  sheet.addRow(["Expected TCS @ 0.5% (₹)", s.expectedTcs]);
  sheet.addRow(["TCS Reported by Platforms (₹)", s.reportedTcs]);
  sheet.addRow(["TCS Difference (₹)", s.tcsDiff]);
  sheet.addRow(["TCS Mismatch?", s.tcsMismatch ? "YES — review needed" : "No, matches"]);
  sheet.addRow(["Total Flagged Items", s.mismatchCount]);
}

function addHsnSheet(workbook, hsnSummary) {
  const sheet = workbook.addWorksheet("HSN Summary (Table 12)");
  sheet.columns = [
    { header: "HSN Code", key: "hsnCode", width: 14 },
    { header: "Tax Rate %", key: "taxRate", width: 12 },
    { header: "No. of Orders", key: "count", width: 14 },
    { header: "Taxable Value", key: "taxableValue", width: 16 },
    { header: "CGST", key: "cgst", width: 12 },
    { header: "SGST", key: "sgst", width: 12 },
    { header: "IGST", key: "igst", width: 12 },
  ];
  styleHeaderRow(sheet.getRow(1));
  hsnSummary.forEach((row) => sheet.addRow(row));
}

function addStateSheet(workbook, stateSummary) {
  const sheet = workbook.addWorksheet("State-wise B2C (Table 7)");
  sheet.columns = [
    { header: "Buyer State", key: "buyerState", width: 18 },
    { header: "Supply Type", key: "supplyType", width: 14 },
    { header: "Tax Rate %", key: "taxRate", width: 12 },
    { header: "No. of Orders", key: "count", width: 14 },
    { header: "Taxable Value", key: "taxableValue", width: 16 },
    { header: "CGST", key: "cgst", width: 12 },
    { header: "SGST", key: "sgst", width: 12 },
    { header: "IGST", key: "igst", width: 12 },
  ];
  styleHeaderRow(sheet.getRow(1));
  stateSummary.forEach((row) => sheet.addRow(row));
}

function addB2BSheet(workbook, b2bInvoices) {
  const sheet = workbook.addWorksheet("B2B Invoices (Table 4)");
  sheet.columns = [
    { header: "Platform", key: "platform", width: 12 },
    { header: "Order ID", key: "orderId", width: 18 },
    { header: "Invoice No", key: "invoiceNumber", width: 16 },
    { header: "Buyer GSTIN", key: "buyerGstin", width: 18 },
    { header: "Taxable Value", key: "taxableValue", width: 16 },
    { header: "Tax Rate %", key: "taxRate", width: 12 },
    { header: "CGST", key: "cgst", width: 12 },
    { header: "SGST", key: "sgst", width: 12 },
    { header: "IGST", key: "igst", width: 12 },
  ];
  styleHeaderRow(sheet.getRow(1));
  b2bInvoices.forEach((row) => sheet.addRow(row));
}

function addFlaggedSheet(workbook, flaggedItems) {
  const sheet = workbook.addWorksheet("Flagged Items");
  sheet.columns = [
    { header: "Platform", key: "platform", width: 12 },
    { header: "Order ID", key: "orderId", width: 18 },
    { header: "HSN Code", key: "hsnCode", width: 14 },
    { header: "Tax Rate %", key: "taxRate", width: 12 },
    { header: "Issue Type", key: "issueType", width: 18 },
    { header: "Details", key: "details", width: 60 },
  ];
  styleHeaderRow(sheet.getRow(1));
  flaggedItems.forEach((item) => {
    item.flags.forEach((flag) => {
      sheet.addRow({
        platform: item.platform,
        orderId: item.orderId,
        hsnCode: item.hsnCode,
        taxRate: item.taxRate,
        issueType: flag.type,
        details: flag.message,
      });
    });
  });
}

module.exports = { buildReconciliationWorkbook };
