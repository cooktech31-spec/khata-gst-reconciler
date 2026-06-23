// =====================================================================
// routes/upload.js — main endpoint: 3 files upload karo, reconciled
// result wapas milta hai
// =====================================================================

const express = require("express");
const multer = require("multer");

const { parseMeeshoFile } = require("../parsers/meeshoParser");
const { parseAmazonFile } = require("../parsers/amazonParser");
const { parseFlipkartFile } = require("../parsers/flipkartParser");
const { reconcile } = require("../services/reconcile");
const { generateInsights } = require("../services/aiInsights");
const { prisma } = require("../db/prismaClient");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/reconcile
// multipart/form-data fields: meeshoFile, amazonFile, flipkartFile (koi bhi
// subset bhej sakte ho — sab teen mandatory nahi), gstin, legalName,
// homeState, periodMonth, periodYear
router.post(
  "/reconcile",
  upload.fields([
    { name: "meeshoFile", maxCount: 1 },
    { name: "amazonFile", maxCount: 1 },
    { name: "flipkartFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { gstin, legalName, homeState, periodMonth, periodYear } = req.body;

      if (!gstin || !legalName || !homeState || !periodMonth || !periodYear) {
        return res.status(400).json({
          error: "gstin, legalName, homeState, periodMonth, periodYear — sab fields zaroori hain.",
        });
      }

      const files = req.files || {};
      if (!files.meeshoFile && !files.amazonFile && !files.flipkartFile) {
        return res.status(400).json({ error: "Kam se kam ek platform ki file upload karo." });
      }

      // ---- Step 1: Parse har platform ki file ----
      const allLineItems = [];
      const allWarnings = [];

      if (files.meeshoFile) {
        const f = files.meeshoFile[0];
        const { lineItems, warnings } = parseMeeshoFile(f.buffer, f.originalname);
        allLineItems.push(...lineItems);
        allWarnings.push(...warnings);
      }
      if (files.amazonFile) {
        const f = files.amazonFile[0];
        const { lineItems, warnings } = parseAmazonFile(f.buffer, f.originalname);
        allLineItems.push(...lineItems);
        allWarnings.push(...warnings);
      }
      if (files.flipkartFile) {
        const f = files.flipkartFile[0];
        const { lineItems, warnings } = parseFlipkartFile(f.buffer, f.originalname);
        allLineItems.push(...lineItems);
        allWarnings.push(...warnings);
      }

      if (allLineItems.length === 0) {
        return res.status(422).json({
          error: "Files parse hui par koi valid row nahi mili. Column mapping check karo (columnMaps.js).",
          warnings: allWarnings,
        });
      }

      // ---- Step 2: Reconcile ----
      const result = reconcile(allLineItems, homeState);

      // ---- Step 3: AI insight (Hinglish summary) ----
      const aiInsight = await generateInsights(result, { legalName, gstin });

      // ---- Step 4: DB mein save karo (company + batch + line items) ----
      const company = await prisma.company.upsert({
        where: { gstin },
        update: { legalName, homeState },
        create: { gstin, legalName, homeState },
      });

      const batch = await prisma.reconciliationBatch.upsert({
        where: {
          companyId_periodMonth_periodYear: {
            companyId: company.id,
            periodMonth: parseInt(periodMonth, 10),
            periodYear: parseInt(periodYear, 10),
          },
        },
        update: {
          status: "completed",
          totalOrders: result.summary.totalOrders,
          totalTaxableValue: result.summary.totalTaxableValue,
          totalTaxCollected: result.summary.totalTax,
          tcsExpected: result.summary.expectedTcs,
          tcsReportedByPlatforms: result.summary.reportedTcs,
          mismatchCount: result.summary.mismatchCount,
          aiInsightHinglish: aiInsight,
        },
        create: {
          companyId: company.id,
          periodMonth: parseInt(periodMonth, 10),
          periodYear: parseInt(periodYear, 10),
          status: "completed",
          totalOrders: result.summary.totalOrders,
          totalTaxableValue: result.summary.totalTaxableValue,
          totalTaxCollected: result.summary.totalTax,
          tcsExpected: result.summary.expectedTcs,
          tcsReportedByPlatforms: result.summary.reportedTcs,
          mismatchCount: result.summary.mismatchCount,
          aiInsightHinglish: aiInsight,
        },
      });

      // Purane line items hatao (agar re-upload kiya hai isi period ke liye), phir naye daalo
      await prisma.lineItem.deleteMany({ where: { batchId: batch.id } });
      await prisma.lineItem.createMany({
        data: result.rawDelivered.concat(allLineItems.filter((i) => i.orderStatus !== "DELIVERED")).map((item) => ({
          batchId: batch.id,
          platform: item.platform,
          orderId: item.orderId,
          invoiceNumber: item.invoiceNumber,
          invoiceDate: item.invoiceDate,
          hsnCode: item.hsnCode,
          productName: item.productName,
          taxableValue: item.taxableValue,
          taxRate: item.taxRate,
          cgst: item.cgst,
          sgst: item.sgst,
          igst: item.igst,
          tcsAmount: item.tcsAmount,
          buyerState: item.buyerState,
          buyerGstin: item.buyerGstin,
          supplyType: item.supplyType,
          orderStatus: item.orderStatus,
          flagMissingHsn: !item.hsnCode,
          rawRow: item.rawRow || {},
        })),
      });

      return res.json({
        batchId: batch.id,
        warnings: allWarnings,
        ...result,
        aiInsight,
      });
    } catch (err) {
      console.error("Reconciliation failed:", err);
      return res.status(500).json({ error: "Kuch galat ho gaya server side pe.", details: err.message });
    }
  }
);

module.exports = router;
