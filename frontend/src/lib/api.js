// =====================================================================
// api.js — backend se baat karne ka single jagah
// =====================================================================
// VITE_API_BASE_URL aur VITE_API_KEY .env mein set karna (.env.example dekho)

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export async function reconcileFiles({ files, gstin, legalName, homeState, periodMonth, periodYear }) {
  const formData = new FormData();
  if (files.meesho) formData.append("meeshoFile", files.meesho);
  if (files.amazon) formData.append("amazonFile", files.amazon);
  if (files.flipkart) formData.append("flipkartFile", files.flipkart);
  formData.append("gstin", gstin);
  formData.append("legalName", legalName);
  formData.append("homeState", homeState);
  formData.append("periodMonth", periodMonth);
  formData.append("periodYear", periodYear);

  const res = await fetch(`${API_BASE}/api/reconcile`, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Reconciliation failed");
  return data;
}

export async function fetchBatches(gstin) {
  const res = await fetch(`${API_BASE}/api/batches?gstin=${encodeURIComponent(gstin)}`, {
    headers: { "x-api-key": API_KEY },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not fetch batches");
  return data.batches;
}

export function exportBatchUrl(batchId) {
  return `${API_BASE}/api/batches/${batchId}/export`;
}
