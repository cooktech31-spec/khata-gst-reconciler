import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) return setError('Email aur password dono daalo');
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message === 'Invalid login credentials' ? 'Email ya password galat hai' : err.message);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <FileSpreadsheet size={20} className="text-seal-gold" />
            <span className="font-display text-xl text-paper-100">Khata</span>
          </div>
          <p className="font-body text-sm text-mist">GST Reconciler — Login karo</p>
        </div>

        <div className="glass-card rounded-2xl border border-ink-700 p-6">
          <div className="mb-4">
            <label className="mb-1.5 block font-body text-[10px] uppercase tracking-widest text-mist">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 font-body text-sm text-paper-100 placeholder:text-mist/40 focus:border-ledger-blue/60 focus:outline-none transition-colors"
              placeholder="seller@gmail.com"
            />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block font-body text-[10px] uppercase tracking-widest text-mist">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 font-body text-sm text-paper-100 placeholder:text-mist/40 focus:border-ledger-blue/60 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="mb-4 rounded-lg bg-rule-red/10 px-3 py-2 font-body text-xs text-rule-red">{error}</p>}

          <button onClick={handleLogin} disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ledger-blue py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-ledger-blue-dim disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Login
          </button>

          <p className="mt-4 text-center font-body text-xs text-mist">
            Account nahi hai?{' '}
            <button onClick={onSwitch} className="text-ledger-blue underline">Sign Up karo — Free</button>
          </p>
        </div>
      </div>
    </div>
  );
}
