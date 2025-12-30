
import React, { useState, useMemo, useEffect } from 'react';
import { ComplianceTask, ComplianceNotificationSetting } from '../types';
import { gemini } from '../services/gemini';

const initialTasks: ComplianceTask[] = [
  { id: 'C-03', state: 'FL', obligation: 'Solicitation of Contributions Registration', dueDate: '2023-10-15', status: 'OVERDUE' },
  { id: 'C-01', state: 'NY', obligation: 'Annual Filing CHAR500', dueDate: '2023-11-01', status: 'WARNING' },
  { id: 'C-05', state: 'FL', obligation: 'Quarterly Grant Report - Sector B', dueDate: '2023-11-10', status: 'COMPLIANT' },
  { id: 'C-04', state: 'NY', obligation: 'CHAR410 Re-registration', dueDate: '2023-12-05', status: 'COMPLIANT' },
  { id: 'C-02', state: 'NJ', obligation: 'CRI-200 Short Form', dueDate: '2023-12-18', status: 'COMPLIANT' },
];

const Compliance: React.FC = () => {
  const [tasks, setTasks] = useState<ComplianceTask[]>(initialTasks);
  const [searchingLaw, setSearchingLaw] = useState<string | null>(null);
  const [legalInfo, setLegalInfo] = useState<{text: string, links: any[]} | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  
  const [notifSettings, setNotifSettings] = useState<ComplianceNotificationSetting>(() => {
    const saved = localStorage.getItem('ratio_compliance_config');
    return saved ? JSON.parse(saved) : {
      emailEnabled: true,
      dashboardEnabled: true,
      smsEnabled: false,
      alertThresholds: [30, 60, 90] // [Critical, Warning, Info]
    };
  });

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const due = new Date(dateStr);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const alertData = useMemo(() => {
    const activeAlerts: any[] = [];
    const processedTasks = tasks.map(task => {
      const daysLeft = getDaysUntil(task.dueDate);
      let alertLevel: 'NONE' | 'INFO' | 'WARNING' | 'CRITICAL' = 'NONE';
      
      const [crit, warn, info] = notifSettings.alertThresholds;
      
      if (task.status === 'COMPLIANT') {
        alertLevel = 'NONE';
      } else if (daysLeft <= 0) {
        alertLevel = 'CRITICAL';
      } else if (daysLeft <= crit) {
        alertLevel = 'CRITICAL';
      } else if (daysLeft <= warn) {
        alertLevel = 'WARNING';
      } else if (daysLeft <= info) {
        alertLevel = 'INFO';
      }

      if (alertLevel !== 'NONE' && task.status !== 'COMPLIANT') {
        activeAlerts.push({ id: task.id, obligation: task.obligation, level: alertLevel });
      }
      
      return { ...task, daysLeft, alertLevel };
    }).sort((a, b) => a.daysLeft - b.daysLeft);

    return { tasks: processedTasks, activeAlerts };
  }, [tasks, notifSettings]);

  const handleConsolidateConfig = () => {
    setIsSavingConfig(true);
    setTimeout(() => {
      localStorage.setItem('ratio_compliance_config', JSON.stringify(notifSettings));
      setIsSavingConfig(false);
      setIsConfigOpen(false);
    }, 1200);
  };

  const handleUpdateThreshold = (index: number, val: number) => {
    const newThresholds = [...notifSettings.alertThresholds];
    newThresholds[index] = val;
    setNotifSettings(prev => ({ ...prev, alertThresholds: newThresholds }));
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTask: ComplianceTask = {
      id: `C-0${tasks.length + 1}`,
      state: formData.get('state') as any,
      obligation: formData.get('obligation') as string,
      dueDate: formData.get('dueDate') as string,
      status: 'WARNING'
    };
    setTasks(prev => [newTask, ...prev]);
    setIsAddModalOpen(false);
  };

  const fetchUpdates = async (state: string) => {
    setSearchingLaw(state);
    setIsSearching(true);
    const result = await gemini.searchLegalUpdates(state);
    setLegalInfo(result);
    setIsSearching(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 overflow-y-auto max-h-full pr-2 custom-scrollbar">
      
      {/* Header & Controls */}
      <div className="bg-slate-900 text-white rounded-[3.5rem] p-16 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden shadow-2xl border border-white/5">
        <div className="relative z-10">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2.5"/></svg>
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Regulación & Compliance</h3>
              <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.5em] mt-3">Ratio Integrity Engine v4.0</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-10 relative z-10 mt-10 lg:mt-0">
          <div className="text-right">
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Alertas Activas</p>
            <div className="flex items-center space-x-4">
              <span className={`text-5xl font-black ${alertData.activeAlerts.length > 0 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`}>
                {alertData.activeAlerts.length}
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Monitoreo 24/7</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gnosis Active</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white text-slate-900 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
             >
                Nueva Obligación
             </button>
             <button 
                onClick={() => setIsConfigOpen(true)}
                className="p-5 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all shadow-xl active:scale-95 group backdrop-blur-2xl"
             >
                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5"/></svg>
             </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-64 -mt-64"></div>
      </div>

      {/* Main Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {alertData.tasks.map((task) => (
          <div key={task.id} className={`bg-white p-12 rounded-[3.5rem] border transition-all group relative overflow-hidden flex flex-col shadow-sm hover:shadow-2xl ${
            task.alertLevel === 'CRITICAL' ? 'border-rose-300 ring-4 ring-rose-500/5' : 'border-slate-100 hover:border-indigo-400'
          }`}>
             <div className="flex justify-between items-start mb-12">
                <div className="max-w-[70%]">
                  <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 block ${
                    task.alertLevel === 'CRITICAL' ? 'text-rose-500' : 'text-indigo-600'
                  }`}>Gnosis Obligatio</span>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors tracking-tighter">{task.obligation}</h4>
                  <div className="flex items-center space-x-3 mt-4">
                     <span className="text-[10px] font-black bg-slate-900 text-white px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">{task.state}</span>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{task.id}</span>
                  </div>
                </div>
                <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border ${
                  task.status === 'COMPLIANT' ? 'bg-green-50 text-green-700 border-green-100' :
                  task.status === 'OVERDUE' ? 'bg-rose-600 text-white border-rose-700' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {task.status}
                </div>
             </div>

             <div className="flex-1 flex flex-col justify-end space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Días</p>
                    <p className={`text-4xl font-black tracking-tighter ${task.daysLeft < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{task.daysLeft}d</p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner flex flex-col justify-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Status Vector</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      task.alertLevel === 'CRITICAL' ? 'text-rose-600 animate-pulse' :
                      task.alertLevel === 'WARNING' ? 'text-amber-600' :
                      task.alertLevel === 'INFO' ? 'text-indigo-600' : 'text-emerald-500'
                    }`}>
                      {task.alertLevel === 'NONE' ? 'OPTIMAL' : task.alertLevel}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => fetchUpdates(task.state)}
                  className="w-full py-5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-indigo-600 shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="3.5"/></svg>
                  <span>Legal Grounding</span>
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* AI Grounding Result View */}
      {legalInfo && (
        <div className="bg-white rounded-[4rem] border border-indigo-100 shadow-[0_40px_100px_rgba(99,102,241,0.15)] overflow-hidden animate-in slide-in-from-bottom-10 duration-700 relative">
          <div className="p-16">
            <div className="flex justify-between items-start mb-16">
              <div>
                <span className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-4 block italic">Executive Briefing / Search Grounding</span>
                <h4 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Análisis Normativo: {searchingLaw}</h4>
              </div>
              <button onClick={() => setLegalInfo(null)} className="p-6 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-[2rem] transition-all shadow-xl border border-slate-200">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="bg-slate-50/50 p-16 rounded-[3.5rem] border border-slate-100 prose prose-xl max-w-none text-slate-800 italic font-serif border-l-[12px] border-indigo-600">
              {legalInfo.text}
            </div>
          </div>
        </div>
      )}

      {/* Logic Config Modal (The Node you wanted to work) */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 border border-white/10 flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 p-16 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                 <div className="relative z-10">
                    <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Logic Config</h3>
                    <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.5em] mt-4">Thresholds & Notification Vectors</p>
                 </div>
                 <button onClick={() => setIsConfigOpen(false)} className="relative z-10 p-6 hover:bg-white/10 rounded-3xl transition-all text-white border border-white/10 active:scale-90">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="4"/></svg>
                 </button>
                 <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[80px] -mr-40 -mt-40"></div>
              </div>
              
              <div className="p-16 space-y-12 overflow-y-auto custom-scrollbar">
                 {/* UMBERALES SECTION */}
                 <div className="space-y-8">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] border-b-4 border-slate-50 pb-4">Umbrales de Gnosis (Días de Aviso)</h5>
                    <div className="grid grid-cols-3 gap-8">
                       {[
                         { label: 'Crítico', idx: 0, col: 'text-rose-600', bg: 'bg-rose-50' },
                         { label: 'Advertencia', idx: 1, col: 'text-amber-600', bg: 'bg-amber-50' },
                         { label: 'Informativo', idx: 2, col: 'text-indigo-600', bg: 'bg-indigo-50' }
                       ].map(thr => (
                         <div key={thr.label} className={`p-8 rounded-[2.5rem] border-2 border-slate-100 flex flex-col items-center space-y-4 ${thr.bg}`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${thr.col}`}>{thr.label}</span>
                            <input 
                              type="number" 
                              value={notifSettings.alertThresholds[thr.idx]}
                              onChange={(e) => handleUpdateThreshold(thr.idx, parseInt(e.target.value) || 0)}
                              className="w-full text-center bg-white border-2 border-slate-200 p-4 rounded-2xl font-black text-2xl text-slate-900 focus:border-indigo-500 outline-none transition-all"
                            />
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Días restantes</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* CANALES SECTION */}
                 <div className="space-y-8">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] border-b-4 border-slate-50 pb-4">Canales de Propagación</h5>
                    <div className="grid grid-cols-3 gap-8">
                       {[
                         { label: 'Email', key: 'emailEnabled', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                         { label: 'Push', key: 'dashboardEnabled', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
                         { label: 'Mobile', key: 'smsEnabled', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' }
                       ].map(channel => (
                         <button 
                            key={channel.key}
                            onClick={() => setNotifSettings(prev => ({ ...prev, [channel.key]: !prev[channel.key] }))}
                            className={`p-10 rounded-[3rem] border-4 flex flex-col items-center justify-center transition-all group ${
                              notifSettings[channel.key as keyof ComplianceNotificationSetting] 
                              ? 'border-indigo-600 bg-indigo-50 shadow-xl scale-105' 
                              : 'border-slate-50 text-slate-300 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 hover:border-slate-200'
                            }`}
                         >
                            <svg className={`w-10 h-10 mb-6 ${notifSettings[channel.key as keyof ComplianceNotificationSetting] ? 'text-indigo-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d={channel.icon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{channel.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <button 
                    onClick={handleConsolidateConfig}
                    disabled={isSavingConfig}
                    className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] text-[15px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 border-b-8 border-indigo-900 flex items-center justify-center space-x-4 disabled:opacity-50"
                 >
                    {isSavingConfig ? (
                       <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                       <>
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                         <span>Consolidar Configuración</span>
                       </>
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Other Modals (Add, Search) omitted for brevity as they weren't changed */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[250] flex items-center justify-center p-8">
           <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
              <div className="p-16 bg-slate-900 text-white flex justify-between items-center shrink-0">
                 <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Nueva Obligación</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/20"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="4"/></svg></button>
              </div>
              <form onSubmit={handleAddTask} className="p-20 space-y-12">
                 <div className="space-y-6">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Título de la Obligación</label>
                    <input name="obligation" required type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-8 rounded-[2rem] font-black text-2xl focus:border-indigo-600 outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Estado</label>
                       <select name="state" className="w-full bg-slate-50 border-2 border-slate-100 p-8 rounded-[2rem] font-black text-xl outline-none">
                          <option value="NY">NY</option><option value="NJ">NJ</option><option value="FL">FL</option>
                       </select>
                    </div>
                    <div className="space-y-6">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Fecha Límite</label>
                       <input name="dueDate" required type="date" className="w-full bg-slate-50 border-2 border-slate-100 p-8 rounded-[2rem] font-black text-xl outline-none" />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-[15px] border-b-8 border-indigo-900 shadow-2xl">Registrar en el Espejo</button>
              </form>
           </div>
        </div>
      )}

      {isSearching && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[400] flex items-center justify-center p-8">
          <div className="bg-slate-900 text-white p-20 rounded-[4rem] shadow-2xl flex flex-col items-center space-y-10 max-w-xl text-center">
            <div className="w-24 h-24 border-[8px] border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-4xl font-black tracking-tighter uppercase">Sincronizando Gnosis Jurídica</p>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default Compliance;
