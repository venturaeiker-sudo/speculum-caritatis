
import React, { useState, useMemo } from 'react';
import { Transaction, BankStatementItem, ReconciliationMatch } from '../types';
import { gemini } from '../services/gemini';

const initialLedger: Transaction[] = [
  { id: 'TX-9238', date: '2024-05-18', amount: 250, account: 'Donations', type: 'CREDIT', memo: 'Donation from Ana Lopez', fund: 'Unrestricted', status: 'APPROVED', costCenter: 'Fundraising' },
  { id: 'TX-9239', date: '2024-05-18', amount: 1500, account: 'Grants', type: 'CREDIT', memo: 'Marcus G. wire transfer', fund: 'Restricted', status: 'PENDING', costCenter: 'Program' },
  { id: 'TX-9240', date: '2024-05-17', amount: 5000, account: 'Sponsorship', type: 'CREDIT', memo: 'Zenith Sponsorship', fund: 'Unrestricted', status: 'APPROVED', costCenter: 'Fundraising' },
  { id: 'TX-9241', date: '2024-05-16', amount: 45.50, account: 'Bank Fees', type: 'DEBIT', memo: 'Monthly maintenance', fund: 'Unrestricted', status: 'APPROVED', costCenter: 'Administration' },
];

const initialBankStatement: BankStatementItem[] = [
  { id: 'BS-801', date: '2024-05-18', amount: 250, description: 'STRIPE TRANSFER / ANA M LOPEZ', type: 'CREDIT' },
  { id: 'BS-802', date: '2024-05-19', amount: 1500, description: 'WIRE INCOMING / MARCUS G', type: 'CREDIT' },
  { id: 'BS-803', date: '2024-05-17', amount: 5000, description: 'PAYPAL / ZENITH CORP', type: 'CREDIT' },
  { id: 'BS-804', date: '2024-05-16', amount: 45.50, description: 'BANK SERVICE CHARGE', type: 'DEBIT' },
  { id: 'BS-805', date: '2024-05-20', amount: 12.00, description: 'MISC ATM FEE', type: 'DEBIT' },
];

interface LivePayment {
  id: string;
  donor: string;
  amount: number;
  gateway: 'Stripe' | 'PayPal' | 'Wire/ACH';
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  time: string;
  icon: string;
}

interface PaymentsProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onAddTransactions: (txs: Transaction[]) => void;
  onAddActivity: (action: string, module: string) => void;
}

const Payments: React.FC<PaymentsProps> = ({ transactions, onAddTransaction, onUpdateTransaction, onAddTransactions, onAddActivity }) => {
  const [viewMode, setViewMode] = useState<'LIVE' | 'RECONCILE'>('LIVE');
  const [livePayments, setLivePayments] = useState<LivePayment[]>([
    { id: 'pay_9240', donor: 'Sponsorship - Zenith', amount: 5000, gateway: 'PayPal', status: 'COMPLETED', time: '1 hour ago', icon: 'P' },
    { id: 'pay_9239', donor: 'Marcus G.', amount: 1500, gateway: 'Wire/ACH', status: 'PROCESSING', time: '15 mins ago', icon: 'W' },
    { id: 'pay_9238', donor: 'Ana Maria Lopez', amount: 250, gateway: 'Stripe', status: 'COMPLETED', time: 'Just now', icon: 'S' },
  ]);

  const [matches, setMatches] = useState<ReconciliationMatch[]>([]);
  const [isReconciling, setIsReconciling] = useState(false);
  const [showWebhookSimulator, setShowWebhookSimulator] = useState(false);

  const stats = useMemo(() => {
    const total = livePayments.reduce((acc, p) => acc + p.amount, 0);
    const stripeTotal = livePayments.filter(p => p.gateway === 'Stripe').reduce((acc, p) => acc + p.amount, 0);
    const paypalTotal = livePayments.filter(p => p.gateway === 'PayPal').reduce((acc, p) => acc + p.amount, 0);
    const achTotal = livePayments.filter(p => p.gateway === 'Wire/ACH').reduce((acc, p) => acc + p.amount, 0);
    const efficiency = livePayments.length > 0
      ? Math.round((livePayments.filter(p => p.status === 'COMPLETED').length / livePayments.length) * 100)
      : 0;
    return { total, stripeTotal, paypalTotal, achTotal, efficiency };
  }, [livePayments]);

  const handleSimulateWebhook = (donorName: string, amount: number, gateway: string) => {
    const newPayment: LivePayment = {
      id: `pay_${Math.floor(Math.random() * 10000)}`,
      donor: donorName || 'Simbionte Anónimo',
      amount: amount || 0,
      gateway: (gateway as any) || 'Stripe',
      status: 'COMPLETED',
      time: 'Just now',
      icon: gateway ? gateway[0] : '?'
    };
    setLivePayments(prev => [newPayment, ...prev]);
    onAddActivity(`Webhook Simulado: Pago de ${donorName}`, 'PAYMENTS');
    setShowWebhookSimulator(false);
  };

  const handleRunReconciliation = async () => {
    setIsReconciling(true);
    // Use Firestore transactions for reconciliation
    const aiMatches = await gemini.analyzeBankReconciliation(transactions, initialBankStatement);
    setMatches(aiMatches);
    onAddActivity('Ejecución de Reconciliación Bancaria AI', 'PAYMENTS');
    setIsReconciling(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-700 pb-4 overflow-y-auto custom-scrollbar pr-2">

      {/* Navegación y Control Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0 gap-4">
        <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
          {[{ id: 'LIVE', label: 'Monitor de Pagos' }, { id: 'RECONCILE', label: 'Conciliación Bancaria (AI)' }].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === mode.id ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {viewMode === 'LIVE' && (
          <button onClick={() => setShowWebhookSimulator(true)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all active:scale-95 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5" /></svg>
            <span>Simular Webhook (Input Real)</span>
          </button>
        )}
      </div>

      {viewMode === 'LIVE' ? (
        <div className="space-y-4">
          {/* Status Global */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[8px] mb-2">Orquestador de Pasarelas / Live Output</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-2">
                  ${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Fondo total reconciliado hoy {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black shadow-lg">S</div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black shadow-lg">P</div>
                  <div className="w-10 h-10 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black shadow-lg">A</div>
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Status Global</p>
                  <p className="text-sm font-black whitespace-nowrap">3 Gateways Activos</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Stripe / Live', val: `$${stats.stripeTotal.toLocaleString()}`, trend: '+5.2%', col: 'text-indigo-400' },
                { label: 'PayPal / Live', val: `$${stats.paypalTotal.toLocaleString()}`, trend: '-2.1%', col: 'text-blue-400' },
                { label: 'ACH Pending', val: `$${stats.achTotal.toLocaleString()}`, trend: 'Hold', col: 'text-amber-400' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">{item.label}</p>
                    <span className={`text-[7px] font-black px-2 py-0.5 rounded-full ${item.trend.includes('+') ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>{item.trend}</span>
                  </div>
                  <p className={`text-2xl font-black tracking-tighter ${item.col}`}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Log de Transacciones */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 shrink-0">
                <div>
                  <h3 className="font-black text-slate-900 text-xs tracking-tighter uppercase">Live Transaction Log</h3>
                  <p className="text-[8px] text-slate-400 font-medium">Normalización automática vía Gnosis Mecánica.</p>
                </div>
                <button className="text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">Auditar Pasarelas</button>
              </div>
              <div className="divide-y divide-slate-50 overflow-y-auto custom-scrollbar">
                {livePayments.map(pay => (
                  <div key={pay.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                    <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 bg-white border-2 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${pay.gateway === 'Stripe' ? 'border-indigo-100 text-indigo-600' : pay.gateway === 'PayPal' ? 'border-blue-100 text-blue-600' : 'border-amber-100 text-amber-600'
                        }`}>
                        {pay.icon}
                      </div>
                      <div>
                        <h6 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{pay.donor}</h6>
                        <div className="flex items-center space-x-2">
                          <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{pay.id}</span>
                          <span className="text-slate-200">•</span>
                          <span className="text-[8px] text-indigo-500 font-black uppercase tracking-widest">{pay.gateway}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-6">
                      <div>
                        <p className="text-base font-black text-slate-900 tracking-tighter">${pay.amount.toLocaleString()}</p>
                        <p className="text-[8px] text-slate-400 font-black uppercase mt-0.5">{pay.time}</p>
                      </div>
                      <div className={`w-24 text-center py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm border ${pay.status === 'COMPLETED' ? 'text-green-700 bg-green-50 border-green-100' : pay.status === 'PROCESSING' ? 'text-amber-700 bg-amber-50 border-amber-100 animate-pulse' : 'text-rose-700 bg-rose-50 border-rose-100'
                        }`}>
                        {pay.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar de Salud Operativa */}
            <div className="space-y-4 flex flex-col h-full">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Salud Operativa de Flujos</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Conciliación Real</span>
                      <span className="text-lg font-black text-green-600">{stats.efficiency}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                      <div className="bg-green-500 h-full rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all duration-1000" style={{ width: `${stats.efficiency}%` }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">IA Strategic Insight</p>
                    <p className="text-[10px] text-indigo-900 leading-relaxed font-serif italic">"La tasa de sincronía es óptima. Se recomienda auditar pasarelas cada 24h para mantener la pureza de la Gnosis financiera."</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-3xl text-white flex-1 relative overflow-hidden flex flex-col justify-center text-center border border-white/5 shadow-inner">
                <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 mx-auto bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-400 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" strokeWidth="2.5" /></svg>
                  </div>
                  <h5 className="text-sm font-black tracking-tighter uppercase leading-none">Garantía Inmutable</h5>
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-relaxed px-4">Flujos blindados por protocolo Gnosis Mecánica.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Conciliación Bancaria */
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex-1 flex flex-col min-h-[600px]">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 shrink-0">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Bank Reconciliation</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Gnosis Algorítmica vs Ledger AFDAL</p>
            </div>
            <button onClick={handleRunReconciliation} disabled={isReconciling} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 disabled:opacity-50 flex items-center space-x-2">
              {isReconciling ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" strokeWidth="2" /></svg>}
              <span>Ejecutar Gnosis Reconcilio</span>
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
            <div className="flex flex-col h-full border rounded-2xl overflow-hidden">
              <div className="bg-slate-50 p-4 border-b font-black text-[9px] uppercase tracking-widest text-slate-500">Speculum Ledger</div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex justify-between items-center text-xs">
                    <div><p className="font-black text-slate-900">{tx.memo}</p><p className="text-[8px] text-slate-400 uppercase">{tx.id}</p></div>
                    <p className={`font-black ${tx.type === 'CREDIT' ? 'text-indigo-600' : 'text-slate-400'}`}>${tx.amount}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col h-full border rounded-2xl overflow-hidden">
              <div className="bg-slate-50 p-4 border-b font-black text-[9px] uppercase tracking-widest text-slate-500">Bank Statement Pulse</div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                {initialBankStatement.map(bs => (
                  <div key={bs.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex justify-between items-center text-xs">
                    <div><p className="font-black text-slate-900">{bs.description}</p><p className="text-[8px] text-slate-400 uppercase">{bs.id}</p></div>
                    <p className="font-black text-slate-700">${bs.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showWebhookSimulator && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-10 space-y-8 border border-indigo-500/20">
            <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase text-center">Inyectar Pulso Real</h4>
            <div className="space-y-4">
              <input id="sim_donor" type="text" placeholder="Identidad Donante" className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-sm outline-none focus:border-indigo-600" />
              <div className="grid grid-cols-2 gap-4">
                <select id="sim_gateway" className="bg-slate-50 border p-4 rounded-xl font-bold text-xs outline-none">
                  <option value="Stripe">Stripe</option><option value="PayPal">PayPal</option><option value="Wire/ACH">Wire/ACH</option>
                </select>
                <input id="sim_amount" type="number" placeholder="Monto ($)" className="bg-slate-50 border p-4 rounded-xl font-bold text-sm outline-none focus:border-indigo-600" />
              </div>
              <button onClick={() => {
                const donor = (document.getElementById('sim_donor') as HTMLInputElement).value;
                const amount = parseFloat((document.getElementById('sim_amount') as HTMLInputElement).value);
                const gateway = (document.getElementById('sim_gateway') as HTMLSelectElement).value;
                handleSimulateWebhook(donor, amount, gateway);
              }} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl">Confirmar Inyección</button>
              <button onClick={() => setShowWebhookSimulator(false)} className="w-full text-[9px] font-black text-slate-400 uppercase hover:text-rose-500 transition-colors">Abortar Protocolo</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Payments;
