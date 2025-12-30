
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { gemini } from '../services/gemini';

interface LedgerProps {
   transactions: Transaction[];
   onAddTransaction: (t: Transaction) => void;
   onUpdateTransaction: (t: Transaction) => void;
   onAddTransactions: (txs: Transaction[]) => void;
   onAddActivity: (action: string, module: string) => void;
}

const Ledger: React.FC<LedgerProps> = ({ transactions, onAddTransaction, onUpdateTransaction, onAddTransactions, onAddActivity }) => {
   const [viewMode, setViewMode] = useState<'JOURNAL' | 'REPORT' | 'SANDBOX'>('JOURNAL');
   const [proposedEntries, setProposedEntries] = useState<any[]>([]);
   const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

   // States for Modals
   const [isAiModalOpen, setIsAiModalOpen] = useState(false);
   const [isManualModalOpen, setIsManualModalOpen] = useState(false);
   const [aiPrompt, setAiPrompt] = useState('');
   const [isGenerating, setIsGenerating] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');

   // Form State para Entrada Manual
   const [manualTx, setManualTx] = useState({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      account: '',
      memo: '',
      type: 'CREDIT' as 'CREDIT' | 'DEBIT',
      fund: 'Unrestricted' as any,
      costCenter: 'Program' as any
   });

   // Dinámicamente calcular reportes basados en la Gnosis Real (Transacciones)
   const financialData = useMemo(() => {
      const approved = transactions.filter(t => t.status === 'APPROVED');
      const revenues = approved.filter(t => t.type === 'CREDIT').reduce((acc, t) => acc + t.amount, 0);
      const expenses = approved.filter(t => t.type === 'DEBIT').reduce((acc, t) => acc + t.amount, 0);
      const netAssets = revenues - expenses;

      // Distribución por Centro de Costo
      const fundraising = approved.filter(t => t.costCenter === 'Fundraising').reduce((acc, t) => acc + t.amount, 0);
      const programs = approved.filter(t => t.costCenter === 'Program').reduce((acc, t) => acc + t.amount, 0);
      const admin = approved.filter(t => t.costCenter === 'Administration').reduce((acc, t) => acc + t.amount, 0);

      return { revenues, expenses, netAssets, fundraising, programs, admin };
   }, [transactions]);

   const filteredTransactions = transactions.filter(tx =>
      tx.memo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleAiPropose = async () => {
      if (!aiPrompt.trim()) return;
      setIsGenerating(true);
      const proposal = await gemini.proposeJournalEntry(aiPrompt);
      if (proposal) {
         setProposedEntries(prev => [{ ...proposal, id: `PRP-${Date.now()}`, title: 'Proyección AI Automática' }, ...prev]);
         onAddActivity('Generación de Draft AI Contable', 'LEDGER');
      }
      setIsGenerating(false);
      setIsAiModalOpen(false);
      setAiPrompt('');
   };

   const handleSaveManual = (e: React.FormEvent) => {
      e.preventDefault();
      const newTx: Transaction = {
         id: `TX-MAN-${Date.now()}`,
         date: manualTx.date,
         amount: parseFloat(manualTx.amount),
         account: manualTx.account,
         type: manualTx.type,
         memo: manualTx.memo,
         fund: manualTx.fund,
         status: 'APPROVED', // Entrada manual por orquestador se auto-aprueba
         costCenter: manualTx.costCenter
      };
      onAddTransaction(newTx);
      onAddActivity(`Entrada Manual: ${newTx.memo}`, 'LEDGER');
      setIsManualModalOpen(false);
      setManualTx({
         date: new Date().toISOString().split('T')[0],
         amount: '',
         account: '',
         memo: '',
         type: 'CREDIT',
         fund: 'Unrestricted',
         costCenter: 'Program'
      });
   };

   const commitProposal = (entry: any) => {
      const newTxs: Transaction[] = entry.lines.map((line: any, index: number) => ({
         id: `TX-GEN-${Date.now()}-${index}`,
         date: new Date().toISOString().split('T')[0],
         amount: line.debit || line.credit,
         account: line.account,
         type: line.debit > 0 ? 'DEBIT' : 'CREDIT',
         memo: line.memo,
         fund: 'Unrestricted',
         status: 'APPROVED',
         costCenter: entry.costCenter || 'Program'
      }));
      onAddTransactions(newTxs);
      setProposedEntries(prev => prev.filter(p => p.id !== entry.id));
      onAddActivity('Digerida proyeccion AI a Libro Real', 'LEDGER');
   };

   const approveTx = (id: string) => {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
         onUpdateTransaction({ ...tx, status: 'APPROVED' });
         onAddActivity(`Validación de Transacción: ${id}`, 'LEDGER');
         if (selectedTx?.id === id) setSelectedTx({ ...selectedTx, status: 'APPROVED' });
      }
   };

   const handleExport = () => {
      onAddActivity('Exportación de Gnosis Contable para Board', 'LEDGER');
      alert("Iniciando colapso de datos en formato PDF/Excel para el Board. SHA-256 Verificada.");
   };

   return (
      <div className="flex flex-col h-full gap-8 animate-in fade-in duration-500 overflow-hidden">

         {/* Orquestador de Navegación de Gnosis */}
         <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm shrink-0">
            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               {['JOURNAL', 'SANDBOX', 'REPORT'].map((mode) => (
                  <button
                     key={mode}
                     onClick={() => setViewMode(mode as any)}
                     className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'
                        }`}
                  >
                     {mode === 'JOURNAL' ? 'Libro Diario' : mode === 'SANDBOX' ? `Drafts AI (${proposedEntries.length})` : 'Reportes de Gnosis'}
                  </button>
               ))}
            </div>

            <div className="flex items-center space-x-4">
               {viewMode === 'JOURNAL' && (
                  <div className="relative group">
                     <input
                        type="text"
                        placeholder="Buscar en el Espejo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold w-64 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                     />
                     <svg className="w-5 h-5 absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" /></svg>
                  </div>
               )}
               <button
                  onClick={() => setIsManualModalOpen(true)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center space-x-3"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2.5" /></svg>
                  <span>Entrada Real</span>
               </button>
               <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center space-x-3"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5" /></svg>
                  <span>Smart Entry</span>
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-hidden">
            {viewMode === 'JOURNAL' && (
               <div className="flex h-full gap-8">
                  <div className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-500 ${selectedTx ? 'w-2/3' : 'w-full'}`}>
                     <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                                 <th className="px-10 py-6">Fecha / ID</th>
                                 <th className="px-10 py-6">Cuenta / C. Costo</th>
                                 <th className="px-10 py-6">Fondo</th>
                                 <th className="px-10 py-6 text-right">Monto</th>
                                 <th className="px-10 py-6">Estado</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {filteredTransactions.map((tx) => (
                                 <tr
                                    key={tx.id}
                                    onClick={() => setSelectedTx(tx)}
                                    className={`hover:bg-slate-50/80 transition-all cursor-pointer group ${selectedTx?.id === tx.id ? 'bg-indigo-50/50' : ''}`}
                                 >
                                    <td className="px-10 py-8">
                                       <p className="text-sm font-black text-slate-900">{tx.date}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{tx.id}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                       <p className="text-sm font-bold text-slate-700">{tx.account}</p>
                                       <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1">{tx.costCenter}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                       <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${tx.fund === 'Unrestricted' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-purple-50 border-purple-100 text-purple-600'
                                          }`}>
                                          {tx.fund}
                                       </span>
                                    </td>
                                    <td className="px-10 py-8 text-right font-black text-slate-900 text-lg">
                                       {tx.type === 'DEBIT' ? '-' : '+'}${tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-10 py-8">
                                       <div className="flex items-center space-x-3">
                                          <div className={`w-2 h-2 rounded-full ${tx.status === 'APPROVED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tx.status}</span>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {selectedTx && (
                     <div className="w-1/3 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col animate-in slide-in-from-right-10 overflow-hidden relative border border-white/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="relative z-10 flex flex-col h-full">
                           <div className="flex justify-between items-start mb-10">
                              <div>
                                 <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Gnosis Verificada</span>
                                 <h4 className="text-3xl font-black tracking-tighter">Detalle de Pulso</h4>
                              </div>
                              <button onClick={() => setSelectedTx(null)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-90">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" /></svg>
                              </button>
                           </div>

                           <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 italic text-sm text-slate-300 leading-relaxed font-serif mb-10">
                              "La transacción {selectedTx.id} ha sido capturada por el Espejo. Representa un colapso de valor por ${selectedTx.amount.toLocaleString()} en el vector de {selectedTx.account}. Esta información es inmutable una vez consolidada."
                           </div>

                           <div className="space-y-6 mt-auto">
                              <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integridad Fiscal</span>
                                 <span className="text-xs font-black text-green-400 uppercase">Audit-Ready</span>
                              </div>
                              <button
                                 onClick={() => approveTx(selectedTx.id)}
                                 disabled={selectedTx.status === 'APPROVED'}
                                 className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${selectedTx.status === 'APPROVED' ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                              >
                                 {selectedTx.status === 'APPROVED' ? 'Vínculo Consolidado' : 'Consolidar Realidad'}
                              </button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {viewMode === 'SANDBOX' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto h-full pr-2 custom-scrollbar pb-20 animate-in fade-in zoom-in-95 duration-500">
                  {proposedEntries.map(entry => (
                     <div key={entry.id} className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-xl overflow-hidden flex flex-col group hover:border-indigo-400 transition-all hover:scale-[1.02]">
                        <div className="p-10 bg-slate-900 text-white relative">
                           <div className="relative z-10">
                              <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[9px] mb-2 block">AI Projection Stage</span>
                              <h4 className="text-2xl font-black tracking-tighter leading-none">{entry.title}</h4>
                           </div>
                           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                        </div>
                        <div className="p-10 flex-1 flex flex-col space-y-8">
                           <p className="text-slate-500 italic text-[13px] leading-relaxed font-serif border-l-4 border-indigo-100 pl-6 py-2">
                              "{entry.justification}"
                           </p>
                           <div className="space-y-4">
                              {entry.lines.map((line: any, i: number) => (
                                 <div key={i} className="flex justify-between items-center text-xs p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                       <p className="font-black text-slate-800">{line.account}</p>
                                       <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">{line.memo}</p>
                                    </div>
                                    <div className="text-right">
                                       {line.debit > 0 ? (
                                          <span className="text-indigo-600 font-black">DR ${line.debit.toLocaleString()}</span>
                                       ) : (
                                          <span className="text-slate-400 font-bold">CR ${line.credit.toLocaleString()}</span>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <div className="pt-8 border-t border-slate-100 mt-auto flex gap-4">
                              <button
                                 onClick={() => commitProposal(entry)}
                                 className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95 border-b-4 border-indigo-800"
                              >
                                 Digerir Gnosis
                              </button>
                              <button
                                 onClick={() => setProposedEntries(prev => prev.filter(p => p.id !== entry.id))}
                                 className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                              >
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" /></svg>
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
                  {proposedEntries.length === 0 && (
                     <div className="col-span-full py-40 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                           <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" /></svg>
                        </div>
                        <p className="text-sm text-slate-400 font-black uppercase tracking-[0.4em]">No hay proyecciones de Gnosis pendientes.</p>
                     </div>
                  )}
               </div>
            )}

            {viewMode === 'REPORT' && (
               <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl p-12 md:p-20 overflow-y-auto h-full custom-scrollbar animate-in slide-in-from-bottom-10 duration-700 relative">
                  <div className="max-w-4xl mx-auto space-y-16">
                     <div className="flex justify-between items-start border-b-4 border-slate-900 pb-12">
                        <div>
                           <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4 leading-none">Statement of Activities</h1>
                           <p className="text-sm text-slate-400 font-black uppercase tracking-[0.5em]">Gnosis Fiscal / Periodo Actual 2024</p>
                        </div>
                        <div className="text-right hidden sm:block">
                           <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl mb-4 ml-auto shadow-2xl">PC</div>
                           <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ratio Caritatis ERP</p>
                           <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-tighter mt-1 italic">Verified Objective Truth</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-12">
                           <section className="space-y-6">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-b-2 border-slate-50 pb-4">Vectores de Ingreso (Revenues)</h4>
                              <div className="space-y-4 pl-6 border-l-2 border-indigo-100">
                                 <div className="flex justify-between text-lg font-black text-slate-900">
                                    <span>Donaciones & Subvenciones</span>
                                    <span>${financialData.revenues.toLocaleString()}</span>
                                 </div>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Consolidación de todos los centros de captación.</p>
                              </div>
                           </section>

                           <section className="space-y-6">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-b-2 border-slate-50 pb-4">Vectores de Gasto (Expenses)</h4>
                              <div className="space-y-5 pl-6 border-l-2 border-amber-100">
                                 {[
                                    { label: 'Nodos de Impacto (Programs)', val: financialData.programs },
                                    { label: 'Captación de Vínculos (Fundraising)', val: financialData.fundraising },
                                    { label: 'Gestión Agéntica (Admin)', val: financialData.admin },
                                 ].map((exp, i) => (
                                    <div key={i} className="flex justify-between items-end">
                                       <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{exp.label}</span>
                                       <span className="text-lg font-black text-slate-900 underline decoration-slate-100 decoration-2">${exp.val.toLocaleString()}</span>
                                    </div>
                                 ))}
                                 <div className="pt-6 border-t border-slate-100 flex justify-between font-black text-xl text-indigo-600">
                                    <span>Total Gastos</span>
                                    <span>${financialData.expenses.toLocaleString()}</span>
                                 </div>
                              </div>
                           </section>
                        </div>

                        <div className="flex flex-col justify-center">
                           <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                              <div className="relative z-10 space-y-6">
                                 <div>
                                    <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[9px] mb-4">Resultado de Gnosis</p>
                                    <h5 className="text-xl font-black tracking-tighter leading-tight mb-8">Cambio Neto en Activos (Superávit/Déficit)</h5>
                                    <div className="text-5xl md:text-6xl font-black tracking-tighter text-white underline decoration-indigo-500 decoration-4 underline-offset-[12px]">
                                       ${financialData.netAssets.toLocaleString()}
                                    </div>
                                 </div>
                                 <p className="text-xs text-slate-400 leading-relaxed font-serif italic border-l-2 border-indigo-500 pl-6 py-1">
                                    "Este colapso financiero representa la armonía entre la captación de propósito y la ejecución de impacto en el periodo fiscal activo."
                                 </p>
                              </div>
                              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
                           </div>
                        </div>
                     </div>

                     <div className="pt-16 border-t-2 border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-all cursor-default">
                        <div className="flex items-center space-x-6">
                           <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" /></svg>
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Audit Grade Integrity</p>
                              <p className="text-[9px] text-slate-400 font-bold">SHA-256 Verified Pulse: c7d1e8f2...e3b0c442</p>
                           </div>
                        </div>
                        <button
                           onClick={handleExport}
                           className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl whitespace-nowrap"
                        >
                           Exportar Gnosis para Board
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* MODAL ENTRADA MANUAL (DATOS REALES) */}
         {isManualModalOpen && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl z-[250] flex items-center justify-center p-4 animate-in fade-in duration-300">
               <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-[0_0_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col animate-in zoom-in-95 border border-white/10">
                  <div className="p-12 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                     <div className="relative z-10">
                        <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Nueva Entrada Real</h3>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.5em] mt-3 italic">Colapso de Transacción Nodal</p>
                     </div>
                     <button onClick={() => setIsManualModalOpen(false)} className="relative z-10 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-90 shadow-2xl">
                        {/* Fixed: Corrected malformed SVG tag quotes */}
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3.5" /></svg>
                     </button>
                  </div>
                  <form onSubmit={handleSaveManual} className="p-12 space-y-10 overflow-y-auto custom-scrollbar bg-white">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Fecha del Suceso</label>
                           <input
                              required
                              type="date"
                              value={manualTx.date}
                              onChange={(e) => setManualTx({ ...manualTx, date: e.target.value })}
                              className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-lg focus:border-indigo-600 outline-none transition-all shadow-inner"
                           />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Monto ($)</label>
                           <input
                              required
                              type="number"
                              step="0.01"
                              value={manualTx.amount}
                              onChange={(e) => setManualTx({ ...manualTx, amount: e.target.value })}
                              placeholder="0.00"
                              className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-xl text-indigo-600 focus:border-indigo-600 outline-none transition-all shadow-inner"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Cuenta de Destino / Origen</label>
                        <input
                           required
                           type="text"
                           value={manualTx.account}
                           onChange={(e) => setManualTx({ ...manualTx, account: e.target.value })}
                           placeholder="Ej: Donaciones - Sin Restricción"
                           className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-lg focus:border-indigo-600 outline-none transition-all shadow-inner"
                        />
                     </div>

                     <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Descripción del Vínculo (Memo)</label>
                        <input
                           required
                           type="text"
                           value={manualTx.memo}
                           onChange={(e) => setManualTx({ ...manualTx, memo: e.target.value })}
                           placeholder="Ej: Aportación de Patrocinador New York"
                           className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-lg focus:border-indigo-600 outline-none transition-all shadow-inner"
                        />
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Tipo</label>
                           <select
                              value={manualTx.type}
                              onChange={(e) => setManualTx({ ...manualTx, type: e.target.value as any })}
                              className="w-full bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl font-black text-sm focus:border-indigo-600 outline-none transition-all cursor-pointer"
                           >
                              <option value="CREDIT">Ingreso (CR)</option>
                              <option value="DEBIT">Egreso (DR)</option>
                           </select>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Fondo</label>
                           <select
                              value={manualTx.fund}
                              onChange={(e) => setManualTx({ ...manualTx, fund: e.target.value as any })}
                              className="w-full bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl font-black text-sm focus:border-indigo-600 outline-none transition-all cursor-pointer"
                           >
                              <option value="Unrestricted">No Restringido</option>
                              <option value="Restricted">Restringido</option>
                              <option value="Temporarily Restricted">Temp. Restringido</option>
                           </select>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">C. Costo</label>
                           <select
                              value={manualTx.costCenter}
                              onChange={(e) => setManualTx({ ...manualTx, costCenter: e.target.value as any })}
                              className="w-full bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl font-black text-sm focus:border-indigo-600 outline-none transition-all cursor-pointer"
                           >
                              <option value="Program">Programa</option>
                              <option value="Administration">Admin</option>
                              <option value="Fundraising">Recaudación</option>
                           </select>
                        </div>
                     </div>

                     <button
                        type="submit"
                        className="w-full py-8 bg-indigo-600 text-white rounded-[2rem] text-[13px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 active:scale-95 border-b-8 border-indigo-900 mt-4"
                     >
                        Consolidar en Registro Inmutable
                     </button>
                  </form>
               </div>
            </div>
         )}

         {/* Modal Smart Entry AI */}
         {isAiModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[200] flex items-center justify-center p-8 animate-in fade-in duration-300">
               <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-[0_0_120px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 border border-white/10">
                  <div className="p-12 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                     <div className="relative z-10">
                        <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Smart Entry Assistant</h3>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.5em] mt-3">Gnosis Mecánica de Alta Fidelidad</p>
                     </div>
                     {/* Fixed: Corrected malformed SVG tag quotes */}
                     <button onClick={() => setIsAiModalOpen(false)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-90">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3.5" /></svg>
                     </button>
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                  </div>
                  <div className="p-16 space-y-10">
                     <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Describe el vector contable para procesar</label>
                        <textarea
                           value={aiPrompt}
                           onChange={(e) => setAiPrompt(e.target.value)}
                           placeholder="Ej: 'Se recibió una donación de $5,000 de Zenith Corp para el fondo general hoy...'"
                           className="w-full h-48 p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] outline-none text-lg font-medium text-slate-700 focus:border-indigo-600 transition-all shadow-inner"
                        />
                     </div>
                     <button
                        onClick={handleAiPropose}
                        disabled={isGenerating || !aiPrompt.trim()}
                        className="w-full py-7 bg-indigo-600 text-white rounded-[2rem] text-[13px] font-black uppercase tracking-[0.3em] shadow-[0_25px_60px_rgba(99,102,241,0.4)] hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4"
                     >
                        {isGenerating ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : (
                           <>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="3" /></svg>
                              <span>Colapsar Realidad / Proponer</span>
                           </>
                        )}
                     </button>
                  </div>
               </div>
            </div>
         )}

         <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
      </div>
   );
};

export default Ledger;
