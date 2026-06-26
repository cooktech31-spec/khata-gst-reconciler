import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase.js';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';

export default function App() {
  const [authState, setAuthState] = useState('loading'); // loading | loggedOut | ready
  const [authView, setAuthView] = useState('login');
  const [view, setView] = useState('home');
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? 'ready' : 'loggedOut');
    });

    // Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? 'ready' : 'loggedOut');
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleResult(data) {
    setResultData(data);
    setView('results');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function handleReset() {
    setResultData(null);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Loading spinner
  if (authState === 'loading') return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-ledger-blue border-t-transparent" />
    </div>
  );

  // Not logged in
  if (authState === 'loggedOut') {
    return authView === 'login'
      ? <Login onSwitch={() => setAuthView('signup')} />
      : <Signup onSwitch={() => setAuthView('login')} />;
  }

  // Logged in — show tool
  if (view === 'results' && resultData) return <Results data={resultData} onReset={handleReset} />;
  return <Home onResult={handleResult} />;
}
