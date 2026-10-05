import React from 'react';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { Play, Hexagon } from 'lucide-react';

export const HomeView: React.FC = () => {
  const setTab = useWorkspaceStore(state => state.setTab);

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-base text-primary pb-20 pt-8 px-4 md:px-8">
      
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">NETLAB</h1>
        <p className="text-secondary text-lg">What do you want to learn today?</p>
      </header>

      <div className="flex flex-col gap-4 max-w-lg w-full mb-8">
        <button 
          onClick={() => setTab('labs')}
          className="flex items-center p-6 bg-accent rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] text-white w-full text-left overflow-hidden relative group"
        >
          <div className="flex-1 relative z-10">
            <h2 className="text-2xl font-bold mb-1">Start First Lab</h2>
            <p className="text-white/80">Packet Journey — Your First Network</p>
          </div>
          <div className="p-4 bg-white/20 rounded-full relative z-10 group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 fill-white" />
          </div>
        </button>

        <button 
          onClick={() => setTab('sandbox')}
          className="flex items-center p-6 bg-elevated border border-border-strong rounded-2xl hover:bg-border-strong transition-all active:scale-[0.98] w-full text-left"
        >
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1 text-primary">Open Sandbox</h2>
            <p className="text-secondary text-sm">Build and experiment with custom topologies.</p>
          </div>
          <div className="p-3 bg-surface rounded-full text-accent shadow-sm border border-border-base">
            <Hexagon className="w-6 h-6" />
          </div>
        </button>
      </div>

      <section className="mb-8 max-w-lg w-full">
        <h3 className="text-lg font-bold mb-4 text-primary">Recent Activity</h3>
        <div className="bg-surface border border-border-base rounded-xl p-6 text-center text-secondary">
          <p className="text-sm">No recent activity.</p>
          <button 
            onClick={() => setTab('labs')}
            className="mt-3 text-accent font-medium text-sm hover:underline"
          >
            Start learning
          </button>
        </div>
      </section>

    </div>
  );
};
