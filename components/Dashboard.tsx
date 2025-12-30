
import React, { useState } from 'react';
import { gemini } from '../services/gemini';

interface DashboardProps {
  theme: 'GNOSIS' | 'ABYSS' | 'BONE';
}

const Dashboard: React.FC<DashboardProps> = ({ theme }) => {
  const [isRealMode] = useState(() => localStorage.getItem('pc_mode') === 'REAL');
  const [cash] = useState(isRealMode ? 0 : 124500);
  const [donations24h] = useState(isRealMode ? 0 : 8240);
  const [complianceRatio] = useState(isRealMode ? 100 : 98.2);
  
  const [generatedNarrative, setGeneratedNarrative] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = [
    { label: 'Caja Gnosis', value: `$${cash.toLocaleString()}`, sub: 'Reflejo Verificado', color: theme === 'BONE' ? 'text-slate-900' : 'text-white' },
    { label: 'Sincronía 24h', value: `$${donations24h.toLocaleString()}`, sub: 'Pulsos Entrantes', color: 'text-indigo-500' },
    { label: 'Cumplimiento', value: `${complianceRatio}%`, sub: 'Audit Ready', color: theme === 'BONE' ? 'text-slate-600' : 'text-slate-300' },
    { label: 'Integridad', value: 'OPTIMAL', sub: 'Mirror Sentinel', color: 'text-indigo-400' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const report = await gemini.askAssistant("Emite un dictamen de Speculum Caritatis sobre la salud sistémica del nodo.");
    setGeneratedNarrative(report);
    setIsGenerating(false);
  };

  const cardBg = {
    GNOSIS: 'bg-[#1a1c29]/50 border-white/5 shadow-2xl',
    ABYSS: 'bg-white/[0.03] border-white/10',
    BONE: 'bg-white/70 border-slate-200 shadow-sm'
  }[theme];

  const headerBg = {
    GNOSIS: 'bg-gradient-to-br from-[#1a1c29] to-[#0f111a] border-white/5 shadow-2xl',
    ABYSS: 'bg-white/[0.03] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]',
    BONE: 'bg-white border-slate-200 shadow-lg'
  }[theme];

  const textColor = theme === 'BONE' ? 'text-slate-900' : 'text-white';

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-1000 pb-20">
      <div className={`backdrop-blur-3xl p-10 md:p-20 rounded-[4rem] border relative overflow-hidden group transition-all duration-1000 ${headerBg}`}>
        <div className={`absolute inset-0 bg-gradient-to-br transition-opacity ${theme === 'GNOSIS' ? 'from-indigo-600/10 to-transparent opacity-100' : 'from-white/5 to-transparent'}`}></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center text-center lg:text-left">
          <div className="mb-8 lg:mb-0">
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.8em] mb-4">Speculum AI - Reflective System</p>
            <h2 className={`text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none transition-colors ${textColor}`}>Espejo Maestro</h2>
            <p className={`text-xs font-medium uppercase tracking-[0.4em] mt-6 italic ${theme === 'BONE' ? 'text-slate-400' : 'text-slate-500'}`}>Speculum Caritatis - Verdad Humanitaria</p>
          </div>
          <button 
            onClick={handleGenerateReport}
            className={`px-10 md:px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center space-x-4 ${
              theme === 'BONE' ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-200' : 'bg-white text-black hover:bg-indigo-500 hover:text-white'
            }`}
          >
            {isGenerating ? <div className={`w-5 h-5 border-4 border-t-transparent rounded-full animate-spin ${theme === 'BONE' ? 'border-white' : 'border-black'}`}></div> : 'Sincronizar Reflejo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <div key={i} className={`backdrop-blur-3xl p-10 md:p-12 rounded-[3.5rem] border hover:bg-white/[0.05] transition-all group overflow-hidden relative ${cardBg}`}>
            <p className={`text-[9px] font-black uppercase tracking-[0.5em] mb-6 ${theme === 'BONE' ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
            <h3 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter ${stat.color}`}>{stat.value}</h3>
            <p className={`text-[8px] font-bold mt-6 uppercase tracking-[0.4em] ${theme === 'BONE' ? 'text-slate-300' : 'text-slate-700'}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`backdrop-blur-3xl p-12 md:p-20 rounded-[4rem] border relative overflow-hidden transition-all duration-1000 ${cardBg}`}>
           <div className="flex justify-between items-center mb-12">
              <h4 className={`text-xl font-black tracking-tighter uppercase ${textColor}`}>Frecuencia del Espejo</h4>
              <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                 <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Sincronía Reflejada</span>
              </div>
           </div>
           <div className="h-48 md:h-64 flex items-end justify-between space-x-3 md:space-x-6">
              {[70, 40, 85, 60, 95, 50, 75, 60, 80].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-2xl relative group transition-all ${theme === 'BONE' ? 'bg-slate-100' : 'bg-white/5'}`} style={{ height: `${h}%` }}>
                   <div className="absolute inset-0 bg-indigo-600/30 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
           </div>
        </div>

        <div className={`p-12 md:p-16 rounded-[4rem] shadow-2xl flex flex-col justify-center relative overflow-hidden group transition-all duration-1000 ${
          theme === 'BONE' ? 'bg-white border border-slate-200 text-slate-900' : 'bg-indigo-600 text-white'
        }`}>
           <div className="relative z-10">
              <h5 className={`text-lg font-black tracking-tighter uppercase mb-8 ${theme === 'BONE' ? 'text-indigo-600' : 'text-indigo-100'}`}>Gnosis del Espejo</h5>
              <p className={`text-sm md:text-base font-serif italic leading-relaxed ${theme === 'BONE' ? 'text-slate-600' : 'text-white/90'}`}>
                "Speculum AI detecta una integridad sistémica del 100%. El reflejo de la verdad operativa es nítido y está alineado con la misión trascendental."
              </p>
           </div>
           <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000 ${
             theme === 'BONE' ? 'bg-indigo-50' : 'bg-white/10'
           }`}></div>
        </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 10px; }`}</style>
    </div>
  );
};

export default Dashboard;
