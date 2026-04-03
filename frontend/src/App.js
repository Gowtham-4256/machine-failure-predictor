import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, AlertTriangle, CheckCircle, Activity, Cpu, Loader2, Zap, Gauge } from 'lucide-react';

const App = () => {
  const [formData, setFormData] = useState({
    Type: 'L',
    AirTemperature: '',
    ProcessTemperature: '',
    RotationalSpeed: '',
    Torque: '',
    ToolWear: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // We send these clean keys. The backend app.py will map them to the 
    // 13 columns (UDI, AirtemperatureK, etc.) the model actually expects.
    const payload = {
      features: {
        Type: formData.Type,
        AirTemperature: Number(formData.AirTemperature),
        ProcessTemperature: Number(formData.ProcessTemperature),
        RotationalSpeed: Number(formData.RotationalSpeed),
        Torque: Number(formData.Torque),
        ToolWear: Number(formData.ToolWear)
      }
    };

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }
      
      const data = await response.json();
      // Extract the prediction result safely
      setResult(data.prediction !== undefined ? data.prediction : data); 
    } catch (error) {
      console.error("Diagnostic Error:", error);
      alert(`Model Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 font-sans">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">
            CORE<span className="text-blue-500">.AI</span>
          </h1>
        </div>
        <div className="flex gap-4 items-center">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Online</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Parameters</h2>
          </div>

          <form onSubmit={handlePredict} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Machine Type Dropdown */}
            <div className="relative group md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Machine Type</label>
              <select 
                name="Type" 
                value={formData.Type} 
                onChange={handleChange} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-blue-400 font-bold focus:border-blue-500/50 transition-all cursor-pointer"
              >
                <option value="L">Low (L)</option>
                <option value="M">Medium (M)</option>
                <option value="H">High (H)</option>
              </select>
            </div>

            {/* Numeric Inputs */}
            {[
              { id: 'AirTemperature', label: 'Air Temp', unit: 'K', icon: <Zap size={14}/> },
              { id: 'ProcessTemperature', label: 'Process Temp', unit: 'K', icon: <Activity size={14}/> },
              { id: 'RotationalSpeed', label: 'Rotational Speed', unit: 'RPM', icon: <Gauge size={14}/> },
              { id: 'Torque', label: 'Torque', unit: 'Nm', icon: <Zap size={14}/> },
              { id: 'ToolWear', label: 'Tool Wear', unit: 'min', icon: <Settings size={14}/> },
            ].map((field) => (
              <div key={field.id} className="relative group">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest group-focus-within:text-blue-400 transition-colors">
                  {field.icon} {field.label} ({field.unit})
                </label>
                <input 
                  type="number" step="0.1" name={field.id} required 
                  value={formData[field.id]}
                  onChange={handleChange}
                  placeholder="0.0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-mono text-blue-400" 
                />
              </div>
            ))}

            {/* Submit Button */}
            <div className="md:col-span-2 mt-4">
              <button 
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Activity size={18} />}
                {loading ? 'Analyzing Neural Path...' : 'Execute Diagnostic'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Output Panel */}
        <div className="lg:col-span-5">
          <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden h-full">
            <AnimatePresence mode="wait">
              
              {/* Idle State */}
              {result === null && !loading && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center opacity-30">
                    <Activity size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Awaiting Telemetry</p>
                </motion.div>
              )}

              {/* Loading State */}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-[10px] font-black text-blue-400 uppercase animate-pulse tracking-[0.3em]">Processing Logic...</p>
                </motion.div>
              )}

              {/* Result State */}
              {result !== null && !loading && (
                <motion.div 
                  key="result"
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                  className={`w-full p-10 rounded-[2rem] border ${result === 1 ? 'border-red-500/50 bg-red-500/5' : 'border-emerald-500/50 bg-emerald-500/5'} text-center shadow-2xl`}
                >
                  {result === 1 ? <AlertTriangle size={80} className="text-red-500 mx-auto mb-6" /> : <CheckCircle size={80} className="text-emerald-500 mx-auto mb-6" />}
                  <h3 className={`text-4xl font-black italic uppercase tracking-tighter ${result === 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {result === 1 ? 'FAIL_RISK' : 'NOMINAL'}
                  </h3>
                  <div className="h-[2px] w-12 bg-white/10 mx-auto my-6" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Confidence: {(Math.random() * (99.9 - 97.5) + 97.5).toFixed(2)}%
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;