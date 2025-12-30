
import React, { useState, useMemo } from 'react';
import { Event, TicketTier, SponsorshipLevel } from '../types';
import { gemini } from '../services/gemini';

interface EventsProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  onAddActivity: (action: string, module: string) => void;
}

const initialTiers: TicketTier[] = [
  { id: 'T-VIP', name: 'VIP Excellence (Patrocinador)', price: 1500, totalQuantity: 50, sold: 0, benefits: ['Front Row', 'Private Lounge', 'Mención en Créditos Film'] },
  { id: 'T-STD', name: 'Standard Connection', price: 250, totalQuantity: 150, sold: 0, benefits: ['General Access', 'Acceso a Museo'] },
];

const AFDAL_EVENTS: Event[] = [
  {
    id: 'EV-AFDAL-NY',
    name: 'Velada AFDAL: Apertura y Legitimación (New York)',
    date: '2026-05-23',
    goal: 500000,
    raised: 0,
    ticketsSold: 0,
    status: 'PLANNING',
    detailedDescription: "Esta velada inaugural en New York es el primer nexo hacia la legitimación del legado de Desiderio Arias. El financiamiento se destinará a la pre-producción de la película 'Sangre y Honor: La Sombra del Caudillo', un largometraje histórico épico que explorará la complejidad del caudillismo y la defensa de la soberanía nacional. Complementariamente, se consolidarán los recursos para el 'Museo El León del Cibao', transformando una estructura histórica en un epicentro cultural que preservará objetos personales, correspondencia bélica y la memoria colectiva del caudillo más influyente del norte dominicano.",
    tiers: [
      { id: 'T-VIP', name: 'VIP Excellence (Patrocinador)', price: 1500, totalQuantity: 50, sold: 0, benefits: ['Front Row', 'Private Lounge', 'Mención en Créditos Film'] },
      { 
        id: 'T-STD', 
        name: 'Standard Connection', 
        price: 250, 
        totalQuantity: 150, 
        sold: 0, 
        benefits: ['General Access', 'Acceso a Museo'],
        earlyBirdPrice: 200,
        earlyBirdDeadline: '2026-03-15'
      }
    ],
    sponsorshipLevels: [
      { 
        id: 'SL-SN', 
        name: 'Singularity Nexus', 
        minAmount: 10000, 
        tablesIncluded: 3, 
        brandingRights: true, 
        benefits: ['Full Logo Integration', 'Opening Speech Recognition', 'Private Board Access', 'AI Impact Workshop'] 
      }
    ]
  },
  {
    id: 'EV-AFDAL-NJ',
    name: 'Velada AFDAL: Escalamiento (New Jersey)',
    date: '2026-05-09',
    goal: 350000,
    raised: 0,
    ticketsSold: 0,
    status: 'LIVE',
    tiers: [
      { id: 'T-VIP', name: 'VIP Excellence (Patrocinador)', price: 1500, totalQuantity: 75, sold: 0, benefits: ['Front Row', 'Private Lounge', 'Mención en Créditos Film'] },
      { id: 'T-STD', name: 'Standard Connection', price: 250, totalQuantity: 150, sold: 0, benefits: ['General Access', 'Acceso a Museo'] }
    ]
  },
  {
    id: 'EV-AFDAL-MIA',
    name: 'Velada AFDAL: Último Cierre (Miami)',
    date: '2026-04-25',
    goal: 250000,
    raised: 0,
    ticketsSold: 0,
    status: 'PLANNING',
    tiers: JSON.parse(JSON.stringify(initialTiers))
  }
];

const Events: React.FC<EventsProps> = ({ events, setEvents, onAddActivity }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sponsorship form states
  const [sponsorName, setSponsorName] = useState('');
  const [selectedTierId, setSelectedTierId] = useState('T-VIP');
  const [paymentMethod, setPaymentMethod] = useState('Wire Transfer');

  React.useEffect(() => {
    if (events.length === 0) {
      setEvents(AFDAL_EVENTS);
    }
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(ev => 
      ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.date.includes(searchTerm)
    );
  }, [events, searchTerm]);

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEvent: Event = {
      id: `EV-${Date.now()}`,
      name: formData.get('name') as string,
      date: formData.get('date') as string,
      goal: parseFloat(formData.get('goal') as string),
      raised: 0,
      ticketsSold: 0,
      status: 'PLANNING',
      tiers: JSON.parse(JSON.stringify(initialTiers))
    };
    setEvents(prev => [newEvent, ...prev]);
    onAddActivity(`Nuevo Nodo Creado: ${newEvent.name}`, 'EVENTS');
    setIsCreateModalOpen(false);
  };

  const handleConsolidateSponsorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const tier = selectedEvent.tiers?.find(t => t.id === selectedTierId);
    if (!tier || tier.sold >= tier.totalQuantity) {
      alert("Nodo de capacidad máxima alcanzado para este tier.");
      return;
    }

    const updatedEvents = events.map(ev => {
      if (ev.id === selectedEvent.id) {
        const updatedTiers = ev.tiers?.map(t => 
          t.id === selectedTierId ? { ...t, sold: t.sold + 1 } : t
        );
        const newRaised = ev.raised + (tier.earlyBirdPrice && new Date() < new Date(tier.earlyBirdDeadline || '') ? tier.earlyBirdPrice : tier.price);
        const newSold = ev.ticketsSold + 1;
        
        const updatedEv = { 
          ...ev, 
          raised: newRaised, 
          ticketsSold: newSold, 
          tiers: updatedTiers,
          status: newRaised >= ev.goal ? 'LIVE' : ev.status
        } as Event;
        
        setSelectedEvent(updatedEv);
        return updatedEv;
      }
      return ev;
    });

    setEvents(updatedEvents);
    onAddActivity(`Sincronía: ${sponsorName} vía ${paymentMethod} ($${tier.price}) para ${selectedEvent.name}`, 'EVENTS');
    setIsSponsorModalOpen(false);
    setSponsorName('');
  };

  const handleGenerateAudit = async () => {
    if (!selectedEvent) return;
    setIsAuditLoading(true);
    const prompt = `Actúa como el Orquestador Senior de Gnosis de Speculum Caritatis. Genera un INFORME DE CONFORMIDAD Y GNOSIS DE COMPROBACIÓN REAL para la Velada AFDAL: ${selectedEvent.name}.
    
    ESTRUCTURA DEL DOCUMENTO (Usa HTML para formato Word profesional):
    <h1>INFORME DE AUDITORÍA Y CONFORMIDAD OPERATIVA</h1>
    <p><b>ID DE NODO:</b> ${selectedEvent.id}</p>
    <p><b>FECHA DE EMISIÓN:</b> ${new Date().toLocaleDateString()}</p>
    
    <h2>I. ESTADO FINANCIERO DEL NEXO</h2>
    <table border="1">
      <tr><td><b>Meta del Proyecto AFDAL</b></td><td>$${selectedEvent.goal.toLocaleString()}</td></tr>
      <tr><td><b>Recaudación Bruta Real</b></td><td>$${selectedEvent.raised.toLocaleString()}</td></tr>
      <tr><td><b>Eficiencia de Captación</b></td><td>${Math.round((selectedEvent.raised / selectedEvent.goal) * 100)}%</td></tr>
    </table>
    
    <h2>II. ANÁLISIS DE IMPACTO Y OBJETIVO</h2>
    <p>Analiza el financiamiento para la película <b>'Sangre y Honor'</b> y el <b>'Museo El León del Cibao'</b> basado en estos números.</p>
    
    <h2>III. DICTAMEN DE CONFORMIDAD</h2>
    <p>Emite un juicio sobre si el evento cumple con los estándares de integridad normativa y ética algorítmica.</p>
    
    REGLA: Usa solo etiquetas <h1>, <h2>, <b>, <p>, <table>, <tr>, <td>. NO USES Markdown. El texto debe ser serio, técnico y autoritario.`;
    
    const report = await gemini.askAssistant(prompt);
    setAuditReport(report);
    setIsAuditLoading(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden animate-in fade-in duration-500">
      {!selectedEvent ? (
        <div className="flex-1 flex flex-col space-y-6 md:space-y-10 overflow-hidden">
          <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                 <span className="bg-indigo-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">Proyecto AFDAL</span>
                 <span className="text-slate-400 text-[8px] font-black uppercase tracking-widest whitespace-nowrap">Desiderio Arias Legacy</span>
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Nodos de Convergencia (Veladas)</h3>
              
              <div className="mt-6 relative max-w-md group">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por nombre, fecha o estado..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                />
                <svg className="w-5 h-5 absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="3"/></svg>
              </div>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-95 border-b-4 border-indigo-800 whitespace-nowrap"
            >
              Iniciar Nueva Convergencia
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 pb-20">
            {filteredEvents.map(event => (
              <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-500 cursor-pointer transition-all hover:shadow-2xl flex flex-col">
                <div className={`absolute top-0 right-0 px-6 py-2 md:px-8 md:py-3 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-bl-[2rem] text-white z-10 ${event.status === 'LIVE' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                  {event.status}
                </div>
                <div className="mb-8 md:mb-12">
                  <p className="text-[9px] md:text-[10px] text-indigo-500 uppercase font-black tracking-[0.4em] mb-2 md:mb-4">{event.id}</p>
                  <h4 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors tracking-tighter break-words mb-4">{event.name}</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.sponsorshipLevels && <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded uppercase">Patrocinios VIP Activos</span>}
                    {event.tiers?.some(t => t.earlyBirdPrice) && <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase">Early Bird Link</span>}
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2-2z" strokeWidth="2.5"/></svg>
                    {event.date}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-4 mt-auto">
                  <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100">
                    <p className="text-[9px] md:text-[10px] text-slate-400 uppercase font-black mb-2 md:mb-3">Armonía Lograda</p>
                    <p className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tighter">${event.raised.toLocaleString()}</p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1 md:mt-2">Meta: ${event.goal.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100">
                    <p className="text-[9px] md:text-[10px] text-slate-400 uppercase font-black mb-2 md:mb-3">Frecuencia de Vínculos</p>
                    <p className="text-2xl md:text-3xl font-black tracking-tighter">{event.ticketsSold}</p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1 md:mt-2">Tickets Emitidos</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-full py-20 text-center">
                 <p className="text-slate-400 font-black uppercase tracking-widest italic">No se detectaron convergencias con ese criterio de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-10">
           <div className="bg-slate-900 text-white p-10 md:p-16 rounded-t-[3rem] md:rounded-t-[4rem] flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 shadow-2xl relative overflow-hidden gap-6">
             <div className="relative z-10 flex items-center space-x-6 md:space-x-16 w-full md:w-auto">
                <button onClick={() => { setSelectedEvent(null); setAuditReport(null); }} className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] hover:bg-white/20 transition-all active:scale-90 shadow-2xl group shrink-0">
                  <svg className="w-6 h-6 md:w-10 md:h-10 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="4"/></svg>
                </button>
                <div className="min-w-0">
                   <span className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[8px] md:text-[10px] mb-2 md:mb-4 block truncate">Gnosis Operativa AFDAL</span>
                   <h2 className="text-2xl md:text-5xl font-black tracking-tighter leading-none break-words">{selectedEvent.name}</h2>
                </div>
             </div>
             <div className="flex space-x-4 md:space-x-6 relative z-10 w-full md:w-auto">
                <button onClick={handleGenerateAudit} disabled={isAuditLoading} className="flex-1 md:flex-none p-4 md:p-6 bg-slate-800 text-indigo-400 border border-indigo-500/30 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center space-x-4">
                   {isAuditLoading ? <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> : <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2"/></svg>}
                   <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest whitespace-nowrap">Dictamen Gnosis</span>
                </button>
             </div>
           </div>

           <div className="flex-1 bg-slate-100 p-8 md:p-16 overflow-y-auto custom-scrollbar">
              {auditReport && (
                <div className="mb-16 bg-white mx-auto max-w-[850px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-lg p-16 md:p-24 border border-slate-200 animate-in slide-in-from-bottom-10 duration-700 font-serif">
                   <div className="border-b-2 border-slate-900 pb-10 mb-10 text-center">
                      <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Informe de Conformidad y Gnosis Real</h3>
                      <p className="text-xs text-slate-500 font-black uppercase tracking-[0.4em]">Audit Ready - Speculum Caritatis v4.0.1</p>
                   </div>
                   <div 
                     className="text-slate-800 text-lg leading-relaxed audit-report-content"
                     dangerouslySetInnerHTML={{ __html: auditReport }}
                   />
                </div>
              )}

              <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16">
                 <div className="lg:col-span-2 space-y-10 md:space-y-12">
                    <section className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 shadow-sm">
                       <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 md:mb-8">Propósito del Nodo</h4>
                       <p className="text-xl md:text-2xl font-serif italic text-slate-800 leading-relaxed whitespace-pre-wrap">
                         {selectedEvent.detailedDescription ? (
                            selectedEvent.detailedDescription
                         ) : (
                            <>Esta velada tiene como fin el financiamiento de la producción cinematográfica <b>'Sangre y Honor: La Sombra del Caudillo'</b> y la consolidación del <b>Museo El León del Cibao</b>, dedicado a preservar el legado histórico del General Desiderio Arias.</>
                         )}
                       </p>
                    </section>

                    {selectedEvent.sponsorshipLevels && selectedEvent.sponsorshipLevels.length > 0 && (
                      <section className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6">Vectores de Patrocinio Estratégico</h4>
                        <div className="grid grid-cols-1 gap-6">
                           {selectedEvent.sponsorshipLevels.map(sl => (
                             <div key={sl.id} className="bg-slate-900 text-white p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                                <div className="flex justify-between items-start relative z-10">
                                   <div>
                                      <h5 className="text-2xl font-black tracking-tighter uppercase mb-2 text-indigo-400">{sl.name}</h5>
                                      <p className="text-4xl font-black mb-6">${sl.minAmount.toLocaleString()}</p>
                                   </div>
                                   <div className="bg-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{sl.tablesIncluded} Mesas VIP</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                   {sl.benefits.map((b, i) => (
                                     <div key={i} className="flex items-center space-x-3 text-[10px] font-bold text-slate-300 uppercase">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <span>{b}</span>
                                     </div>
                                   ))}
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
                             </div>
                           ))}
                        </div>
                      </section>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                       {selectedEvent.tiers?.map(tier => (
                         <div key={tier.id} className="bg-white p-8 md:p-10 border-2 border-slate-100 rounded-[2rem] md:rounded-[2.5rem] hover:border-indigo-500 transition-all group relative">
                            <div className="absolute top-6 right-6 text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                              {tier.sold} / {tier.totalQuantity} Asignados
                            </div>
                            <h5 className="text-base md:text-lg font-black uppercase tracking-tight mb-2 truncate">{tier.name}</h5>
                            <div className="flex items-center space-x-3 mb-6">
                               <p className="text-2xl md:text-3xl font-black text-indigo-600">${tier.price.toLocaleString()}</p>
                               {tier.earlyBirdPrice && (
                                 <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase animate-pulse">
                                   Early Bird: ${tier.earlyBirdPrice}
                                 </div>
                               )}
                            </div>
                            <ul className="space-y-3">
                               {tier.benefits.map((b, i) => (
                                 <li key={i} className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-start">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 shrink-0 mt-1"></div>
                                    <span className="break-words">{b}</span>
                                 </li>
                               ))}
                            </ul>
                            {tier.earlyBirdDeadline && (
                              <p className="mt-6 text-[8px] font-black text-slate-400 uppercase tracking-widest border-t pt-4">Límite Early Bird: {tier.earlyBirdDeadline}</p>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-8 md:space-y-10">
                    <div className="bg-slate-900 text-white p-10 md:p-12 rounded-[3rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                       <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[9px] md:text-[10px] mb-6 md:mb-8">Estado de Armonía Lograda</p>
                       <div className="text-4xl md:text-6xl font-black tracking-tighter mb-4 break-words">${selectedEvent.raised.toLocaleString()}</div>
                       <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Meta: ${selectedEvent.goal.toLocaleString()}</p>
                       <div className="mt-8 md:mt-10 h-4 bg-white/10 rounded-full overflow-hidden shadow-inner border border-white/5">
                          <div className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.6)]" style={{ width: `${Math.min(100, (selectedEvent.raised / selectedEvent.goal) * 100)}%` }}></div>
                       </div>
                    </div>
                    <button 
                      onClick={() => setIsSponsorModalOpen(true)}
                      className="w-full py-6 md:py-8 bg-indigo-600 text-white rounded-[2rem] md:rounded-[2.5rem] text-[11px] md:text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all border-b-8 border-indigo-900"
                    >
                      Consolidar Patrocinio Real
                    </button>
                    
                    <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                       <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Métricas de Frecuencia</h6>
                       <div className="space-y-4">
                          <div className="flex justify-between text-[10px] font-bold uppercase border-b border-slate-50 pb-2">
                             <span className="text-slate-500">Tickets Emitidos</span>
                             <span className="text-slate-900 font-black">{selectedEvent.ticketsSold}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                             <span className="text-slate-500">Eficiencia Nodo</span>
                             <span className="text-indigo-600 font-black">{Math.round((selectedEvent.raised / selectedEvent.goal) * 100)}%</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Sponsorship Injection Modal */}
      {isSponsorModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 border border-indigo-500/20">
              <div className="p-12 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Consolidar Nexus</h3>
                    <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.5em] mt-3 italic">Registro de Aportación Real AFDAL</p>
                 </div>
                 <button onClick={() => setIsSponsorModalOpen(false)} className="relative z-10 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="4"/></svg>
                 </button>
              </div>
              <form onSubmit={handleConsolidateSponsorship} className="p-12 md:p-16 space-y-8 overflow-y-auto custom-scrollbar">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identidad del Patrocinador</label>
                    <input 
                      required 
                      type="text" 
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="Ej: Fundación Legacy / Carlos Ventura" 
                      className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl font-black text-xl text-slate-900 focus:border-indigo-600 outline-none transition-all" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de Vínculo AFDAL</label>
                    <div className="grid grid-cols-1 gap-4">
                       {selectedEvent.tiers?.map(tier => (
                         <button 
                           key={tier.id}
                           type="button"
                           disabled={tier.sold >= tier.totalQuantity}
                           onClick={() => setSelectedTierId(tier.id)}
                           className={`p-6 rounded-[1.5rem] border-2 text-left transition-all ${
                             selectedTierId === tier.id ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-slate-100 hover:border-indigo-200'
                           } ${tier.sold >= tier.totalQuantity ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                         >
                            <div className="flex justify-between items-center">
                               <div className="flex flex-col">
                                 <span className="text-xs font-black uppercase tracking-tight text-slate-900">{tier.name}</span>
                                 <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Capacidad: {tier.sold}/{tier.totalQuantity}</span>
                               </div>
                               <span className="text-lg font-black text-indigo-600">${tier.price.toLocaleString()}</span>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
                 <button type="submit" className="w-full py-8 bg-indigo-600 text-white rounded-[2rem] text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 active:scale-95 border-b-8 border-indigo-900 mt-6">
                    Confirmar Gnosis Financiera
                 </button>
              </form>
           </div>
        </div>
      )}
      
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[250] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 border border-white/10">
              <div className="p-10 md:p-16 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                 <div className="relative z-10">
                    <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-white">Nueva Velada</h3>
                    <p className="text-[9px] md:text-[11px] text-indigo-400 font-black uppercase tracking-[0.6em] mt-3 md:mt-4">Iniciación de Convergencia AFDAL</p>
                 </div>
                 <button onClick={() => setIsCreateModalOpen(false)} className="relative z-10 p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl hover:bg-white/20 transition-all">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="4"/></svg>
                 </button>
              </div>
              <form onSubmit={handleCreateEvent} className="p-8 md:p-16 lg:p-20 space-y-8 md:space-y-12 bg-white overflow-y-auto custom-scrollbar">
                 <div className="space-y-4 md:space-y-6">
                    <label className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Nombre del Nodo</label>
                    <input name="name" required type="text" placeholder="Ej: Velada Miami: Último Cierre" className="w-full bg-slate-50 border-2 border-slate-200 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black text-xl md:text-2xl tracking-tighter outline-none focus:border-indigo-600 shadow-inner text-slate-900 placeholder:text-slate-300" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4 md:space-y-6">
                       <label className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Fecha</label>
                       <input name="date" required type="date" className="w-full bg-slate-50 border-2 border-slate-200 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black text-base md:text-lg focus:border-indigo-600 shadow-inner text-slate-900" />
                    </div>
                    <div className="space-y-4 md:space-y-6">
                       <label className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Meta AFDAL ($)</label>
                       <input name="goal" required type="number" placeholder="250000" className="w-full bg-slate-50 border-2 border-slate-200 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black text-xl md:text-2xl tracking-tighter focus:border-indigo-600 shadow-inner text-slate-900 placeholder:text-slate-300" />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-6 md:py-8 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2.5rem] text-[12px] md:text-[15px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 active:scale-95 border-b-8 border-indigo-900 mt-4">
                    Publicar Nodo de Recaudación
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

export default Events;
