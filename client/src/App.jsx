import React, { useContext, useState } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';

const MainApp = () => {
  const { user, logout } = useContext(AuthContext);
  const [page, setPage] = useState('dashboard');

  if (!user) return <Auth />;

  const navItems = [
    { id: 'dashboard', label: 'Markets' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen text-slate-100">
      <div className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
              Opinion Trading
            </span>
            <span className="hidden text-sm text-slate-400 sm:inline-flex">
              Live markets. Real outcomes.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden flex-col text-sm text-slate-400 md:flex">
              <span className="uppercase tracking-[0.25em] text-slate-500">Balance</span>
              <span className="font-semibold text-white">{(user?.balance || 0).toLocaleString()}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${page === item.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900/90 hover:text-white'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={logout}
              className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {page === 'dashboard' && <Dashboard />}
        {page === 'portfolio' && <Portfolio />}
        {page === 'admin' && <Admin />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
