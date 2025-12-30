
import React, { useState, useEffect } from 'react';
import { gemini } from '../services/gemini';
import { InductionRequest, UserNode, UserActivity } from '../App';

interface SettingsProps {
  theme: 'GNOSIS' | 'ABYSS' | 'BONE';
  activeRole: string;
  userName: string;
  onUpdateIdentity: (name: string, role: string) => void;
  pendingRequests: InductionRequest[];
  onUpdateInduction: (req: InductionRequest) => void;
  onDeleteInduction: (id: string) => void;
  approvedUsers: UserNode[];
  onAddUser: (u: UserNode) => void;
  onDeleteUser: (email: string) => void;
  activities: UserActivity[];
  onAddActivity: (action: string, module: string) => void;
}

interface UserData {
  name: string;
  email: string;
  role: string;
}

interface SystemConfig {
  institutionName: string;
  thinkingBudget: number;
  sentinelActive: boolean;
  dataSovereignty: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  theme, activeRole, userName, onUpdateIdentity,
  pendingRequests, onUpdateInduction, onDeleteInduction,
  approvedUsers, onAddUser, onDeleteUser,
  activities, onAddActivity
}) => {
  const isMasterUser = activeRole === 'Orquestador Core';

  const [userData, setUserData] = useState<UserData>({
    name: userName,
    email: localStorage.getItem('pc_email') || "admin@institution.org",
    role: activeRole
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    institutionName: localStorage.getItem('pc_institution') || "AFDAL LEGACY",
    thinkingBudget: 24576,
    sentinelActive: true,
    dataSovereignty: true
  });

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<UserNode>({
    name: '',
    email: '',
    role: 'Simbionte de Impacto',
    password: ''
  });

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [activityReport, setActivityReport] = useState<string | null>(null);
  const [isAnalyzingActivity, setIsAnalyzingActivity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTarget, setSaveTarget] = useState<'GLOBAL' | 'IDENTITY' | 'SYSTEM' | 'INDUCTION' | 'USER_CREATE' | null>(null);
  const [auditReport, setAuditReport] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSave = (target: 'GLOBAL' | 'IDENTITY' | 'SYSTEM') => {
    if (target === 'IDENTITY') {
      const trimmedName = userData.name.trim();
      const trimmedEmail = userData.email.trim();

      // Validación de Correcion (Longitud y Presencia)
      if (trimmedName.length < 3) {
        setToast({ message: "El ID de Biometría debe tener al menos 3 caracteres reales.", type: 'error' });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setToast({ message: "Sintaxis de email inválida para el protocolo de enlace.", type: 'error' });
        return;
      }

      // Validador de No Repetición (Unicidad en el Espejo)
      const isDuplicate = approvedUsers.some(u =>
        u.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        u.email.trim().toLowerCase() !== userData.email.trim().toLowerCase()
      );

      if (isDuplicate) {
        setToast({ message: "Error de Pulso: La identidad biométrica ya existe en otro nodo.", type: 'error' });
        return;
      }
    }

    setIsSaving(true);
    setSaveTarget(target);
    setTimeout(() => {
      setIsSaving(false);
      onUpdateIdentity(userData.name.trim(), userData.role);
      localStorage.setItem('pc_email', userData.email.trim());
      localStorage.setItem('pc_institution', systemConfig.institutionName);
      setToast({ message: "Gnosis de identidad sincronizada con éxito.", type: 'success' });
      setSaveTarget(null);
    }, 1200);
  };

  const handleCreateInstitutionalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newUser.name.trim();
    const trimmedEmail = newUser.email.trim();

    if (trimmedName.length < 3) {
      setToast({ message: "Identidad demasiado corta para validación.", type: 'error' });
      return;
    }

    // Doble verificación de duplicados para inyección
    const isDuplicate = approvedUsers.some(u =>
      u.name.trim().toLowerCase() === trimmedName.toLowerCase() ||
      u.email.trim().toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (isDuplicate) {
      setToast({ message: "Conflicto de Gnosis: Nombre o Email ya vinculados al nexo.", type: 'error' });
      return;
    }

    setIsSaving(true);
    setSaveTarget('USER_CREATE');
    setTimeout(() => {
      // Use email as ID for Firestore
      onAddUser({ ...newUser, name: trimmedName, email: trimmedEmail, id: trimmedEmail } as any);
      onAddActivity(`Unidad Inyectada: ${trimmedName}`, 'SETTINGS');
      setToast({ message: `Unidad ${trimmedName} vinculada correctamente.`, type: 'success' });
      setIsAddingUser(false);
      setNewUser({ name: '', email: '', role: 'Simbionte de Impacto', password: '' });
      setIsSaving(false);
      setSaveTarget(null);
    }, 1000);
  };

  const handleApproveRequest = (req: InductionRequest) => {
    setSaveTarget('INDUCTION');
    setIsSaving(true);
    setTimeout(() => {
      // Add user to users collection
      onAddUser({ email: req.email, name: req.name, role: req.requestedRole, password: req.password, id: req.email } as any);
      // Remove from pending requests
      onDeleteInduction(req.id);

      onAddActivity(`Inducción Aprobada: ${req.name}`, 'SETTINGS');
      setToast({ message: `Unidad ${req.name} aprobada.`, type: 'success' });
      setIsSaving(false);
      setSaveTarget(null);
    }, 1200);
  };

  const removeUser = (email: string) => {
    if (email === userData.email) {
      setToast({ message: "Incapaz de desvincular el Núcleo Primario.", type: 'error' });
      return;
    }
    onDeleteUser(email); // Use prop
    setToast({ message: "Vínculo de unidad colapsado.", type: 'success' });
  };

  const cardBg = { GNOSIS: 'bg-[#1a1c29]/50 border-white/5 shadow-2xl', ABYSS: 'bg-white/[0.03] border-white/10', BONE: 'bg-white/70 border-slate-200 shadow-sm' }[theme];
  const inputBg = { GNOSIS: 'bg-black/40 border-white/10 text-white focus:border-indigo-500', ABYSS: 'bg-white/5 border-white/10 text-white focus:border-indigo-600', BONE: 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400' }[theme];
  const textColor = theme === 'BONE' ? 'text-slate-900' : 'text-white';

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-32 overflow-y-auto h-full pr-2 custom-scrollbar">

      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-10 duration-500">
          <div className={`px-10 py-5 rounded-2xl border shadow-2xl flex items-center space-x-6 backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-600/90 border-rose-500 text-white'
            }`}>
            <p className="text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
          </div>
        </div>
      )}

      <div className={`p-12 rounded-[3.5rem] border relative overflow-hidden ${theme === 'BONE' ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-900 border-white/5 shadow-2xl'}`}>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div>
            <span className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.5em] mb-4 block">Configuración de Soberanía</span>
            <h2 className={`text-5xl font-black tracking-tighter uppercase leading-none ${textColor}`}>{systemConfig.institutionName}</h2>
          </div>
          <button onClick={() => handleSave('GLOBAL')} disabled={isSaving} className="px-10 py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center space-x-4">
            {isSaving && saveTarget === 'GLOBAL' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="4" /></svg>}
            <span>Consolidar Nexo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className={`p-10 rounded-[3rem] border flex flex-col space-y-8 ${cardBg}`}>
          <h4 className={`text-xl font-black uppercase tracking-tighter ${textColor}`}>Identidad de Agente (Biometría ID)</h4>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">Nombre de Identidad</label>
              <input
                type="text"
                value={userData.name}
                placeholder="Mínimo 3 caracteres"
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className={`w-full p-5 rounded-2xl outline-none border transition-all font-black text-lg ${inputBg}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">Email de Enlace</label>
              <input type="email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} className={`w-full p-5 rounded-2xl outline-none border transition-all font-black text-lg ${inputBg}`} />
            </div>
            <button onClick={() => handleSave('IDENTITY')} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Actualizar Mi Gnosis</button>
          </div>
        </section>

        <section className={`p-10 rounded-[3rem] border flex flex-col space-y-8 ${cardBg}`}>
          <div className="flex justify-between items-center">
            <h4 className={`text-xl font-black uppercase tracking-tighter ${textColor}`}>Control de Unidades</h4>
            <button onClick={() => setIsAddingUser(true)} className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">+ Inyectar</button>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
            {approvedUsers.map(user => (
              <div key={user.email} className="p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-between group">
                <div>
                  <p className={`text-sm font-black uppercase ${textColor}`}>{user.name}</p>
                  <p className="text-[8px] font-bold text-indigo-400 uppercase">{user.role}</p>
                </div>
                <button onClick={() => removeUser(user.email)} className="p-2 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" strokeWidth="2.5" /></svg></button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {isAddingUser && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[500] flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-10 space-y-8 border border-emerald-500/20">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-center">Inyectar Unidad Nodal</h3>
            <form onSubmit={handleCreateInstitutionalUser} className="space-y-4">
              <input required type="text" placeholder="Nombre Real (Mín. 3 chars)" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full p-4 rounded-xl border font-bold outline-none focus:border-emerald-500" />
              <input required type="email" placeholder="Email de Enlace" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full p-4 rounded-xl border font-bold outline-none focus:border-emerald-500" />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full p-4 rounded-xl border font-bold outline-none">
                <option value="Simbionte de Impacto">Simbionte de Impacto</option>
                <option value="Controlador de Gnosis">Controlador de Gnosis</option>
                <option value="Orquestador Core">Orquestador Core</option>
              </select>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl">Validar e Inyectar</button>
              <button type="button" onClick={() => setIsAddingUser(false)} className="w-full text-[9px] font-black text-slate-400 uppercase text-center">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Settings;
