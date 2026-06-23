// =====================================================================
// reconcile.js — Core Reconciliation Engine
// =====================================================================
// Yeh file teen platforms ke normalized LineItems lekar:
//   1. HSN-wise summary banata hai      (GSTR-1 Table 12)
//   2. State-wise B2C summary banata hai (GSTR-1 Table 7 - B2CL/B2CS)
//   3. B2B invoice list nikalta hai      (GSTR-1 Table 4)
//   4. TCS expected vs reported match karta hai (Section 52 check)
//   5. Har row pe data-quality flags lagata hai (missing HSN, purana
//      slab rate, duplicate order, etc)
//
// Is file ko backend ke andar bhi use hota hai (DB save karne se pehle)
// aur isi logic ko hum standalone bhi test karte hain (test/testParsers.js)
// =====================================================================

const TCS_RATE_PERCENT = parseFloat(process.env.TCS_RATE_PERCENT || "0.5"); // Notification 15/2024 ke baad se 0.5%
const VALID_GST_RATES = [0, 0.25, 1.5, 3, 5, 18, 40]; // GST 2.0 (22-Sep-2025) ke baad valid slabs
const ABOLISHED_RATES = [12, 28]; // yeh purane slabs hain — agar koi item abhi bhi yeh rate dikha raha hai, woh outdated listing hai

function reconcile(allLineItems, homeState) {
  const seenOrderKeys = new Set();

  // ---- STEP 1: Per-row flags lagao ----
  const itemsWithFlags = allLineItems.map((item) => {
    const flags = [];

    if (!item.hsnCode) {
      flags.push({ type: "MISSING_HSN", message: "HSN code missing hai — listing update karo." });
    }

    if (ABOLISHED_RATES.includes(Math.round(item.taxRate))) {
      flags.push({
        type: "OLD_SLAB_RATE",
        message: `Rate ${item.taxRate}% GST 2.0 reform (22 Sep 2025) ke baad abolish ho gaya hai — listing ka rate galat hai, sahi kar lo.`,
      });
    } else if (!VALID_GST_RATES.includes(roundToNearestValid(item.taxRate))) {
      flags.push({
        type: "UNUSUAL_RATE",
        message: `Rate ${item.taxRate}% kisi bhi standard GST slab se match nahi karta — verify karo.`,
      });
    }

    const orderKey = `${item.platform}::${item.orderId}`;
    if (seenOrderKeys.has(orderKey)) {
      flags.push({ type: "DUPLICATE_ORDER", message: "Yeh order ID ek baar pehle bhi aa chuka hai — duplicate upload ho sakta hai." });
    }
    seenOrderKeys.add(orderKey);

    return { ...item, flags };
  });

  const delivered = itemsWithFlags.filter((i) => i.orderStatus === "DELIVERED");
  const returned = itemsWithFlags.filter((i) => i.orderStatus === "RETURNED");
  const cancelled = itemsWithFlags.filter((i) => i.orderStatus === "CANCELLED");

  // ---- STEP 2: HSN-wise summary (sirf delivered items, GSTR-1 Table 12) ----
  const hsnSummary = groupSum(delivered, (i) => i.hsnCode || "UNKNOWN", (i) => ({
    hsnCode: i.hsnCode || "UNKNOWN",
    taxRate: i.taxRate,
  }));

  // ---- STEP 3: State-wise B2C summary (Table 7) ----
  const stateSummary = groupSum(
    delivered.filter((i) => i.supplyType !== "B2B"),
    (i) => `${i.buyerState || "UNKNOWN"}::${i.taxRate}`,
    (i) => ({ buyerState: i.buyerState || "UNKNOWN", taxRate: i.taxRate, supplyType: i.supplyType })
  );

  // ---- STEP 4: B2B invoice list (Table 4) ----
  const b2bInvoices = delivered
    .filter((i) => i.supplyType === "B2B")
    .map((i) => ({
      platform: i.platform,
      orderId: i.orderId,
      invoiceNumber: i.invoiceNumber,
      buyerGstin: i.buyerGstin,
      taxableValue: i.taxableValue,
      taxRate: i.taxRate,
      cgst: i.cgst,
      sgst: i.sgst,
      igst: i.igst,
    }));

  // ---- STEP 5: TCS reconciliation ----
  const netTaxableForTcs = sumBy(delivered, "taxableValue");
  const expectedTcs = round2((netTaxableForTcs * TCS_RATE_PERCENT) / 100);
  const reportedTcs = round2(sumBy(allLineItems, "tcsAmount"));
  const tcsDiff = round2(expectedTcs - reportedTcs);
  const tcsMismatch = Math.abs(tcsDiff) > Math.max(5, expectedTcs * 0.01); // ₹5 ya 1% tolerance

  // ---- STEP 6: Overall totals ----
  const totalTaxableValue = round2(sumBy(delivered, "taxableValue"));
  const totalTax = round2(sumBy(delivered, "cgst") + sumBy(delivered, "sgst") + sumBy(delivered, "igst"));

  const flaggedItems = itemsWithFlags.filter((i) => i.flags.length > 0);

  const platformBreakdown = ["MEESHO", "AMAZON", "FLIPKART"].map((platform) => {
    const platformItems = delivered.filter((i) => i.platform === platform);
    return {
      platform,
      orders: platformItems.length,
      taxableValue: round2(sumBy(platformItems, "taxableValue")),
      tcsReported: round2(sumBy(allLineItems.filter((i) => i.platform === platform), "tcsAmount")),
    };
  });

  return {
    summary: {
      totalOrders: delivered.length,
      returnedOrders: returned.length,
      cancelledOrders: cancelled.length,
      totalTaxableValue,
      totalTax,
      expectedTcs,
      reportedTcs,
      tcsDiff,
      tcsMismatch,
      mismatchCount: flaggedItems.length,
    },
    hsnSummary,
    stateSummary,
    b2bInvoices,
    platformBreakdown,
    flaggedItems: flaggedItems.map((i) => ({
      platform: i.platform,
      orderId: i.orderId,
      hsnCode: i.hsnCode,
      taxRate: i.taxRate,
      flags: i.flags,
    })),
    rawDelivered: delivered, // export ke liye chahiye hota hai
  };
}

// ---- Helpers ----

function sumBy(arr, key) {
  return arr.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function roundToNearestValid(rate) {
  // chhote floating point errors (5.01, 17.99) ko nearest valid slab maan lo
  let closest = VALID_GST_RATES[0];
  let minDiff = Infinity;
  for (const v of VALID_GST_RATES) {
    const diff = Math.abs(v - rate);
    if (diff < minDiff) {
      minDiff = diff;
      closest = v;
    }
  }
  return minDiff <= 0.5 ? closest : rate;
}

function groupSum(items, keyFn, metaFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, {
        ...metaFn(item),
        count: 0,
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
      });
    }
    const g = groups.get(key);
    g.count += 1;
    g.taxableValue += Number(item.taxableValue) || 0;
    g.cgst += Number(item.cgst) || 0;
    g.sgst += Number(item.sgst) || 0;
    g.igst += Number(item.igst) || 0;
  }
  return Array.from(groups.values()).map((g) => ({
    ...g,
    taxableValue: round2(g.taxableValue),
    cgst: round2(g.cgst),
    sgst: round2(g.sgst),
    igst: round2(g.igst),
  }));
}

module.exports = { reconcile, TCS_RATE_PERCENT, VALID_GST_RATES, ABOLISHED_RATES };
