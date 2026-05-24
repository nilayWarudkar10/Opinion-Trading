import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [form, setForm] = useState({ question: '', category: 'Sports' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/markets/add', form);
      alert("Market Created! 🚀");
      setForm({ question: '', category: 'Sports' });
    } catch (err) {
      alert("Failed to create market");
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto bg-slate-900 rounded-3xl mt-10 border border-slate-800">
      <h1 className="text-3xl font-black text-white mb-6">Create New Market</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          className="w-full p-4 bg-slate-950 rounded-xl text-white border border-slate-700"
          placeholder="Enter Question (e.g., Will Bitcoin hit $100k?)"
          onChange={e => setForm({...form, question: e.target.value})}
          value={form.question}
        />
        <select 
          className="w-full p-4 bg-slate-950 rounded-xl text-white border border-slate-700"
          onChange={e => setForm({...form, category: e.target.value})}
        >
          <option>Sports</option>
          <option>Crypto</option>
          <option>Politics</option>
        </select>
        <button className="w-full bg-blue-600 py-4 rounded-xl font-bold text-white hover:bg-blue-500 transition-all">
          Launch Market
        </button>
      </form>
    </div>
  );
};

export default Admin;