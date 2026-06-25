// =====================================================================
// Dropzone.jsx — ek platform (Meesho/Amazon/Flipkart) ki file upload karne
// ke liye drag-and-drop box. Teeno optional hain — jo bhi files user ke
// paas available hain wahi daal de, kam se kam ek zaroori hai.
// =====================================================================
import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";

function formatBytes(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function Dropzone({ label, sub, accentColor = "#4A63E8", file, onSelect }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(fileList) {
    const f = fileList?.[0];
    if (f) onSelect(f);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !file && inputRef.current?.click()}
      className={`glass-card relative flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
        dragOver ? "border-ledger-blue" : "border-white/5"
      }`}
      style={{ borderTop: `2px solid ${accentColor}` }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!file ? (
        <>
          <Upload size={18} className="text-mist" />
          <p className="font-body text-sm text-paper-100">{label}</p>
          <p className="font-mono text-[10px] text-mist">{sub}</p>
        </>
      ) : (
        <>
          <FileSpreadsheet size={20} className="text-seal-gold" />
          <p className="max-w-[90%] truncate font-body text-xs text-paper-100">{file.name}</p>
          <p className="font-mono text-[10px] text-mist">{formatBytes(file.size)}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-2 top-2 rounded-full bg-ink-700 p-1 text-mist hover:text-rule-red"
            aria-label={`${label} file hatao`}
          >
            <X size={12} />
          </button>
        </>
      )}
    </div>
  );
}
