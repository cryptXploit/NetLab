import React from 'react';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { Network, Server, Share2, Activity, ShieldAlert } from 'lucide-react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';

const CATEGORIES = [
  { id: 'foundations', label: 'Foundations', icon: Network, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'switching', label: 'Switching', icon: Share2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'routing', label: 'Routing', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'services', label: 'Services', icon: Server, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' }
];

export const LabsView: React.FC = () => {
  const loadBasicLab = useSimulationStore(state => state.loadBasicLab);
  const setTab = useWorkspaceStore(state => state.setTab);

  const startDemoLab = () => {
    loadBasicLab();
    setTab('sandbox');
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-base text-primary pb-20 pt-8 px-4 md:px-8">
      
      <header className="mb-6">
        <h1 className="text-3xl font-black tracking-tight mb-2">Labs</h1>
        <p className="text-secondary">Master networking through interactive simulations.</p>
      </header>

      <div className="flex flex-col gap-6 max-w-2xl w-full">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${cat.bg} ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">{cat.label}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cat.id === 'foundations' ? (
                  <div 
                    onClick={startDemoLab}
                    className="bg-surface border border-border-base rounded-xl p-5 hover:border-accent cursor-pointer transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-accent bg-accent-soft px-2 py-0.5 rounded uppercase tracking-wide">Beginner</span>
                      <span className="text-xs font-medium text-muted">6 min</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Packet Journey</h3>
                    <p className="text-sm text-secondary">Follow a packet from client to server and learn how it moves.</p>
                  </div>
                ) : (
                  <div className="bg-surface border border-border-base rounded-xl p-5 opacity-50 flex items-center justify-center min-h-[120px]">
                    <span className="text-sm font-medium text-muted">More labs coming soon</span>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

    </div>
  );
};
