import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Sports');
  // Initialize with two empty options to meet the minimum requirement
  const [optionTitles, setOptionTitles] = useState(['', '']);

  // Handle updates for a specific option field index
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...optionTitles];
    updatedOptions[index] = value;
    setOptionTitles(updatedOptions);
  };

  // Append a brand new empty option field (Enforcing the Max 5 rule)
  const addOptionField = () => {
    if (optionTitles.length < 5) {
      setOptionTitles([...optionTitles, '']);
    }
  };

  // Remove a precise option field (Enforcing the Min 2 rule)
  const removeOptionField = (index) => {
    if (optionTitles.length > 2) {
      const updatedOptions = optionTitles.filter((_, i) => i !== index);
      setOptionTitles(updatedOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submitting blank space options
    const cleanOptions = optionTitles.filter(opt => opt.trim() !== '');
    if (cleanOptions.length < 2) {
      alert("Please provide at least 2 valid options.");
      return;
    }

    try {
      // 💡 Clean, explicit payload construction right before the API call
      const payload = {
        question: question.trim(),
        category: category,
        description: "No description provided.", // Fallback property to support your updated Schema
        optionTitles: cleanOptions
      };

      // 💡 Safely load your authentication token if your routes use auth verification middlewares
      const token = localStorage.getItem('token'); 
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }) // Attaches header safely if token exists
        }
      };

      // Execute request to your Express server endpoint
      await axios.post('http://localhost:5000/api/markets/add', payload, config);
      
      alert("Market Created! 🚀");
      
      // Reset form variables cleanly
      setQuestion('');
      setCategory('Sports');
      setOptionTitles(['', '']);
    } catch (err) {
      // Pull down the detailed error response string from MongoDB or express validation
      alert(err.response?.data?.message || "Failed to create market");
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto bg-slate-900 rounded-3xl mt-10 border border-slate-800 shadow-2xl">
      <h1 className="text-3xl font-black text-white mb-6">Create New Market</h1>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Question Text Field Container */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Market Question</label>
          <input 
            className="w-full p-4 bg-slate-950 rounded-xl text-white border border-slate-700 outline-none focus:border-blue-500 transition-all"
            placeholder="Enter Question (e.g., Which team will win the tournament?)"
            onChange={e => setQuestion(e.target.value)}
            value={question}
            required
          />
        </div>

        {/* Dropdown Category Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category</label>
          <select 
            className="w-full p-4 bg-slate-950 rounded-xl text-white border border-slate-700 outline-none focus:border-blue-500 transition-all"
            onChange={e => setCategory(e.target.value)}
            value={category}
          >
            <option>Sports</option>
            <option>Crypto</option>
            <option>Politics</option>
            <option>Hollywood</option>
            <option>Bollywood</option>
            <option>Tollywood</option>
            <option>Business</option>
            <option>Current Affairs</option>
            <option>Nature</option>
            <option>Real estate</option>
            <option>Fiction</option>
            <option>Anime</option>
          </select>
        </div>

        {/* Poll Options Setup Area */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Poll Options (Min 2, Max 5)
          </label>
          
          {optionTitles.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input 
                className="flex-1 p-4 bg-slate-950 rounded-xl text-white border border-slate-700 outline-none focus:border-blue-500 transition-all"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={e => handleOptionChange(index, e.target.value)}
                required
              />
              
              {/* Dynamic Deletion Button Element */}
              {optionTitles.length > 2 && (
                <button 
                  type="button"
                  onClick={() => removeOptionField(index)}
                  className="px-4 py-4 bg-red-950/40 text-red-400 border border-red-900/50 rounded-xl font-bold hover:bg-red-900/50 transition-all"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Append Control Interaction Field Trigger */}
        {optionTitles.length < 5 && (
          <button 
            type="button" 
            onClick={addOptionField}
            className="w-full py-2.5 border border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-400 hover:text-blue-400 transition-all"
          >
            + Add Option Field ({optionTitles.length}/5)
          </button>
        )}

        {/* Submit Execution Button */}
        <button className="w-full bg-blue-600 py-4 rounded-xl font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
          Launch Market
        </button>

      </form>
    </div>
  );
};

export default Admin;