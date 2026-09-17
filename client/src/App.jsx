import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';
import optionsIcon from './assets/options.png';

const MainApp = () => {
  const { user, logout } = useContext(AuthContext);
  const [page, setPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return <Auth />;

  const navItems = [
    { id: 'dashboard', label: 'Markets' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'admin', label: 'Admin' },
  ];

  const handleSelectPage = (id) => {
    setPage(id);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-100">
      <div className="relative flex min-h-screen overflow-hidden">
        <aside
          ref={menuRef}
          className={`absolute left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-slate-800/80 bg-slate-950/95 px-4 py-5 shadow-2xl shadow-slate-950/50 transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="text-sm font-semibold tracking-[0.35em] text-sky-300">Opinion Trading</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="rounded-full px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectPage(item.id)}
                className={`flex w-full items-center rounded-2xl px-4 py-3 text-left text-base font-medium transition ${
                  page === item.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="flex w-full items-center rounded-2xl px-4 py-3 text-left text-base font-medium text-rose-300 transition hover:bg-slate-900 hover:text-white"
            >
              Logout
            </button>
          </div>

        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
            <div className="mx-auto flex w-full items-center justify-between gap-6 px-[10px] py-4">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="ml-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-slate-800/80"
                aria-label="Open menu"
              >
                <img src={optionsIcon} alt="" className="h-7 w-7 object-contain" />
              </button>

              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold tracking-[0.15em] text-sky-300">Opinion Trading</span>
              </div>

              <div className="ml-auto flex items-center gap-2 px-1 py-1.5">
                <span className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase">Balance</span>
                <span className="text-sm font-semibold text-white">₹{(user?.balance || 0).toLocaleString()}</span>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full px-[10px] py-6">
            {page === 'dashboard' && <Dashboard />}
            {page === 'portfolio' && <Portfolio />}
            {page === 'admin' && <Admin />}
          </main>
        </div>
      </div>
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
