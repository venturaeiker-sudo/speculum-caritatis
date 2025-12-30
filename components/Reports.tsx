
import React, { useState, useEffect } from 'react';
import { HolisticSummary, Transaction, Donor, ComplianceTask, Event, ProgramImpact } from '../types';
import { gemini } from '../services/gemini';

interface ReportsProps {
  transactions: Transaction[];
  donors: Donor[];
  tasks: ComplianceTask[];
  events: Event[];
  programs: ProgramImpact[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, donors, tasks, events, programs }) => {
  const [report, setReport] = useState<HolisticSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conformityReport, setConformityReport] = useState<string | null>(null);

  const fetchHolisticReport = async () => {
    setIsLoading(true);
    const synthesis = await gemini.synthesizeHolisticReport({
      transactionsCount: transactions.length,
      revenue: transactions.filter(t => t.type === 'CREDIT').reduce((a, b) => a + b.amount, 0),
      expenses: transactions.filter(t => t.type === 'DEBIT').reduce((a, b) => a + b.amount, 0),
      donorsCount: donors.length,
      eventsCount: events.length
    });
    setReport(synthesis);
    setIsLoading(false);
  };

  useEffect(() => { fetchHolisticReport(); }, []);

  const handleGenerateConformity = async () => {
    setIsLoading(true);
    const auditPrompt = `Genera un INFORME DE CONFORMIDAD Y GNOSIS DE COMPROBACIÓN REAL para SPECULUM CARITATIS. 
    Verifica que el reflejo de los datos sea inmutable y apto para el IRS.`;
    const result = await gemini.askAssistant(auditPrompt);
    setConformityReport(result);
    setIsLoading(false);
  };

  return (
    <div className="h-full space-y-10 flex flex-col overflow-hidden animate-in fade-in duration-700">
      <div className="bg-slate-900 text-white p-14 rounded-[3.5rem] relative overflow-hidden shadow-2xl border border-slate-800 shrink-0">
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-end">
            <div>
               <h2 className="text-6xl font-black tracking-tighter mb-4 leading-none uppercase">Speculum Caritatis</h2>
               <p className="text-slate-400 text-sm max-w-lg leading-relaxed font-medium">El Espejo de la Caridad: Archivo Maestro de Transparencia Real.</p>
            </div>
            <div className="flex space-x-4 mt-8 lg:mt-0">
               <button onClick={handleGenerateConformity} className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 border-b-4 border-indigo-900">
                 Gnosis de Conformidad
               </button>
               <button onClick={fetchHolisticReport} disabled={isLoading} className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-md">
                 Sincronizar Reflejo
               </button>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-20 space-y-16">
        {report && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Liquidez Reflejada', content: report.financialHealth },
              { title: 'Auditoría de Pureza', content: report.riskAssessment },
              { title: 'Reflejo Legal', content: report.complianceStatus },
              { title: 'Dictamen del Espejo', content: report.strategicInsight, dark: true }
            ].map((card, i) => (
              <div key={i} className={`p-10 rounded-[3rem] border transition-all hover:shadow-2xl ${card.dark ? 'bg-slate-900 text-white' : 'bg-white shadow-sm'}`}>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-indigo-400">{card.title}</h4>
                 <p className="text-base leading-relaxed font-serif italic border-l-4 border-indigo-400 pl-8">"{card.content}"</p>
              </div>
            ))}
          </section>
        )}

        {conformityReport && (
          <section className="bg-white p-16 rounded-[4rem] border border-indigo-100 shadow-2xl animate-in slide-in-from-bottom-10">
             <div className="flex justify-between items-center mb-12 border-b-4 border-slate-900 pb-8">
                <h3 className="text-4xl font-black uppercase tracking-tighter">Informe de Conformidad (Speculum)</h3>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-6 py-2 rounded-full">Reflejo Inmutable</span>
             </div>
             <div className="prose prose-xl max-w-none text-slate-800 leading-relaxed space-y-8 whitespace-pre-wrap font-serif italic border-l-[12px] border-indigo-600 pl-16 py-4">
                {conformityReport}
             </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Reports;
