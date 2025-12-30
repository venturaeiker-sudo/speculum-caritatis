
import React, { useState, useEffect } from 'react';
import { AppView, Transaction, Donor, Event, ComplianceTask, ProgramImpact, RiskAnomaly } from './types';
import Sidebar from './components/Sidebar';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Ledger from './components/Ledger';
import DonorCRM from './components/DonorCRM';
import Compliance from './components/Compliance';
import Payments from './components/Payments';
import Events from './components/Events';
import Programs from './components/Programs';
import Reports from './components/Reports';
import RiskAnalysis from './components/RiskAnalysis';
import AIAssistant from './components/AIAssistant';
import Landing from './components/Landing';
import Settings from './components/Settings';
import { useFirestoreCollection } from './hooks/useFirestore';

export type Theme = 'GNOSIS' | 'ABYSS' | 'BONE';

export interface InductionRequest {
  id: string;
  name: string;
  email: string;
  password?: string;
  requestedRole: string;
  timestamp: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
}

export interface UserNode {
  email: string;
  name: string;
  role: string;
  password?: string;
}

export interface UserActivity {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
}

const initialUsers: UserNode[] = [
  { email: 'admin@afdal.org', name: 'CARLOS', role: 'Orquestador Core' },
  { email: 'cventura10@gmail.com', name: 'CARLOS VENTURA', role: 'Orquestador Core' }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('pc_auth') === 'true');
  const [activeRole, setActiveRole] = useState<string>(() => localStorage.getItem('pc_role') || 'Orquestador Core');
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('pc_user') || 'CARLOS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('ratio_theme') as Theme) || 'GNOSIS');

  // Firestore Collections
  const { data: transactions, add: addTransaction, update: updateTransaction, batchAdd: batchAddTransactions } = useFirestoreCollection<Transaction>('transactions');
  const { data: donors, add: addDonor, update: updateDonor, batchAdd: batchAddDonors } = useFirestoreCollection<Donor>('donors');
  const { data: events, add: addEvent, update: updateEvent, batchAdd: batchAddEvents } = useFirestoreCollection<Event>('events');
  const { data: tasks, add: addTask, update: updateTask, batchAdd: batchAddTasks } = useFirestoreCollection<ComplianceTask>('compliance_tasks');
  const { data: programs, add: addProgram, update: updateProgram, batchAdd: batchAddPrograms } = useFirestoreCollection<ProgramImpact>('program_impacts');
  const { data: anomalies, add: addAnomaly, update: updateAnomaly, batchAdd: batchAddAnomalies } = useFirestoreCollection<RiskAnomaly>('risk_anomalies');
  const { data: approvedUsers, add: addUser, update: updateUser, remove: removeUser, batchAdd: batchAddUsers } = useFirestoreCollection<UserNode>('users');
  const { data: pendingRequests, add: addRequest, update: updateRequest, remove: removeRequest, batchAdd: batchAddRequests } = useFirestoreCollection<InductionRequest>('induction_requests');
  const { data: activities, add: addActivityDoc, batchAdd: batchAddActivities } = useFirestoreCollection<UserActivity>('activities');

  // One-time Migration Effect
  useEffect(() => {
    const migrated = localStorage.getItem('pc_migrated_v1');
    if (!migrated) {
      const migrate = async () => {
        console.log("Starting Migration to Firestore...");

        const localTxs = JSON.parse(localStorage.getItem('pc_txs') || '[]');
        if (localTxs.length > 0) await batchAddTransactions(localTxs);

        const localDonors = JSON.parse(localStorage.getItem('pc_donors') || '[]');
        if (localDonors.length > 0) await batchAddDonors(localDonors);

        const localEvents = JSON.parse(localStorage.getItem('pc_events') || '[]');
        if (localEvents.length > 0) await batchAddEvents(localEvents);

        const localTasks = JSON.parse(localStorage.getItem('pc_tasks') || '[]');
        if (localTasks.length > 0) await batchAddTasks(localTasks);

        const localPrograms = JSON.parse(localStorage.getItem('pc_programs') || '[]');
        if (localPrograms.length > 0) await batchAddPrograms(localPrograms);

        const localAnomalies = JSON.parse(localStorage.getItem('pc_anomalies') || '[]');
        if (localAnomalies.length > 0) await batchAddAnomalies(localAnomalies);

        const localUsers = JSON.parse(localStorage.getItem('pc_users') || JSON.stringify(initialUsers));
        // Ensure users have IDs if UserNode doesn't have one (it uses email as key usually)
        // We need to map them.
        const usersWithId = localUsers.map((u: any) => ({ ...u, id: u.email })); // Use email as ID
        await batchAddUsers(usersWithId);

        const localRequests = JSON.parse(localStorage.getItem('pc_pending_inductions') || '[]');
        if (localRequests.length > 0) await batchAddRequests(localRequests);

        const localActivities = JSON.parse(localStorage.getItem('pc_activities') || '[]');
        if (localActivities.length > 0) await batchAddActivities(localActivities);

        localStorage.setItem('pc_migrated_v1', 'true');
        console.log("Migration Completed.");
      };

      migrate();
    }
  }, []); // Run once on mount

  // Sort activities by timestamp desc
  const sortedActivities = [...activities].sort((a, b) => {
    return b.id.localeCompare(a.id);
  });

  const addActivity = (action: string, module: string, user?: string) => {
    const newAct: UserActivity = {
      id: `ACT-${Date.now()}`,
      user: user || userName,
      action,
      module,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addActivityDoc(newAct);
  };

  const handleInitialize = (role: string, name: string) => {
    setActiveRole(role);
    setUserName(name);
    setIsAuthenticated(true);
    localStorage.setItem('pc_auth', 'true');
    localStorage.setItem('pc_role', role);
    localStorage.setItem('pc_user', name);
    addActivity('Sincronía de enlace exitosa', 'AUTH', name);
  };

  const handleLogout = () => {
    addActivity('Nodo desvinculado', 'AUTH');
    setIsAuthenticated(false);
    localStorage.removeItem('pc_auth');
    localStorage.removeItem('pc_role');
    localStorage.removeItem('pc_user');
    setCurrentView(AppView.DASHBOARD);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard theme={theme} transactions={transactions} events={events} />;
      case AppView.LEDGER:
        return (
          <Ledger
            transactions={transactions}
            onAddTransaction={addTransaction}
            onUpdateTransaction={(t: Transaction) => updateTransaction(t.id, t)}
            onAddTransactions={(txs: Transaction[]) => batchAddTransactions(txs)}
            onAddActivity={addActivity}
          />
        );
      case AppView.DONORS:
        return (
          <DonorCRM
            donors={donors}
            onAddDonor={addDonor}
            onUpdateDonor={(d: Donor) => updateDonor(d.id, d)}
            onAddActivity={addActivity}
          />
        );
      case AppView.EVENTS:
        return (
          <Events
            events={events}
            onAddEvent={addEvent}
            onUpdateEvent={(e: Event) => updateEvent(e.id, e)}
            onAddActivity={addActivity}
          />
        );
      case AppView.PROGRAMS:
        return (
          <Programs
            programs={programs}
            onAddProgram={addProgram}
            onUpdateProgram={(p: ProgramImpact) => updateProgram(p.id, p)}
            onAddActivity={addActivity}
          />
        );
      case AppView.REPORTS:
        return <Reports transactions={transactions} donors={donors} tasks={tasks} events={events} programs={programs} />;
      case AppView.COMPLIANCE:
        return (
          <Compliance
            tasks={tasks}
            onAddTask={addTask}
            onUpdateTask={(t: ComplianceTask) => updateTask(t.id, t)}
            onAddActivity={addActivity}
          />
        );
      case AppView.PAYMENTS:
        return (
          <Payments
            transactions={transactions}
            onAddTransaction={addTransaction}
            onUpdateTransaction={(t: Transaction) => updateTransaction(t.id, t)}
            onAddActivity={addActivity}
          />
        );
      case AppView.RISK:
        return (
          <RiskAnalysis
            anomalies={anomalies}
            onAddAnomaly={addAnomaly}
            onUpdateAnomaly={(a: RiskAnomaly) => updateAnomaly(a.id, a)}
            onAddActivity={addActivity}
          />
        );
      case AppView.SETTINGS:
        return (
          <Settings
            theme={theme}
            activeRole={activeRole}
            userName={userName}
            onUpdateIdentity={(n, r) => { setUserName(n); setActiveRole(r); }}
            pendingRequests={pendingRequests}
            onUpdateInduction={(req: InductionRequest) => updateRequest(req.id, req)}
            onDeleteInduction={(id: string) => removeRequest(id)}
            approvedUsers={approvedUsers}
            onAddUser={addUser}
            onValidationAddUser={async (u: UserNode) => { await addUser({ ...u, id: u.email } as any); }}
            onDeleteUser={(email: string) => {
              removeUser(email);
            }}
            activities={sortedActivities}
            onAddActivity={addActivity}
          />
        );
      default: return <Dashboard theme={theme} transactions={[]} events={[]} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <Landing
        onInitialize={handleInitialize}
        onAddInduction={(req: InductionRequest) => { addRequest(req); addActivity(`Solicitud de inducción: ${req.name}`, 'LANDING'); }}
        approvedUsers={approvedUsers}
        theme={theme}
      />
    );
  }

  const themeClasses = {
    GNOSIS: 'bg-[#0f111a] text-slate-100',
    ABYSS: 'bg-black text-slate-200',
    BONE: 'bg-[#fdfbf7] text-slate-900'
  }[theme];

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-1000 ${themeClasses} relative font-sans`}>
      <Sidebar
        activeView={currentView}
        setView={setCurrentView}
        initialRole={userName}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden h-full w-full">
        <Layout
          currentView={currentView}
          onLogout={handleLogout}
          activeRole={`${userName} (${activeRole})`}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          setTheme={setTheme}
          setView={setCurrentView}
        >
          {renderView()}
        </Layout>

        <button
          onClick={() => setIsAssistantOpen(true)}
          className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all flex flex-col items-center justify-center z-[100] group overflow-hidden ${theme === 'BONE' ? 'bg-slate-900 text-white' : 'bg-white text-black'
            }`}
        >
          <div className="relative z-10 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
            <span className="text-[7px] font-black uppercase mt-1 tracking-widest">CHARITATE</span>
          </div>
        </button>

        {isAssistantOpen && (
          <AIAssistant onClose={() => setIsAssistantOpen(false)} theme={theme} />
        )}
      </main>
    </div>
  );
};

export default App;
