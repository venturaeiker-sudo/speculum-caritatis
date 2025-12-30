
import React, { useState } from 'react';
import { AppView } from '../types';
import Logo from './Logo';

interface LayoutProps {
  currentView: AppView;
  children: React.ReactNode;
  onLogout: () => void;
  activeRole: string;
  onMenuToggle: () => void;
  theme: 'GNOSIS' | 'ABYSS' | 'BONE';
  setTheme: (t: 'GNOSIS' | 'ABYSS' | 'BONE') => void;
  setView: (v: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ currentView, children, onLogout, activeRole, onMenuToggle, theme, setTheme, setView }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const headerBg = {
    GNOSIS: 'bg-[#0f111a]/60 border-white/5',
    ABYSS: 'bg-black/40 border-white/5',
    BONE: 'bg-white/40 border-slate-200'
  }[theme];

  const textColor = theme === 'BONE' ? 'text-slate-900' : 'text-white';
  const subTextColor = theme === 'BONE' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="flex flex-col h-full w-full relative">
      <header className={`h-16 md:h-20 backdrop-blur-3xl border-b flex items-center justify-between px-4 md:px-10 z-[100] shrink-0 sticky top-0 transition-all duration-1000 ${headerBg}`}>
        <div className="flex items-center space-x-3 md:space-x-6">
          <button 
            onClick={onMenuToggle}
            className={`p-2 md:hidden rounded-xl transition-all ${theme === 'BONE' ? 'hover:bg-slate-200/50' : 'hover:bg-white/5'}`}
          >
            <svg className={`w-6 h-6 ${subTextColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          
          <div className="hidden md:flex flex-col">
            <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] truncate ${textColor}`}>
              {currentView.replace('_', ' ')}
            </h2>
            <p className="text-[8px] text-indigo-500 font-black uppercase tracking-[0.4em] mt-1">Speculum Caritatis Control</p>
          </div>
        </div>

        {/* AI Agent Core Link Indicator - Animated */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center space-x-4 group cursor-default">
           <div className={`h-px w-10 bg-gradient-to-r from-transparent ${theme === 'BONE' ? 'to-indigo-300' : 'to-indigo-500'} animate-pulse`}></div>
           <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md animate-ping opacity-30"></div>
              <Logo className="w-7 h-7 relative z-10 transition-transform duration-1000 group-hover:rotate-180" theme={theme} />
           </div>
           <div className="flex flex-col items-center">
              <span className={`text-[9px] font-black uppercase tracking-[0.6em] ${textColor} animate-pulse duration-[3000ms]`}>Speculum Synced</span>
              <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1 animate-bounce"></div>
           </div>
           <div className={`h-px w-10 bg-gradient-to-l from-transparent ${theme === 'BONE' ? 'to-indigo-300' : 'to-indigo-500'} animate-pulse`}></div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-6">
          <div className="relative">
            <button 
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`p-3 rounded-2xl transition-all border shadow-sm flex items-center space-x-2 ${
                theme === 'BONE' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline-block">Espectro</span>
            </button>
            {isThemeMenuOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsThemeMenuOpen(false)}></div>
                <div className={`absolute right-0 mt-4 w-56 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] border p-2 animate-in zoom-in-95 duration-200 z-[110] ${
                  theme === 'BONE' ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'
                }`}>
                  <button onClick={() => { setTheme('GNOSIS'); setIsThemeMenuOpen(false); }} className={`w-full flex items-center space-x-4 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'GNOSIS' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5'}`}>
                    <div className="w-5 h-5 rounded-lg bg-[#0f111a] border border-indigo-500/30"></div>
                    <span>Gnosis (Original)</span>
                  </button>
                  <button onClick={() => { setTheme('ABYSS'); setIsThemeMenuOpen(false); }} className={`w-full flex items-center space-x-4 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mt-1 ${theme === 'ABYSS' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5'}`}>
                    <div className="w-5 h-5 rounded-lg bg-black border border-white/20"></div>
                    <span>Abisal (Negro)</span>
                  </button>
                  <button onClick={() => { setTheme('BONE'); setIsThemeMenuOpen(false); }} className={`w-full flex items-center space-x-4 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mt-1 ${theme === 'BONE' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}>
                    <div className="w-5 h-5 rounded-lg bg-[#fdfbf7] border border-slate-200"></div>
                    <span>Alba (Hueso)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 md:space-x-4 transition-all"
            >
              <div className="text-right hidden xs:block">
                <p className={`text-[9px] font-black uppercase tracking-tight ${textColor}`}>{activeRole}</p>
                <p className={`text-[8px] font-bold uppercase tracking-widest ${subTextColor}`}>Agente Humano</p>
              </div>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-black text-xs md:text-sm shadow-xl border border-white/10 ${
                theme === 'BONE' ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-600 to-indigo-900'
              }`}>
                {activeRole.charAt(0)}
              </div>
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)}></div>
                <div className={`absolute right-0 mt-4 w-64 md:w-80 rounded-[2rem] shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-300 z-[110] ${
                  theme === 'BONE' ? 'bg-white border-slate-200' : 'bg-slate-950/90 border-white/5'
                }`}>
                  <div className={`p-8 relative ${theme === 'BONE' ? 'bg-slate-50 text-slate-900' : 'bg-black text-white'}`}>
                    <p className="text-[8px] text-indigo-500 font-black uppercase tracking-[0.4em] mb-3">Sincronía Actual</p>
                    <h4 className="text-lg font-black tracking-tighter uppercase truncate">{activeRole}</h4>
                  </div>
                  <div className="p-6 space-y-4">
                    <button 
                      onClick={() => { setView(AppView.SETTINGS); setIsProfileOpen(false); }}
                      className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center space-x-2 ${
                        theme === 'BONE' ? 'bg-slate-100 border-slate-200 hover:bg-indigo-50 text-indigo-600' : 'bg-white/5 border-white/10 hover:bg-white/10 text-indigo-400'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5"/></svg>
                      <span>Configurar Nexo</span>
                    </button>
                    <button 
                      onClick={onLogout}
                      className="w-full py-4 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 transition-all flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      <span>Desvincular Nodo</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-10 relative custom-scrollbar z-10">
        <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex flex-col items-center justify-center transition-all duration-1000 ${
          theme === 'BONE' ? 'opacity-[0.02]' : 'opacity-[0.03]'
        }`}>
           <span className={`text-[25vw] font-black leading-none whitespace-nowrap rotate-[-5deg] ${theme === 'BONE' ? 'text-slate-900' : 'text-white'}`}>SPECULUM</span>
           <span className={`text-[15vw] font-black leading-none whitespace-nowrap rotate-[3deg] ${theme === 'BONE' ? 'text-slate-900' : 'text-white'}`}>CARITATIS</span>
        </div>
        
        <div className="max-w-[1600px] mx-auto w-full relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
