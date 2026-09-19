import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [form, setForm] = useState({ question: '', category: 'Tech & AI' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/markets/add', form);
      alert("Market Created!");
      setForm({ question: '', category: 'Tech & AI' });
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
          <option>Tech &amp; AI</option>
          <option>Global Macroeconomics</option>
          <option>Crypto &amp; Web3</option>
          <option>Space &amp; Aviation</option>
          <option>Science &amp; Biotech</option>
          <option>Climate &amp; Energy</option>
          <option>Sports &amp; Cricket</option>
          <option>Esports &amp; Gaming</option>
          <option>Entertainment &amp; Box Office</option>
          <option>Creator Economy</option>
          <option>Geopolitics &amp; Policy</option>
          <option>Startups &amp; Venture Capital</option>
        </select>
        <button className="w-full bg-[#6d9cf2] py-4 rounded-xl font-bold text-white hover:bg-[#5d87d6] transition-all">
          Launch Market
        </button>
      </form>
    </div>
  );
};

export default Admin;