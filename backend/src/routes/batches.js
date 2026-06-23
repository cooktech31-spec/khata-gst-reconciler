// =====================================================================
// routes/batches.js — history dekhna aur Excel download karna
// =====================================================================

const express = require("express");
const { prisma } = require("../db/prismaClient");
const { reconcile } = require("../services/reconcile");
const { buildReconciliationWorkbook } = require("../services/exportExcel");

const router = express.Router();

// GET /api/batches?gstin=...  -> company ki saari past batches (history dashboard ke liye)
router.get("/batches", async (req, res) => {
  try {
    const { gstin } = req.query;
    if (!gstin) return res.status(400).json({ error: "gstin query param chahiye." });

    const company = await prisma.company.findUnique({ where: { gstin } });
    if (!company) return res.json({ batches: [] });

    const batches = await prisma.reconciliationBatch.findMany({
      where: { companyId: company.id },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    });

    return res.json({ batches });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Batches fetch nahi ho paaye." });
  }
});

// GET /api/batches/:id/export -> GSTR-1 ready Excel download
router.get("/batches/:id/export", async (req, res) => {
  try {
    const batch = await prisma.reconciliationBatch.findUnique({
      where: { id: req.params.id },
      include: { company: true, lineItems: true },
    });
    if (!batch) return res.status(404).json({ error: "Batch nahi mila." });

    // Line items ko reconcile() ke expected shape mein convert karke dobara
    // chalate hain — yeh deterministic hai, isliye stored summary se safe hai.
    const normalizedItems = batch.lineItems.map((li) => ({
      platform: li.platform,
      orderId: li.orderId,
      invoiceNumber: li.invoiceNumber,
      invoiceDate: li.invoiceDate,
      hsnCode: li.hsnCode,
      productName: li.productName,
      taxableValue: Number(li.taxableValue),
      taxRate: Number(li.taxRate),
      cgst: Number(li.cgst),
      sgst: Number(li.sgst),
      igst: Number(li.igst),
      tcsAmount: Number(li.tcsAmount),
      buyerState: li.buyerState,
      buyerGstin: li.buyerGstin,
      supplyType: li.supplyType,
      orderStatus: li.orderStatus,
    }));

    const result = reconcile(normalizedItems, batch.company.homeState);
    const workbook = await buildReconciliationWorkbook(
      result,
      { legalName: batch.company.legalName, gstin: batch.company.gstin },
      { month: batch.periodMonth, year: batch.periodYear }
    );

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=GSTR1_${batch.company.gstin}_${batch.periodMonth}_${batch.periodYear}.xlsx`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Excel export fail ho gaya." });
  }
});

module.exports = router;
