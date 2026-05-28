import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';

    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);
      login(res.data.user);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      alert(err.response?.data?.msg || 'Authentication Failed');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/20 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-40 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-800/90 bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-[0.35em] text-sky-400/80">Opinion Trading</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">{isLogin ? 'Welcome Back' : 'Create your account'}</h1>
            <p className="mt-3 text-slate-400 leading-7">
              {isLogin ? 'Sign in to access markets and trade live predictions.' : 'Register now to start trading outcome markets instantly.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <input
                type="text"
                placeholder="Username"
                required
                className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-white outline-none transition focus:border-sky-400"
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-white outline-none transition focus:border-sky-400"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-white outline-none transition focus:border-sky-400"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button className="w-full rounded-3xl bg-sky-500 px-5 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-950 transition hover:bg-sky-400">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-sm text-slate-400">
            <p>
              {isLogin ? 'New to Opinion Trading?' : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-semibold text-sky-300 hover:text-sky-200"
              >
                {isLogin ? 'Register now' : 'Login here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
