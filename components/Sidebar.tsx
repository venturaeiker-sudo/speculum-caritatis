
import React, { useState } from 'react';
import { AppView } from '../types';
import Logo from './Logo';

interface SidebarProps {
  activeView: AppView;
  setView: (view: AppView) => void;
  initialRole?: string;
  onLogout?: () => void;
  isOpen: boolean;
  onClose: () => void;
  theme: 'GNOSIS' | 'ABYSS' | 'BONE';
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, initialRole, onLogout, isOpen, onClose, theme }) => {
  const [currentRole, setCurrentRole] = useState<string>(initialRole || 'Controlador de Gnosis');

  const sidebarBg = {
    GNOSIS: 'bg-[#0a0c14] border-white/5',
    ABYSS: 'bg-black border-white/5',
    BONE: 'bg-white border-slate-200'
  }[theme];

  const textColor = theme === 'BONE' ? 'text-slate-900' : 'text-white';
  const subTextColor = theme === 'BONE' ? 'text-slate-400' : 'text-slate-500';

  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Resonancia', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { id: AppView.LEDGER, label: 'Gnosis Contable', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' },
    { id: AppView.PAYMENTS, label: 'Flujos', icon: 'M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4' },
    { id: AppView.DONORS, label: 'Simbiontes', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { id: AppView.PROGRAMS, label: 'Impacto Nodal', icon: 'M12 2L2 7l10 5 10-5-10-5z' },
    { id: AppView.EVENTS, label: 'Convergencias', icon: 'M8 2v4M16 2v4M3 10h18' },
    { id: AppView.REPORTS, label: 'Gobernanza', icon: 'M12 20v-6M6 20V10' },
    { id: AppView.COMPLIANCE, label: 'Integridad', icon: 'M12 22s8-4 8-10V5l-8-3-8 3' },
    { id: AppView.RISK, label: 'Gnosis Riesgo', icon: 'M13 2L3 14h9v8l10-12' },
    { id: AppView.SETTINGS, label: 'Configuración', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className={`fixed inset-0 z-[150] md:hidden backdrop-blur-xl transition-all duration-500 ${theme === 'BONE' ? 'bg-slate-900/40' : 'bg-black/80'}`}
          onClick={onClose}
        ></div>
      )}

      <aside className={`fixed md:relative top-0 left-0 h-full w-72 md:w-80 flex flex-col z-[200] border-r transition-all duration-1000 ease-in-out ${sidebarBg} ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo className="w-10 h-10" theme={theme} />
            <div>
              <h1 className={`text-sm font-black tracking-[0.3em] uppercase leading-none ${textColor}`}>Speculum Caritatis</h1>
              <p className="text-[7px] text-indigo-500 mt-2 uppercase tracking-[0.5em] font-black italic">Reflejo Operativo</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
          </button>
        </div>
        
        <nav className="flex-1 mt-6 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300 group ${
                activeView === item.id 
                ? (theme === 'BONE' ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white text-black shadow-2xl scale-[1.02]')
                : (theme === 'BONE' ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200')
              }`}
            >
              <svg
                className={`w-5 h-5 mr-5 shrink-0 transition-transform ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d={item.icon} />
              </svg>
              <span className="font-black text-[9px] uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={`p-8 border-t ${theme === 'BONE' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Sincronización</p>
          <div className={`border rounded-xl py-3 px-4 text-[9px] font-black text-indigo-500 uppercase tracking-widest truncate ${
            theme === 'BONE' ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/40 border-white/5'
          }`}>
            {initialRole}
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Charitate Mirror Link</span>
            </div>
            <button 
              onClick={onLogout}
              className={`p-2 transition-colors ${theme === 'BONE' ? 'text-slate-400 hover:text-rose-600' : 'text-slate-600 hover:text-rose-500'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeWidth="2.5"/></svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
