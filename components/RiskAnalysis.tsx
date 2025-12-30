
import React, { useState, useMemo } from 'react';
import { RiskAnomaly } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { gemini } from '../services/gemini';

const initialAnomalies: RiskAnomaly[] = [
  { id: 'AN-001', type: 'Financial', severity: 'Medium', description: 'Gasto duplicado detectado en "Office Supplies" en el Hub de NJ.', detectedAt: '2024-05-18', status: 'Investigating' },
  { id: 'AN-002', type: 'Compliance', severity: 'Critical', description: 'Faltan firmas en documentación de Restricted Grant para el Proyecto X.', detectedAt: '2024-05-17', status: 'Open' },
  { id: 'AN-003', type: 'Fraud', severity: 'High', description: 'Intento de acceso inusual desde IP 192.168.1.105 (Ubicación no autorizada).', detectedAt: '2024-05-18', status: 'Open' },
];

interface RiskAnalysisProps {
  anomalies: RiskAnomaly[];
  onAddAnomaly: (a: RiskAnomaly) => void;
  onUpdateAnomaly: (a: RiskAnomaly) => void;
  onAddActivity: (action: string, module: string) => void;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ anomalies, onAddAnomaly, onUpdateAnomaly, onAddActivity }) => {
  // const [anomalies, setAnomalies] = useState<RiskAnomaly[]>(initialAnomalies); // REMOVED
  const [selectedAnomaly, setSelectedAnomaly] = useState<RiskAnomaly | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [riskScore, setRiskScore] = useState(82);

  const exposureData = useMemo(() => {
    const active = anomalies.filter(a => a.status !== 'Resolved');
    const counts = { Financial: 0, Compliance: 0, Operational: 0, Fraud: 0 };
    active.forEach(a => {
      if (counts.hasOwnProperty(a.type)) counts[a.type as keyof typeof counts]++;
    });

    return [
      { name: 'Financial', value: counts.Financial || 1, color: '#6366f1' },
      { name: 'Compliance', value: counts.Compliance || 1, color: '#f59e0b' },
      { name: 'Operational', value: counts.Operational || 1, color: '#10b981' },
      { name: 'Security/Fraud', value: counts.Fraud || 1, color: '#ef4444' },
    ];
  }, [anomalies]);

  const handleResolve = (id: string) => {
    const anomaly = anomalies.find(a => a.id === id);
    if (anomaly) {
      onUpdateAnomaly({ ...anomaly, status: 'Resolved' });
      onAddActivity(`Anomalía Mitigada: ${id}`, 'RISK');
    }
    setRiskScore(prev => Math.min(100, prev + 2));
    setSelectedAnomaly(null);
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    // Simulación de análisis de datos del sistema por IA
    const dataToAnalyze = JSON.stringify(anomalies);
    const aiAnalysis = await gemini.analyzeRisk(dataToAnalyze);
    console.log("AI Analysis Pulse:", aiAnalysis);

    setTimeout(() => {
      setIsScanning(false);
      setRiskScore(79); // Simulación de hallazgo de nuevas sutilezas
      const newAnomaly: RiskAnomaly = {
        id: `AN-00${anomalies.length + 1}`,
        type: 'Operational',
        severity: 'Medium',
        description: 'Desincronización detectada entre bitácora de campo y registros de impacto NY.',
        detectedAt: new Date().toISOString().split('T')[0],
        status: 'Open'
      };
      onAddAnomaly(newAnomaly); // Use prop
      onAddActivity('Hallazgo AI en Deep-Scan', 'RISK');
    }, 3000);
  };

  const handleManualReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAnomaly: RiskAnomaly = {
      id: `AN-MAN-${Math.floor(Math.random() * 1000)}`,
      type: formData.get('type') as any,
      severity: formData.get('severity') as any,
      description: formData.get('description') as string,
      detectedAt: new Date().toISOString().split('T')[0],
      status: 'Open'
    };
    onAddAnomaly(newAnomaly);
    onAddActivity(`Reporte Manual de Amenaza: ${newAnomaly.id}`, 'RISK');
    setRiskScore(prev => Math.max(0, prev - 5));
    setIsReporting(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 overflow-y-auto h-full pr-2 custom-scrollbar">

      {/* Risk Command Center Header */}
      <div className="bg-slate-900 text-white p-14 rounded-[3.5rem] relative overflow-hidden shadow-2xl border border-slate-800 shrink-0">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(225,29,72,0.4)] animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2.5" /></svg>
            </div>
            <div>
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">Gnosis de Riesgo</h2>
              <p className="text-xs text-rose-400 font-black uppercase tracking-[0.5em] mt-3">Sentinel Security Protocol v9.1</p>
            </div>
          </div>
          <div className="flex space-x-6 mt-10 lg:mt-0">
            <button
              onClick={() => setIsReporting(true)}
              className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-rose-50 transition-all active:scale-95 border-b-4 border-slate-200"
            >
              Reportar Vulnerabilidad
            </button>
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="px-10 py-5 bg-rose-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-rose-700 transition-all active:scale-95 flex items-center space-x-4 border-b-4 border-rose-900"
            >
              {isScanning ? <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="3" /></svg>
                  <span>Iniciar Auditoría Deep-Scan</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Risk Score Gauge */}
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
            <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${100 - riskScore}%` }}></div>
          </div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Aeterna Risk Score</h4>
          <div className="relative w-64 h-64 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="110" stroke="#f1f5f9" strokeWidth="20" fill="transparent" />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke={riskScore > 80 ? "#10b981" : riskScore > 60 ? "#f59e0b" : "#ef4444"}
                strokeWidth="20"
                fill="transparent"
                strokeDasharray="691"
                strokeDashoffset={691 - (691 * riskScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 drop-shadow-[0_0_12px_rgba(0,0,0,0.1)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-7xl font-black text-slate-900 tracking-tighter">{riskScore}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${riskScore > 80 ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}>
                {riskScore > 80 ? 'Healthy Zone' : 'Alert: Critical Gnosis'}
              </span>
            </div>
          </div>
          <div className="mt-12 space-y-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Audit Active • 452 Params</p>
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em] italic">Real-Time Synthesis Synchronized</p>
          </div>
        </div>

        {/* Exposure Breakdown */}
        <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.4em]">Risk Cluster Distribution</h4>
            <span className="bg-slate-900 text-white px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Global Spectrum</span>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={exposureData} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value">
                    {exposureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)', padding: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-1 gap-6 md:pl-16 mt-10 md:mt-0">
              {exposureData.map(item => (
                <div key={item.name} className="flex items-center justify-between group cursor-default p-4 hover:bg-slate-50 rounded-2xl transition-all">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-lg mr-5 shadow-lg" style={{ backgroundColor: item.color }}></div>
                    <span className="font-black text-slate-700 uppercase tracking-widest text-[11px]">{item.name}</span>
                  </div>
                  <span className="text-slate-950 font-black text-xl tracking-tighter">{(item.value / exposureData.reduce((a, b) => a + b.value, 0) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Active Vulnerability Queue */}
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-12 py-10 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-[0.2em]">Active Vulnerability Queue</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cola de Mitigación en Tiempo Real</p>
            </div>
            <span className="bg-rose-600 text-white text-[10px] font-black px-6 py-2 rounded-full shadow-lg border-b-4 border-rose-800 animate-bounce">
              {anomalies.filter(a => a.status !== 'Resolved').length} Open Threats
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                onClick={() => setSelectedAnomaly(anomaly)}
                className={`p-10 flex items-center justify-between group cursor-pointer transition-all border-l-[12px] ${selectedAnomaly?.id === anomaly.id ? 'bg-indigo-50 border-indigo-600' : 'hover:bg-slate-50 border-transparent'
                  } ${anomaly.status === 'Resolved' ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="flex items-center space-x-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:rotate-12 ${anomaly.severity === 'Critical' ? 'bg-rose-600 text-white' :
                      anomaly.severity === 'High' ? 'bg-amber-500 text-white' :
                        'bg-indigo-500 text-white'
                    }`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856" /></svg>
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-tight tracking-tighter">{anomaly.description}</p>
                    <div className="flex items-center space-x-6 mt-3">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{anomaly.detectedAt} • {anomaly.type} • {anomaly.id}</span>
                      <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${anomaly.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white'
                        }`}>{anomaly.status}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${anomaly.severity === 'Critical' ? 'text-rose-600' : 'text-slate-400'
                    }`}>{anomaly.severity}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Anomaly Mitigation Workflow */}
        <div className="bg-slate-900 text-white rounded-[3.5rem] p-16 shadow-2xl relative overflow-hidden flex flex-col min-h-[600px] border border-white/5">
          {selectedAnomaly ? (
            <div className="relative z-10 space-y-12 animate-in slide-in-from-right-10 duration-500 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-rose-400 font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">Mitigation Workspace</span>
                  <h3 className="text-5xl font-black tracking-tighter leading-none">Anomaly {selectedAnomaly.id}</h3>
                </div>
                <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-2xl ${selectedAnomaly.severity === 'Critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  }`}>
                  {selectedAnomaly.severity} Severity
                </div>
              </div>

              <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 italic text-lg text-slate-300 leading-relaxed font-serif border-l-[10px] border-rose-600">
                "Este incidente ha sido detectado por el módulo AI Auditor tras identificar un patrón de {selectedAnomaly.type.toLowerCase()} atípico. Se requiere verificación humana inmediata para cerrar la brecha de integridad operacional y restaurar la Gnosis del sistema."
              </div>

              <div className="space-y-10 mt-auto">
                <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] border-b border-white/10 pb-4">Protocolo de Resolución Agéntica</h5>
                <div className="grid grid-cols-2 gap-6">
                  <button className="py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center space-x-3 group">
                    <svg className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2.5" /></svg>
                    <span>Ver Logs Crudos</span>
                  </button>
                  <button className="py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center space-x-3 group">
                    <svg className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 20v-6M6 20V10M18 20V4" strokeWidth="2.5" /></svg>
                    <span>Reportar al Board</span>
                  </button>
                </div>
                <button
                  onClick={() => handleResolve(selectedAnomaly.id)}
                  disabled={selectedAnomaly.status === 'Resolved'}
                  className={`w-full py-8 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 border-b-8 ${selectedAnomaly.status === 'Resolved' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-900 opacity-50' : 'bg-rose-600 text-white hover:bg-rose-700 border-rose-900'
                    }`}
                >
                  {selectedAnomaly.status === 'Resolved' ? 'Vulnerabilidad Mitigada' : 'Marcar como Mitigado (Audit Ready)'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30 animate-pulse">
              <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/10">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2.5" /></svg>
              </div>
              <h4 className="text-2xl font-black uppercase tracking-[0.4em] text-white">Resolver Gnosis</h4>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-6">Seleccione una anomalía para iniciar flujo de resolución normativa.</p>
            </div>
          )}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[100px] -mr-64 -mt-64"></div>
        </div>
      </div>

      {/* Manual Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-10 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-[0_0_120px_rgba(225,29,72,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 border border-white/10">
            <div className="p-16 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Inyectar Amenaza</h3>
                <p className="text-[11px] text-rose-400 font-black uppercase tracking-[0.5em] mt-4">Manual Vulnerability Entry</p>
              </div>
              <button onClick={() => setIsReporting(false)} className="relative z-10 p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/20 transition-all active:scale-90 shadow-2xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="4" /></svg>
              </button>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[100px] -mr-64 -mt-64"></div>
            </div>
            <form onSubmit={handleManualReport} className="p-20 space-y-12">
              <div className="space-y-6">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Descripción del Riesgo / Hallazgo</label>
                <textarea name="description" required placeholder="Describa la anomalía detectada en el flujo operativo..." className="w-full bg-slate-50 border-2 border-slate-100 p-8 rounded-[2.5rem] font-black text-xl tracking-tighter focus:border-rose-600 outline-none transition-all h-40 shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Clúster de Riesgo</label>
                  <select name="type" className="w-full bg-slate-50 border-2 border-slate-100 p-8 rounded-[2rem] font-black text-xl focus:border-rose-600 outline-none transition-all shadow-inner cursor-pointer">
                    <option value="Financial">Financial</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Operational">Operational</option>
                  </select>
                </div>
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Nivel de Criticidad</label>
                  <select name="severity" className="w-full bg-slate-50 border-2 border-slate-100 p-8 rounded-[2rem] font-black text-xl focus:border-rose-600 outline-none transition-all shadow-inner cursor-pointer">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-8 bg-rose-600 text-white rounded-[2.5rem] text-[15px] font-black uppercase tracking-[0.4em] shadow-[0_40px_80px_rgba(225,29,72,0.4)] hover:bg-rose-700 transition-all active:scale-95 border-b-8 border-rose-900"
              >
                Consolidar en Queue
              </button>
            </form>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[400] flex items-center justify-center p-8">
          <div className="bg-slate-900 text-white p-24 rounded-[5rem] shadow-[0_0_120px_rgba(225,29,72,0.5)] flex flex-col items-center space-y-12 max-w-2xl text-center border border-white/10 animate-in zoom-in-95">
            <div className="w-32 h-32 border-[12px] border-rose-500 border-t-transparent rounded-full animate-spin shadow-[0_0_80px_rgba(225,29,72,0.8)]"></div>
            <div>
              <p className="text-5xl font-black tracking-tighter uppercase mb-6">Deep-Scan Agéntico</p>
              <p className="text-sm text-rose-400 font-black uppercase tracking-[0.8em] italic animate-pulse">Auditando Vectores de Gnosis en Tiempo Real...</p>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 w-1/2 animate-[progress_3s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
        @keyframes progress {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default RiskAnalysis;
