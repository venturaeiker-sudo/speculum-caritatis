
import React, { useState, useMemo } from 'react';
import { Donor } from '../types';
import { gemini } from '../services/gemini';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DonorCRMProps {
  donors: Donor[];
  setDonors: React.Dispatch<React.SetStateAction<Donor[]>>;
  onAddActivity: (action: string, module: string) => void;
}

const mockLtvHistory = [
  { month: 'Ene', value: 10000 },
  { month: 'Feb', value: 12000 },
  { month: 'Mar', value: 18000 },
  { month: 'Abr', value: 15000 },
  { month: 'May', value: 25000 },
];

const DonorCRM: React.FC<DonorCRMProps> = ({ donors, setDonors, onAddActivity }) => {
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [taxCertificate, setTaxCertificate] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDonors = useMemo(() => {
    if (filterType === 'All') return donors;
    return donors.filter(d => d.type === filterType);
  }, [donors, filterType]);

  const handleSelectDonor = async (donor: Donor) => {
    setSelectedDonor(donor);
    setIsAnalyzing(true);
    setAiInsights(null);
    setTaxCertificate(null);
    const insights = await gemini.getDonorInsights(donor);
    setAiInsights(insights);
    setIsAnalyzing(false);
  };

  const handleGenerateCertificate = async () => {
    if (!selectedDonor) return;
    setIsGeneratingCertificate(true);
    const cert = await gemini.generateTaxCertificate(selectedDonor);
    setTaxCertificate(cert);
    setIsGeneratingCertificate(false);
    onAddActivity(`Certificado 501(c)(3) colapsado para: ${selectedDonor.name}`, 'DONORS');
  };

  const handleAddDonor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const name = formData.get('name') as string;
    
    const newDonor: Donor = {
      id: `D-${Date.now().toString().slice(-4)}`,
      name: name,
      type: formData.get('type') as any,
      category: formData.get('category') as any,
      totalDonated: amount,
      lastDonation: new Date().toISOString().split('T')[0],
      taxId: formData.get('taxId') as string,
      address: formData.get('address') as string,
      email: formData.get('email') as string,
    };
    
    setDonors(prev => [newDonor, ...prev]);
    onAddActivity(`Simbionte Registrado (Legal-Ready): ${name}`, 'DONORS');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex h-full gap-8 overflow-hidden animate-in fade-in duration-700">
      
      <div className={`flex flex-col space-y-8 overflow-hidden transition-all duration-500 ${selectedDonor ? 'w-1/2' : 'w-full'}`}>
        
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm shrink-0">
          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {['All', 'Corporate', 'Individual', 'Foundation'].map(t => (
              <button 
                key={t} 
                onClick={() => setFilterType(t)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterType === t ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center space-x-3"
          >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3"/></svg>
             <span>Registrar Simbionte</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
            {filteredDonors.map(donor => (
              <div 
                key={donor.id} 
                onClick={() => handleSelectDonor(donor)}
                className={`bg-white p-10 rounded-[3rem] border transition-all cursor-pointer group relative overflow-hidden ${
                  selectedDonor?.id === donor.id ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-2xl' : 'border-slate-200 hover:border-indigo-300 shadow-sm'
                }`}
              >
                <div className="absolute top-0 right-0 p-6">
                  <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border ${
                    donor.category === 'Platinum' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                    donor.category === 'Gold' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                    'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    {donor.category}
                  </span>
                </div>
                <div className="mb-10">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.4em] mb-2">{donor.type}</p>
                  <h5 className="font-black text-slate-900 text-2xl leading-none tracking-tighter group-hover:text-indigo-600 transition-colors">{donor.name}</h5>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Aportación Total</span>
                    <span className="font-black text-slate-900 text-2xl tracking-tighter">${donor.totalDonated.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDonor && (
        <div className="w-1/2 bg-white border border-slate-200 rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-700 relative">
          <div className="p-12 bg-slate-900 text-white relative">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-4 block">Gnosis del Simbionte</span>
                <h4 className="text-5xl font-black tracking-tighter leading-none">{selectedDonor.name}</h4>
              </div>
              <button onClick={() => setSelectedDonor(null)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-90">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="mt-8 flex space-x-4 relative z-10">
               <span className="px-5 py-2 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">{selectedDonor.category} Excellence</span>
               <span className="px-5 py-2 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">{selectedDonor.type} Entity</span>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
            {taxCertificate && (
              <div className="bg-emerald-50 p-10 rounded-[3rem] border-4 border-emerald-500/20 shadow-2xl animate-in zoom-in-95 font-serif text-slate-800 relative">
                 <div className="flex justify-between items-center mb-8 border-b-2 border-emerald-900/10 pb-4">
                    <h5 className="text-xl font-black uppercase tracking-tighter text-emerald-900">Certificado Oficial 501(c)(3)</h5>
                    <button onClick={() => setTaxCertificate(null)} className="text-emerald-900/40 hover:text-emerald-900"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button>
                 </div>
                 <div className="prose prose-sm max-w-none text-emerald-950 leading-relaxed" dangerouslySetInnerHTML={{ __html: taxCertificate }} />
                 <div className="mt-8 pt-6 border-t border-emerald-900/10 flex justify-between items-center opacity-60 italic text-[10px]">
                    <span>Validado por Gnosis Mecánica</span>
                    <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                 </div>
              </div>
            )}

            <section className="space-y-6">
              <h6 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Información Legal & Transparencia</h6>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex justify-between items-center group hover:border-indigo-400 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Fiscal (Tax ID/SSN)</span>
                  <span className="font-black text-slate-900">{selectedDonor.taxId || 'PENDIENTE DE REGISTRO'}</span>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] group hover:border-indigo-400 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Dirección Física</span>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedDonor.address || 'PENDIENTE DE REGISTRO'}</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex justify-between items-center group hover:border-indigo-400 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Verificado</span>
                  <span className="font-black text-indigo-600">{selectedDonor.email || 'SIN CONTACTO'}</span>
                </div>
              </div>
            </section>

            <div className="bg-indigo-50 rounded-[3rem] p-10 border border-indigo-100 relative overflow-hidden shadow-inner">
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <h6 className="text-sm font-black text-indigo-900 uppercase tracking-[0.2em]">Ratio AI Intelligence</h6>
                </div>
                {isAnalyzing ? (
                  <div className="space-y-6">
                    <div className="h-4 bg-indigo-200/50 rounded-full w-3/4 animate-pulse"></div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest animate-pulse">Mapeando conexiones neuronales...</p>
                  </div>
                ) : aiInsights ? (
                  <div className="space-y-10 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-2 gap-10">
                      <div className="p-6 bg-white/50 rounded-2xl border border-white">
                        <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-2">Segmento</p>
                        <p className="text-lg font-black text-indigo-900">{aiInsights.segment}</p>
                      </div>
                      <div className="p-6 bg-white/50 rounded-2xl border border-white">
                        <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-2">LTV Predictivo</p>
                        <p className="text-lg font-black text-indigo-900">${aiInsights.ltv_prediction?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleSelectDonor(selectedDonor)} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest">Re-calibrar Gnosis</button>
                )}
              </div>
            </div>
            
            <div className="flex gap-4 pt-10 pb-10">
              <button 
                onClick={handleGenerateCertificate}
                disabled={isGeneratingCertificate}
                className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all border-b-4 border-slate-700 flex items-center justify-center space-x-4"
              >
                {isGeneratingCertificate ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2"/></svg>}
                <span>Generar Certificado 501(c)(3)</span>
              </button>
              <button className="flex-1 py-6 bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 transition-all">Editar Perfil Legal</button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-[0_0_120px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 border border-white/10">
              <div className="p-12 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                 <div className="relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Registro Simbiótico Legal</h3>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.5em] mt-3">Transparencia Pro-Legitimación AFDAL</p>
                 </div>
                 <button onClick={() => setIsAddModalOpen(false)} className="relative z-10 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M6 18L18 6M6 6l12 12"/></svg>
                 </button>
              </div>
              <form onSubmit={handleAddDonor} className="p-16 space-y-10 overflow-y-auto custom-scrollbar max-h-[75vh]">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identidad (Nombre Real)</label>
                       <input name="name" required type="text" placeholder="Ej: Carlos Ventura" className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-lg text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">ID Fiscal (SSN / EIN / RNC)</label>
                       <input name="taxId" required type="text" placeholder="000-0000000-0" className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-lg text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 outline-none transition-all" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Dirección Física Completa</label>
                    <input name="address" required type="text" placeholder="Ave. Lope de Vega No. 108..." className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-lg text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 outline-none transition-all" />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email de Enlace</label>
                       <input name="email" required type="email" placeholder="carlos@ejemplo.com" className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-lg text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Monto Inicial ($)</label>
                       <input name="amount" required type="number" placeholder="5000" className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-lg text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 outline-none transition-all" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Tipo de Entidad</label>
                       <select name="type" className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-sm text-slate-900 focus:border-indigo-600 outline-none transition-all">
                          <option value="Individual">Individual</option>
                          <option value="Corporate">Corporate</option>
                          <option value="Foundation">Foundation</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Categoría de Vínculo</label>
                       <select name="category" className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-sm text-slate-900 focus:border-indigo-600 outline-none transition-all">
                          <option value="Bronze">Bronze</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                       </select>
                    </div>
                 </div>

                 <button 
                  type="submit"
                  className="w-full py-8 bg-indigo-600 text-white rounded-[2rem] text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 active:scale-95 border-b-8 border-indigo-900 mt-4"
                 >
                    Consolidar Vínculo Legal
                 </button>
              </form>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default DonorCRM;
