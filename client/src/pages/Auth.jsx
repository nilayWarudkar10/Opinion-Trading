import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true); // Toggle state
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
            alert(err.response?.data?.msg || "Authentication Failed");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-slate-950 px-4">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-md shadow-2xl">
                <h2 className="text-3xl font-black text-white mb-2">
                    {isLogin ? "Welcome Back" : "Join the Terminal"}
                </h2>
                <p className="text-slate-500 mb-8">
                    {isLogin ? "Enter your credentials to trade." : "Create an account to start with ₹500."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text" placeholder="Username" required
                            className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    )}
                    <input
                        type="email" placeholder="Email Address" required
                        className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="password" placeholder="Password" required
                        className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button className="w-full bg-blue-600 py-4 rounded-xl font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                        {isLogin ? "Sign In" : "Create Account"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                    <p className="text-slate-400">
                        {isLogin ? "New to the platform?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-blue-400 font-bold hover:underline"
                        >
                            {isLogin ? "Register Now" : "Login here"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;