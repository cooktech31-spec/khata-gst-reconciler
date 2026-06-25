import { supabase } from './supabase.js';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Login karo pehle');
  return session.access_token;
}

export async function reconcileFiles({ gstin, legalName, homeState, periodMonth, periodYear, files }) {
  const token = await getToken();
  const form = new FormData();
  form.append('gstin', gstin);
  form.append('legalName', legalName);
  form.append('homeState', homeState);
  form.append('periodMonth', periodMonth);
  form.append('periodYear', periodYear);
  if (files?.meesho) form.append('meeshoFile', files.meesho);
  if (files?.amazon) form.append('amazonFile', files.amazon);
  if (files?.flipkart) form.append('flipkartFile', files.flipkart);

  const res = await fetch(`${BASE}/api/reconcile`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Reconciliation failed'); }
  return res.json();
}

export async function fetchBatches(gstin) {
  const token = await getToken();
  const url = `${BASE}/api/batches${gstin ? `?gstin=${gstin}` : ''}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export function exportBatchUrl(batchId) {
  return `${BASE}/api/batches/${batchId}/export`;
}
