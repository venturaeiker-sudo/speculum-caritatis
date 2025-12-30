
import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { InductionRequest, UserNode } from '../App';

interface LandingProps {
  onInitialize: (role: string, name: string) => void;
  onAddInduction: (req: InductionRequest) => void;
  approvedUsers: UserNode[];
  theme: 'GNOSIS' | 'ABYSS' | 'BONE';
}

type AuthStep = 'VECTOR' | 'IDENTITY' | 'BIOMETRIC' | 'RECOVERY' | 'INDUCTION' | 'WAITING_APPROVAL';

const Landing: React.FC<LandingProps> = ({ onInitialize, onAddInduction, approvedUsers, theme }) => {
  const [step, setStep] = useState<AuthStep>('VECTOR');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [recoverySent, setRecoverySent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Persistencia de Usuario
  const [loginId, setLoginId] = useState(() => localStorage.getItem('speculum_remembered_id') || '');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('speculum_remembered_id'));

  const [inductionData, setInductionData] = useState({ name: '', email: '', password: '', role: 'Simbionte de Impacto' });
  const [password, setPassword] = useState(''); // Added password state
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const profiles = [
    { id: 'CORE', label: 'Orquestador Core', desc: 'Soberanía del Dato.' },
    { id: 'GNOSIS', label: 'Controlador de Gnosis', desc: 'Espejo de Verdad.' },
    { id: 'IMPACT', label: 'Simbionte de Impacto', desc: 'Reflejo Social.' },
    { id: 'IRS', label: 'Auditor de Integridad', desc: 'Pureza Normativa.' },
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setStep('IDENTITY');
    setErrorMsg(null);
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = approvedUsers.find(u => u.email.toLowerCase() === loginId.toLowerCase());

    if (user) {
      if (user.password && user.password !== password) {
        setErrorMsg("Clave de Gnosis incorrecta.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem('speculum_remembered_id', loginId);
      } else {
        localStorage.removeItem('speculum_remembered_id');
      }
      setStep('BIOMETRIC');
    } else {
      setErrorMsg("Identidad no detectada en el Espejo. Verifique el email o solicite inducción.");
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userExists = approvedUsers.some(u => u.email.toLowerCase() === recoveryEmail.toLowerCase());
    if (userExists) {
      setRecoverySent(true);
      setErrorMsg(null);
    } else {
      setErrorMsg("La frecuencia (email) no existe en el registro del Espejo.");
    }
  };

  useEffect(() => {
    if (step === 'BIOMETRIC') {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              const user = approvedUsers.find(u => u.email.toLowerCase() === loginId.toLowerCase());
              if (user) onInitialize(user.role, user.name);
            }, 800);
            return 100;
          }
          return prev + 4;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [step, approvedUsers, loginId, onInitialize]);

  const handleInductionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(inductionData.email)) {
      setErrorMsg("Email de enlace no válido para el protocolo SMTP.");
      return;
    }
    if (inductionData.password.length < 6) {
      setErrorMsg("La clave de Gnosis debe tener al menos 6 caracteres.");
      return;
    }

    const newRequest: InductionRequest = {
      id: `REQ-${Math.floor(Math.random() * 900) + 100}`,
      name: inductionData.name,
      email: inductionData.email,
      password: inductionData.password,
      requestedRole: inductionData.role,
      timestamp: new Date().toLocaleString(),
      status: 'PENDING'
    };
    onAddInduction(newRequest);
    setStep('WAITING_APPROVAL');
  };

  const bgClass = { GNOSIS: 'bg-[#0f111a]', ABYSS: 'bg-black', BONE: 'bg-[#fdfbf7]' }[theme];
  const textColor = theme === 'BONE' ? 'text-slate-900' : 'text-white';
  const cardBg = { GNOSIS: 'bg-indigo-900/20 border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.1)]', ABYSS: 'bg-white/[0.03] border-white/10 shadow-2xl', BONE: 'bg-white/80 border-slate-200 shadow-xl' }[theme];

  const inputClass = `w-full p-6 border rounded-2xl outline-none font-bold transition-all focus:ring-4 focus:ring-indigo-500/20 ${theme === 'BONE'
      ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
      : 'bg-black border-white/20 text-white placeholder-slate-500 focus:border-indigo-500'
    }`;

  return (
    <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center p-4 md:p-10 overflow-hidden font-sans transition-all duration-1000 ${bgClass}`}>
      <div className="relative z-30 w-full max-w-xl flex flex-col items-center">
        <div className="mb-10 relative flex flex-col items-center animate-in fade-in duration-1000">
          <Logo className="w-48 h-48 md:w-56 md:h-56 relative z-10 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]" theme={theme} />
          <div className="mt-6 text-center">
            <h3 className={`text-4xl font-black tracking-tighter uppercase leading-none ${textColor}`}>Speculum Caritatis</h3>
            <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.5em] mt-3 italic">El Espejo de la Caridad v4.0.1</p>
          </div>
        </div>

        <div className={`w-full backdrop-blur-3xl rounded-[3.5rem] border overflow-hidden transition-all duration-700 relative ${cardBg}`}>
          <div className="p-12 md:p-16 relative z-10">

            {step === 'VECTOR' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="text-center">
                  <p className={`text-[10px] font-black uppercase tracking-[0.6em] mb-4 ${theme === 'BONE' ? 'text-slate-400' : 'text-slate-500'}`}>Protocolo de Reflexión</p>
                  <h2 className={`text-3xl font-black uppercase tracking-tighter ${textColor}`}>Acceso al Espejo</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {profiles.map((p) => (
                    <button key={p.id} onClick={() => handleRoleSelect(p.label)} className={`group p-8 rounded-3xl border transition-all text-left flex items-center justify-between ${theme === 'BONE' ? 'bg-slate-50 hover:bg-white border-slate-200' : 'bg-white/5 hover:bg-white/10 border-white/5'}`}>
                      <div>
                        <h4 className={`text-sm font-black uppercase tracking-tight ${theme === 'BONE' ? 'text-slate-800' : 'text-slate-100'}`}>{p.label}</h4>
                        <p className={`text-[10px] font-bold uppercase mt-1 tracking-widest ${theme === 'BONE' ? 'text-slate-400' : 'text-slate-500'}`}>{p.desc}</p>
                      </div>
                      <svg className="w-6 h-6 text-indigo-500 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5-5 5" strokeWidth="4" strokeLinecap="round" /></svg>
                    </button>
                  ))}
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col space-y-4 text-center">
                  <button onClick={() => setStep('INDUCTION')} className="text-[11px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Solicitar Inducción</button>
                  <button onClick={() => setStep('RECOVERY')} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-400 transition-colors">Recuperar Frecuencia de Enlace</button>
                </div>
              </div>
            )}

            {step === 'IDENTITY' && (
              <form onSubmit={handleLogin} className="space-y-10 animate-in fade-in zoom-in-95 duration-500 text-center">
                <button type="button" onClick={() => setStep('VECTOR')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 hover:underline">← Re-calibrar Vector</button>
                <div>
                  <h2 className={`text-3xl font-black uppercase tracking-tighter ${textColor} mb-2`}>Sincronía de Enlace</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{selectedRole}</p>
                </div>

                <div className="space-y-6 text-left">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Email Agente</label>
                    <input required type="email" value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="agente@speculum.org" className={inputClass} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Clave de Gnosis</label>
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                  </div>
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded border-indigo-500/30 bg-black/40 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <label htmlFor="rememberMe" className={`text-[10px] font-black uppercase tracking-widest cursor-pointer ${theme === 'BONE' ? 'text-slate-500' : 'text-slate-400'}`}>Mantener Enlace Activo</label>
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-6 rounded-2xl text-[11px] font-black uppercase tracking-widest animate-in shake">
                    {errorMsg}
                  </div>
                )}

                <button type="submit" className={`w-full py-8 rounded-3xl text-[13px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-[0_25px_60px_rgba(99,102,241,0.4)] hover:bg-indigo-700 active:scale-95 transition-all border-b-8 border-indigo-900`}>
                  Consolidar Reflejo
                </button>
              </form>
            )}

            {step === 'RECOVERY' && (
              <form onSubmit={handleRecoverySubmit} className="space-y-10 animate-in fade-in slide-in-from-top-6 text-center">
                <button type="button" onClick={() => setStep('VECTOR')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 hover:underline">← Volver al Acceso</button>
                <div className="mb-4">
                  <h2 className={`text-3xl font-black uppercase tracking-tighter ${textColor}`}>Recuperar Frecuencia</h2>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2 italic">Restablecer Vínculo Maestro</p>
                </div>

                {recoverySent ? (
                  <div className="space-y-8 animate-in zoom-in">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-8 rounded-3xl text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                      Un nuevo pulso de sincronía ha sido emitido hacia el Espejo de {recoveryEmail}.
                      Revise su bandeja para consolidar el nuevo enlace.
                    </div>
                    <button type="button" onClick={() => setStep('VECTOR')} className={`w-full py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl bg-indigo-600 text-white`}>
                      Regresar al Inicio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Ingrese Email de Enlace</label>
                      <input required type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="agente@speculum.org" className={inputClass} />
                    </div>

                    {errorMsg && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-6 rounded-2xl text-[11px] font-black uppercase tracking-widest animate-in shake">
                        {errorMsg}
                      </div>
                    )}

                    <button type="submit" className="w-full py-8 bg-indigo-600 text-white rounded-3xl font-black uppercase text-[12px] tracking-widest shadow-[0_25px_60px_rgba(99,102,241,0.3)] hover:bg-indigo-700 transition-all border-b-8 border-indigo-900">
                      Emitir Pulso de Reseteo
                    </button>
                  </div>
                )}
              </form>
            )}

            {step === 'BIOMETRIC' && (
              <div className="space-y-12 py-12 text-center animate-in fade-in duration-1000">
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-0 border-8 border-indigo-500/10 rounded-full"></div>
                  <Logo className="w-24 h-24 relative z-10" theme={theme} />
                  <div className="absolute top-0 left-0 w-full h-full border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className={`text-2xl font-black uppercase tracking-tighter ${textColor} mb-4`}>Validación en el Espejo</h3>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-6 animate-pulse">Sincronizando Gnosis ({scanProgress}%)</p>
                </div>
              </div>
            )}

            {step === 'INDUCTION' && (
              <form onSubmit={handleInductionSubmit} className="space-y-8 animate-in fade-in zoom-in-95 text-left">
                <button type="button" onClick={() => setStep('VECTOR')} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 hover:underline">← Cancelar Inducción</button>
                <div className="text-center mb-10">
                  <h2 className={`text-3xl font-black uppercase tracking-tighter ${textColor} mb-2`}>Solicitud de Inducción</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Mapeo de Unidad de Carbono</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Nombre Completo</label>
                    <input required type="text" value={inductionData.name} onChange={(e) => setInductionData({ ...inductionData, name: e.target.value })} className={inputClass} placeholder="Ej: Elena Ruiz" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Email de Enlace</label>
                    <input required type="email" value={inductionData.email} onChange={(e) => setInductionData({ ...inductionData, email: e.target.value })} className={inputClass} placeholder="elena@institution.org" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Clave de Acceso</label>
                    <input required type="password" value={inductionData.password} onChange={(e) => setInductionData({ ...inductionData, password: e.target.value })} className={inputClass} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Rol Deseado</label>
                    <select value={inductionData.role} onChange={(e) => setInductionData({ ...inductionData, role: e.target.value })} className={inputClass}>
                      {profiles.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
                    </select>
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-6 rounded-2xl text-[11px] font-black uppercase tracking-widest animate-in shake">
                    {errorMsg}
                  </div>
                )}

                <button type="submit" className="w-full py-8 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl mt-8 hover:bg-indigo-700 active:scale-95 transition-all">
                  Enviar al Orquestador
                </button>
              </form>
            )}

            {step === 'WAITING_APPROVAL' && (
              <div className="space-y-12 py-16 text-center animate-in zoom-in duration-700">
                <div className="w-32 h-32 bg-indigo-500/10 border-4 border-dashed border-indigo-500/30 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" /></svg>
                </div>
                <div className="space-y-6">
                  <h3 className={`text-3xl font-black uppercase tracking-tighter ${textColor}`}>Reflejo en Revisión</h3>
                  <p className="text-slate-500 italic text-sm leading-relaxed px-8">
                    "Su identidad está siendo analizada por el Orquestador Core. El Espejo reflejará su acceso una vez que la Gnosis sea validada por un administrador maestro."
                  </p>
                </div>
                <button onClick={() => setStep('VECTOR')} className="px-12 py-5 bg-slate-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Regresar al Inicio</button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Background Decorative Layer */}
      <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ${theme === 'BONE' ? 'opacity-5' : 'opacity-10'}`}>
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-indigo-900 rounded-full blur-[150px]"></div>
      </div>

      <style>{`
        @keyframes scan { 0% { top: 10%; opacity: 0; } 50% { opacity: 1; } 100% { top: 90%; opacity: 0; } }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
