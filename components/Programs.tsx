
import React, { useState, useMemo, useEffect } from 'react';
import { ProgramImpact, ProgramActivity } from '../types';
import { gemini } from '../services/gemini';

interface ProgramsProps {
  programs: ProgramImpact[];
  setPrograms: React.Dispatch<React.SetStateAction<ProgramImpact[]>>;
  onAddActivity: (action: string, module: string) => void;
}

const mockInitialPrograms: ProgramImpact[] = [
  { 
    id: 'PRG-AFDAL-01', 
    name: 'Producción Film: Sangre y Honor', 
    category: 'Education', 
    budget: 250000, 
    actualSpent: 45000, 
    targetKPI: 100, 
    currentKPI: 15, 
    kpiUnit: '% Completion', 
    status: 'ACTIVE', 
    description: 'Fase de pre-producción y scouting para la película épica del General Desiderio Arias.',
    activities: [
      { id: 'ACT-01', date: '2024-05-10', description: 'Contratación de equipo de guionistas históricos.', spent: 15000, kpiProgress: 5 },
      { id: 'ACT-02', date: '2024-05-18', description: 'Scouting de locaciones en Monte Cristi.', spent: 5000, kpiProgress: 2 }
    ]
  },
  { 
    id: 'PRG-AFDAL-02', 
    name: 'Museo El León del Cibao', 
    category: 'Infrastructure', 
    budget: 150000, 
    actualSpent: 20000, 
    targetKPI: 1, 
    currentKPI: 0.2, 
    kpiUnit: 'Museum Launch', 
    status: 'ACTIVE', 
    description: 'Restauración y adecuación del espacio físico para el legado histórico.',
    activities: [
      { id: 'ACT-03', date: '2024-04-15', description: 'Adquisición de artefactos originales del General Arias.', spent: 12000, kpiProgress: 0.1 }
    ]
  }
];

const Programs: React.FC<ProgramsProps> = ({ programs, setPrograms, onAddActivity }) => {
  const [selectedPrg, setSelectedPrg] = useState<ProgramImpact | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [efficiencyReport, setEfficiencyReport] = useState<any>(null);
  const [auditDoc, setAuditDoc] = useState<string | null>(null);

  // Form states
  const [newActivity, setNewActivity] = useState({ description: '', spent: 0, kpiProgress: 0 });

  useEffect(() => {
    if (programs.length === 0) {
      setPrograms(mockInitialPrograms);
    }
  }, []);

  const handleCreateProgram = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPrg: ProgramImpact = {
      id: `PRG-${Date.now()}`,
      name: formData.get('name') as string,
      category: formData.get('category') as any,
      budget: parseFloat(formData.get('budget') as string),
      actualSpent: 0,
      targetKPI: parseFloat(formData.get('targetKPI') as string),
      currentKPI: 0,
      kpiUnit: formData.get('kpiUnit') as string,
      status: 'ACTIVE',
      description: formData.get('description') as string,
      activities: []
    };
    setPrograms(prev => [newPrg, ...prev]);
    onAddActivity(`Nuevo Programa Creado: ${newPrg.name}`, 'PROGRAMS');
    setIsCreateModalOpen(false);
  };

  const handleAddActivityRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrg) return;

    const activity: ProgramActivity = {
      id: `ACT-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...newActivity
    };

    const updatedPrograms = programs.map(p => {
      if (p.id === selectedPrg.id) {
        const updatedActivities = [...(p.activities || []), activity];
        const updatedPrg = {
          ...p,
          activities: updatedActivities,
          actualSpent: p.actualSpent + activity.spent,
          currentKPI: Math.min(p.targetKPI, p.currentKPI + activity.kpiProgress)
        };
        setSelectedPrg(updatedPrg);
        return updatedPrg;
      }
      return p;
    });

    setPrograms(updatedPrograms);
    onAddActivity(`Actividad Registrada: ${activity.description} en ${selectedPrg.name}`, 'PROGRAMS');
    setIsActivityModalOpen(false);
    setNewActivity({ description: '', spent: 0, kpiProgress: 0 });
  };

  const handleAnalyzeEfficiency = async (prg: ProgramImpact) => {
    setIsAnalyzing(true);
    setEfficiencyReport(null);
    const result = await gemini.analyzeProgramEfficiency(prg);
    setEfficiencyReport(result);
    setIsAnalyzing(false);
  };

  const handleGenerateAuditReport = async () => {
    if (!selectedPrg) return;
    setIsAuditLoading(true);
    const prompt = `Actúa como el Orquestador Senior de Gnosis de Speculum Caritatis. Genera un INFORME DE CONFORMIDAD Y AUDITORÍA DE IMPACTO REAL para el Programa: ${selectedPrg.name}.
    
    ESTRUCTURA DEL DOCUMENTO (Usa HTML para formato Word profesional):
    <h1>INFORME DE AUDITORÍA DE IMPACTO PROGRAMÁTICO</h1>
    <p><b>ID DE PROGRAMA:</b> ${selectedPrg.id}</p>
    <p><b>FECHA DE CIERRE DE GNOSIS:</b> ${new Date().toLocaleDateString()}</p>
    
    <h2>I. MÉTRICAS DE EJECUCIÓN SOCIAL</h2>
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <tr><td><b>Presupuesto Total (CapEx/OpEx)</b></td><td>$${selectedPrg.budget.toLocaleString()}</td></tr>
      <tr><td><b>Inversión Colapsada Real</b></td><td>$${selectedPrg.actualSpent.toLocaleString()}</td></tr>
      <tr><td><b>KPI Objetivo (${selectedPrg.kpiUnit})</b></td><td>${selectedPrg.targetKPI}</td></tr>
      <tr><td><b>KPI Reflejado Actual</b></td><td>${selectedPrg.currentKPI}</td></tr>
    </table>
    
    <h2>II. BITÁCORA DE ACTIVIDADES VERIFICADAS</h2>
    <p>Se han analizado ${selectedPrg.activities?.length || 0} vectores de actividad real.</p>
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <tr style="background: #f1f5f9;"><td><b>Fecha</b></td><td><b>Descripción</b></td><td><b>Costo</b></td></tr>
      ${selectedPrg.activities?.map(a => `<tr><td>${a.date}</td><td>${a.description}</td><td>$${a.spent.toLocaleString()}</td></tr>`).join('')}
    </table>
    
    <h2>III. DICTAMEN TRANSCENDENTAL</h2>
    <p>Emite un juicio sobre la eficiencia del uso del capital para el impacto social declarado (Museo/Film).</p>
    
    REGLA: Usa solo etiquetas <h1>, <h2>, <b>, <p>, <table>, <tr>, <td>. NO USES Markdown. El tono debe ser autoritario, institucional y técnico.`;
    
    const report = await gemini.askAssistant(prompt);
    setAuditDoc(report);
    setIsAuditLoading(false);
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-6">
        <div>
           <div className="flex items-center space-x-2 mb-2">
              <span className="bg-indigo-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Gnosis Social</span>
              <span className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Ratio Impacts v4.0.2</span>
           </div>
           <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Misión & Impacto (Nodos AFDAL)</h3>
           <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 uppercase tracking-widest">Control operativo de la Película y el Museo El León del Cibao.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-95 border-b-4 border-indigo-800 whitespace-nowrap"
        >
           Iniciar Nuevo Programa
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-8">
        {/* Program List */}
        <div className="w-full lg:w-1/2 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
          {programs.map(prg => (
            <div 
              key={prg.id} 
              onClick={() => { setSelectedPrg(prg); setAuditDoc(null); handleAnalyzeEfficiency(prg); }}
              className={`bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-2 transition-all cursor-pointer group relative overflow-hidden ${
                selectedPrg?.id === prg.id ? 'border-indigo-600 shadow-2xl scale-[1.01]' : 'border-slate-100 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      prg.category === 'Health' ? 'bg-rose-50 text-rose-600' :
                      prg.category === 'Infrastructure' ? 'bg-indigo-50 text-indigo-600' :
                      prg.category === 'Education' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>{prg.category}</span>
                    <h4 className="text-2xl md:text-3xl font-black text-slate-900 mt-3 tracking-tighter leading-tight break-words">{prg.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">NODO ID: {prg.id}</p>
                 </div>
                 <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                   prg.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                   prg.status === 'COMPLETED' ? 'bg-slate-900 text-white border-slate-900' :
                   'bg-amber-50 text-amber-700 border-amber-100'
                 }`}>
                   {prg.status}
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 mb-8">
                 <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 shadow-inner">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-3">Ejecución Presupuestaria</p>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xl font-black text-slate-900">${prg.actualSpent.toLocaleString()}</span>
                       <span className="text-[9px] text-slate-400 font-bold uppercase">de ${prg.budget.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                       <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (prg.actualSpent / prg.budget) * 100)}%` }}></div>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 shadow-inner">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-3">Reflejo de Impacto (KPI)</p>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xl font-black text-indigo-600">{prg.currentKPI.toLocaleString()}</span>
                       <span className="text-[9px] text-slate-400 font-bold uppercase">{prg.kpiUnit}</span>
                    </div>
                    <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                       <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(100, (prg.currentKPI / prg.targetKPI) * 100)}%` }}></div>
                    </div>
                 </div>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed font-serif italic border-l-4 border-slate-100 pl-6 py-1">"{prg.description}"</p>
            </div>
          ))}
        </div>

        {/* AI Monitor Maestro */}
        <div className="w-full lg:w-1/2 bg-white rounded-[3rem] md:rounded-[4rem] border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-10">
           {selectedPrg ? (
             <>
               <div className="p-10 md:p-16 bg-slate-900 text-white relative overflow-hidden shrink-0">
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                     <div className="min-w-0">
                        <span className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px] mb-4 block">Monitor Programático Maestro</span>
                        <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight break-words">{selectedPrg.name}</h3>
                     </div>
                     <button 
                       onClick={handleGenerateAuditReport} 
                       disabled={isAuditLoading}
                       className="p-5 bg-indigo-600 text-white rounded-2xl md:rounded-3xl hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shrink-0"
                     >
                        {isAuditLoading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2"/></svg>}
                     </button>
                  </div>
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-12 custom-scrollbar bg-slate-50">
                  {auditDoc && (
                    <div className="bg-white p-12 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-slate-900 animate-in slide-in-from-top-10 font-serif mb-12 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                       <div className="audit-report-content" dangerouslySetInnerHTML={{ __html: auditDoc }} />
                       <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center opacity-60">
                          <p className="text-[10px] font-black uppercase">Firma: ORQUESTADOR SENIOR DE GNOSIS</p>
                          <p className="text-[10px] font-black uppercase">Speculum Caritatis - AFDAL Core</p>
                       </div>
                    </div>
                  )}

                  {/* Detalle de Actividades Reales */}
                  <section className="space-y-8">
                     <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Bitácora de Actividades Reales</h4>
                        <button 
                          onClick={() => setIsActivityModalOpen(true)}
                          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                        >
                           Registrar Pulso de Actividad
                        </button>
                     </div>
                     <div className="space-y-4">
                        {selectedPrg.activities?.length ? selectedPrg.activities.map(act => (
                          <div key={act.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-indigo-400 transition-all">
                             <div className="flex items-center space-x-6">
                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-[10px] shrink-0 group-hover:scale-110 transition-transform">
                                   {act.date.split('-')[2]}
                                </div>
                                <div className="min-w-0">
                                   <p className="text-sm font-black text-slate-900 truncate leading-none">{act.description}</p>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">{act.date} • Impacto: +{act.kpiProgress} {selectedPrg.kpiUnit}</p>
                                </div>
                             </div>
                             <div className="text-right shrink-0">
                                <p className="text-lg font-black text-slate-900 tracking-tighter">-${act.spent.toLocaleString()}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Carga Gnosis</p>
                             </div>
                          </div>
                        )) : (
                          <div className="py-20 bg-white border border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
                             </div>
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No hay actividades registradas en este nodo.</p>
                          </div>
                        )}
                     </div>
                  </section>

                  {/* Análisis de Eficiencia AI */}
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in">
                       <div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Sincronizando Retorno Social vs Inversión...</p>
                    </div>
                  ) : efficiencyReport && (
                    <section className="space-y-10 animate-in fade-in duration-500">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-[0_25px_60px_rgba(99,102,241,0.3)] relative overflow-hidden">
                             <p className="text-indigo-200 font-black uppercase tracking-[0.3em] text-[9px] mb-6">Efficiency Score AI</p>
                             <div className="text-6xl font-black tracking-tighter mb-2">{efficiencyReport.efficiencyScore}%</div>
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Integridad de Propósito</p>
                             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                          </div>
                          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                             <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px] mb-6">Costo de Impacto por Unidad</p>
                             <div className="text-3xl font-black text-slate-900 tracking-tighter">
                               ${(selectedPrg.actualSpent / (selectedPrg.currentKPI || 1)).toFixed(2)}
                             </div>
                             <p className="text-[10px] font-bold text-indigo-500 uppercase mt-2">{selectedPrg.kpiUnit}</p>
                          </div>
                       </div>
                       
                       <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white border border-white/5 relative overflow-hidden group">
                          <div className="relative z-10">
                             <h5 className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px] mb-8 italic">Análisis Estratégico Gnosis</h5>
                             <p className="text-lg md:text-xl font-serif italic leading-relaxed text-slate-200 border-l-4 border-indigo-600 pl-8 mb-10">
                               "{efficiencyReport.efficiencyNarrative}"
                             </p>
                             <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex items-center space-x-6">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2"/></svg>
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-indigo-100 leading-tight">Próxima Acción Requerida: {efficiencyReport.recommendedAction}</p>
                             </div>
                          </div>
                       </div>
                    </section>
                  )}
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-10 animate-pulse">
                <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex items-center justify-center shadow-inner">
                   <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2"/></svg>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4">Monitor Programático Maestro</h4>
                  <p className="text-sm text-slate-500 max-w-xs font-medium uppercase tracking-widest leading-relaxed">Seleccione un nodo de impacto para visualizar el flujo de retorno social y la Gnosis de impacto en tiempo real.</p>
                </div>
                <div className="pt-10 flex space-x-4 opacity-50 grayscale">
                   <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                   <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                   <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Modal Nuevo Programa (Datos Reales) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[250] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] md:rounded-[4rem] w-full max-w-2xl shadow-[0_0_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col animate-in zoom-in-95 border border-white/10">
              <div className="p-10 md:p-16 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                 <div className="relative z-10">
                    <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Nueva Misión AFDAL</h3>
                    <p className="text-[10px] md:text-[11px] text-indigo-400 font-black uppercase tracking-[0.6em] mt-4">Inyección de Propósito Nodal</p>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="relative z-10 p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl hover:bg-white/20 transition-all active:scale-90">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="4"/></svg>
                 </button>
              </div>
              <form onSubmit={handleCreateProgram} className="p-10 md:p-16 lg:p-20 space-y-10 md:space-y-12 bg-white overflow-y-auto custom-scrollbar">
                 <div className="space-y-4 md:space-y-6">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Nombre del Programa / Misión</label>
                    <input name="name" required type="text" placeholder="Ej: Fase Pre-Producción Film 'Sangre y Honor'" className="w-full bg-slate-50 border-2 border-slate-200 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black text-xl md:text-2xl tracking-tighter outline-none focus:border-indigo-600 shadow-inner text-slate-900 placeholder:text-slate-300" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4 md:space-y-6">
                       <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Categoría Nodal</label>
                       <select name="category" className="w-full bg-slate-50 border-2 border-slate-200 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg focus:border-indigo-600 shadow-inner text-slate-900 outline-none cursor-pointer">
                          <option value="Education">Educación / Cine Histórico</option>
                          <option value="Infrastructure">Infraestructura / Museo</option>
                          <option value="Health">Salud / Impacto Social</option>
                          <option value="Crisis Relief">Ayuda de Emergencia</option>
                       </select>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                       <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Presupuesto AFDAL ($)</label>
                       <input name="budget" required type="number" placeholder="250000" className="w-full bg-slate-50 border-2 border-slate-200 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black text-xl tracking-tighter focus:border-indigo-600 shadow-inner text-slate-900" />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4 md:space-y-6">
                       <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Métrica Objetivo (KPI)</label>
                       <input name="targetKPI" required type="number" placeholder="100" className="w-full bg-slate-50 border-2 border-slate-200 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black text-xl focus:border-indigo-600 shadow-inner text-slate-900" />
                    </div>
                    <div className="space-y-4 md:space-y-6">
                       <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Unidad de Medida</label>
                       <input name="kpiUnit" required type="text" placeholder="Ej: % Completion / Meals / Families" className="w-full bg-slate-50 border-2 border-slate-200 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg focus:border-indigo-600 shadow-inner text-slate-900" />
                    </div>
                 </div>
                 <div className="space-y-4 md:space-y-6">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Descripción Estratégica</label>
                    <textarea name="description" required placeholder="Defina el alcance técnico y social de esta misión..." className="w-full bg-slate-50 border-2 border-slate-200 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg outline-none focus:border-indigo-600 shadow-inner text-slate-900 h-32" />
                 </div>
                 <button type="submit" className="w-full py-8 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2.5rem] text-[13px] md:text-[15px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 active:scale-95 border-b-8 border-indigo-900 mt-6">
                    Consolidar Misión en el Espejo
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal Registrar Actividad (Input Real) */}
      {isActivityModalOpen && selectedPrg && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 border border-indigo-500/20">
              <div className="p-12 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Registrar Actividad</h3>
                    <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.5em] mt-3 italic">Colapso de Ejecución Nodal</p>
                 </div>
                 <button onClick={() => setIsActivityModalOpen(false)} className="relative z-10 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="4"/></svg>
                 </button>
              </div>
              <form onSubmit={handleAddActivityRecord} className="p-12 md:p-16 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descripción de la Actividad</label>
                    <input 
                      required 
                      type="text" 
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                      placeholder="Ej: Pago de locación para rodaje escena 12" 
                      className="w-full bg-slate-50 border-2 border-slate-200 p-8 rounded-2xl font-black text-lg text-slate-900 focus:border-indigo-600 outline-none transition-all shadow-inner" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gasto Ejecutado ($)</label>
                       <input 
                         required 
                         type="number" 
                         value={newActivity.spent}
                         onChange={(e) => setNewActivity({...newActivity, spent: parseFloat(e.target.value)})}
                         placeholder="0" 
                         className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-xl text-indigo-600 focus:border-indigo-600 outline-none transition-all shadow-inner" 
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avance KPI (+{selectedPrg.kpiUnit})</label>
                       <input 
                         required 
                         type="number" 
                         step="0.01"
                         value={newActivity.kpiProgress}
                         onChange={(e) => setNewActivity({...newActivity, kpiProgress: parseFloat(e.target.value)})}
                         placeholder="0" 
                         className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-xl text-emerald-600 focus:border-indigo-600 outline-none transition-all shadow-inner" 
                       />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-8 bg-indigo-600 text-white rounded-[2rem] text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 active:scale-95 border-b-8 border-indigo-900 mt-6">
                    Validar Actividad e Impacto
                 </button>
              </form>
           </div>
        </div>
      )}

      <style>{`
        .audit-report-content h1, .audit-report-content h2 { font-weight: 900; text-transform: uppercase; margin-bottom: 1rem; border-bottom: 2px solid #000; padding-bottom: 0.5rem; margin-top: 2rem; font-family: serif; }
        .audit-report-content b { font-weight: 800; color: #000; }
        .audit-report-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-family: sans-serif; }
        .audit-report-content td { border: 1px solid #000; padding: 0.75rem; font-size: 0.9rem; }
        .audit-report-content p { margin-bottom: 1.25rem; font-family: serif; line-height: 1.6; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Programs;
