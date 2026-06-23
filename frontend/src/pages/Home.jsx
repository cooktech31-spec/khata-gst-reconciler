// =====================================================================
// Home.jsx — pehli screen: seller apni details aur files upload karta hai
// Koi bhi ek ya teen platforms ka data dena okay hai — tool jo mile
// ussi se kaam kar leta hai. Strict validation avoid kiya hai taaki
// testing aur partial-data scenarios cover ho sakein.
// =====================================================================
import { useState } from "react";
import { FileSpreadsheet, ArrowRight, Loader2 } from "lucide-react";
import HeroStack from "../components/HeroStack.jsx";
import LedgerBackground from "../components/LedgerBackground.jsx";
import Dropzone from "../components/Dropzone.jsx";
import { INDIAN_STATES } from "../lib/indianStates.js";
import { reconcileFiles } from "../lib/api.js";

const MONTHS = [
  { value: "01", label: "January" }, { value: "02", label: "February" },
  { value: "03", label: "March" },   { value: "04", label: "April" },
  { value: "05", label: "May" },     { value: "06", label: "June" },
  { value: "07", label: "July" },    { value: "08", label: "August" },
  { value: "09", label: "September" },{ value: "10", label: "October" },
  { value: "11", label: "November" },{ value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 2, currentYear - 1, currentYear].map(String);

function InputLabel({ children }) {
  return (
    <label className="block font-body text-[10px] uppercase tracking-widest text-mist mb-1.5">
      {children}
    </label>
  );
}

function TextInput({ ...props }) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 font-mono text-sm text-paper-100 placeholder:text-mist/40 focus:border-ledger-blue/60 focus:outline-none focus:ring-1 focus:ring-ledger-blue/30 transition-colors"
    />
  );
}

function SelectInput({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 font-body text-sm text-paper-100 focus:border-ledger-blue/60 focus:outline-none focus:ring-1 focus:ring-ledger-blue/30 transition-colors"
    >
      {children}
    </select>
  );
}

export default function Home({ onResult }) {
  const [form, setForm] = useState({
    gstin: "",
    legalName: "",
    homeState: "",
    periodMonth: String(new Date().getMonth() + 1).padStart(2, "0"),
    periodYear: String(currentYear),
  });
  const [files, setFiles] = useState({ meesho: null, amazon: null, flipkart: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function hasAtLeastOneFile() {
    return files.meesho || files.amazon || files.flipkart;
  }

  async function handleSubmit() {
    if (!form.gstin.trim()) return setError("GSTIN dalna zaroori hai");
    if (!form.legalName.trim()) return setError("Legal name dalna zaroori hai");
    if (!form.homeState) return setError("Home state select karo");
    if (!hasAtLeastOneFile()) return setError("Kam se kam ek platform ki file upload karo");

    setError("");
    setLoading(true);
    try {
      const result = await reconcileFiles({ ...form, files });
      onResult(result);
    } catch (err) {
      setError(err.message || "Kuch galat ho gaya — dobara try karo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-ink-950">
      <LedgerBackground />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-seal-gold" />
          <span className="font-display text-base tracking-tight text-paper-100">Khata</span>
          <span className="ml-1 rounded border border-ledger-blue/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ledger-blue">
            GST v1
          </span>
        </div>
        <span className="hidden font-body text-xs text-mist md:block">
          Multi-marketplace GST Reconciler
        </span>
      </header>

      {/* Hero section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-10 pb-6 md:px-12 md:pt-16">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ledger-blue">
              ← Meesho · Amazon · Flipkart →
            </p>
            <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-paper-100 md:text-5xl">
              Teen platform,
              <br />
              <span className="text-seal-gold">ek Khata.</span>
            </h1>
            <p className="font-body text-sm leading-relaxed text-mist">
              Apne teeno platforms ke GST reports upload karo. Khata automatically
              reconcile karega — HSN summary, TCS match, state-wise breakup, aur
              AI-generated Hinglish analysis — GSTR-1 ready.
            </p>
          </div>
          <HeroStack />
        </div>
      </section>

      {/* Upload form */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-16 md:px-12">
        <div className="glass-card margin-rule rounded-2xl border border-ink-700 p-6 md:p-8">

          {/* Business details */}
          <div className="mb-6">
            <p className="mb-4 font-body text-[10px] uppercase tracking-widest text-mist">
              Business Details
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <InputLabel>GSTIN *</InputLabel>
                <TextInput
                  placeholder="27AABCU9603R1ZX"
                  maxLength={15}
                  value={form.gstin}
                  onChange={(e) => setField("gstin", e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <InputLabel>Legal / Trade Name *</InputLabel>
                <TextInput
                  placeholder="Cooktech Enterprises"
                  value={form.legalName}
                  onChange={(e) => setField("legalName", e.target.value)}
                />
              </div>
              <div>
                <InputLabel>Home State (Registration State) *</InputLabel>
                <SelectInput
                  value={form.homeState}
                  onChange={(e) => setField("homeState", e.target.value)}
                >
                  <option value="">State select karo</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </SelectInput>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <InputLabel>Month *</InputLabel>
                  <SelectInput
                    value={form.periodMonth}
                    onChange={(e) => setField("periodMonth", e.target.value)}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </SelectInput>
                </div>
                <div className="flex-1">
                  <InputLabel>Year *</InputLabel>
                  <SelectInput
                    value={form.periodYear}
                    onChange={(e) => setField("periodYear", e.target.value)}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </SelectInput>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6 border-t border-ink-700" />

          {/* File dropzones */}
          <div className="mb-6">
            <p className="mb-1 font-body text-[10px] uppercase tracking-widest text-mist">
              Platform Reports
            </p>
            <p className="mb-4 font-body text-xs text-mist/60">
              Koi bhi ek ya teenon platform ki file daal sakte ho
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <Dropzone
                label="Meesho"
                sub="GST / Payout Report"
                accentColor="#B6447A"
                file={files.meesho}
                onSelect={(f) => setFiles((p) => ({ ...p, meesho: f }))}
              />
              <Dropzone
                label="Amazon"
                sub="MTR / Tax Report"
                accentColor="#B9772E"
                file={files.amazon}
                onSelect={(f) => setFiles((p) => ({ ...p, amazon: f }))}
              />
              <Dropzone
                label="Flipkart"
                sub="Tax Invoice Report"
                accentColor="#3E6FB0"
                file={files.flipkart}
                onSelect={(f) => setFiles((p) => ({ ...p, flipkart: f }))}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-rule-red/30 bg-rule-red/10 px-4 py-2.5">
              <p className="font-body text-xs text-rule-red">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ledger-blue px-6 py-3.5 font-body text-sm font-semibold text-white transition-all hover:bg-ledger-blue-dim disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Reconcile ho raha hai…
              </>
            ) : (
              <>
                Reconcile Karo
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
