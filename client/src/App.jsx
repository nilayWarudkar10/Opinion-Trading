import React, { useContext, useState } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin'; // 1. Added this import

const MainApp = () => {
  const { user, logout } = useContext(AuthContext);
  const [page, setPage] = useState('dashboard');

  if (!user) return <Auth />;

  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex gap-8">
          <button 
            onClick={() => setPage('dashboard')} 
            className={`font-bold transition-all ${page === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            Terminal
          </button>
          <button 
            onClick={() => setPage('portfolio')} 
            className={`font-bold transition-all ${page === 'portfolio' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            Portfolio
          </button>
          <button 
            onClick={() => setPage('admin')} 
            className={`font-bold transition-all ${page === 'admin' ? 'text-blue-400' : 'text-slate-600 hover:text-white'}`}
          >
            Admin
          </button>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-emerald-400 font-mono font-bold">
            ₹{(user?.balance || user?.walletBalance || 0).toLocaleString()}
          </span>
          <button
            onClick={logout}
            className="bg-slate-800 px-4 py-2 rounded-lg text-rose-400 font-bold hover:bg-rose-500 hover:text-white transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page Content - Single Render Logic */}
      <main className="transition-all duration-300">
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