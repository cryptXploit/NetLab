import React from 'react';
import { usePracticeStore } from '../../../app/store/usePracticeStore';
import { Play } from 'lucide-react';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { generateWrongGatewayPractice } from '../../../core/simulation/ScenarioGenerator';

export const PracticeView: React.FC = () => {
  const history = usePracticeStore(state => state.history);
  const startPractice = usePracticeStore(state => state.startPractice);
  const setTab = useWorkspaceStore(state => state.setTab);
  const resetEngine = useSimulationStore(state => state.reset);
  const engine = useSimulationStore(state => state.engine);
  
  const handleStart = () => {
    // Generate a random seed for this practice attempt
    const seed = Math.floor(Math.random() * 10000).toString();
    
    resetEngine();
    engine.clear();
    
    // Generate the deterministic scenario
    const labDef = generateWrongGatewayPractice(parseInt(seed));
    
    if (labDef.initialState) {
      labDef.initialState.devices.forEach(d => engine.addDevice(d));
      labDef.initialState.links.forEach(l => engine.addLink(l));
    }
    
    // Sync store
    useSimulationStore.setState({
      devices: engine.getDevices(),
      links: engine.getLinks()
    });

    startPractice('generated-gw', 'Troubleshooting' as any, seed);
    setTab('sandbox');
  };

  return (
    <div className="w-full h-full flex flex-col bg-base overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-primary mb-2">Practice Engine</h1>
        <p className="text-secondary mb-8">Test your skills without guidance.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent transition-colors">
            <h2 className="font-bold text-lg text-primary mb-2">Wrong Gateway Challenge</h2>
            <p className="text-sm text-secondary mb-6">A randomly generated IP configuration issue. Diagnose and fix it using standard tools.</p>
            <button 
              onClick={handleStart}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition-colors"
            >
              <Play className="w-4 h-4" /> Start Challenge
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-primary mb-4">Your History</h2>
        {history.length === 0 ? (
          <div className="bg-surface border border-border border-dashed rounded-xl p-8 text-center text-muted">
            No practice attempts yet.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(attempt => (
              <div key={attempt.id} className="bg-surface border border-border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-primary">{attempt.type} Practice</p>
                  <p className="text-xs text-secondary">
                    {new Date(attempt.startTime).toLocaleDateString()} • Mistakes: {attempt.mistakes} • Hints: {attempt.hintsUsed}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded text-sm font-bold ${
                  attempt.result === 'SUCCESS' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}>
                  {attempt.result === 'SUCCESS' ? `SUCCESS (${attempt.score})` : attempt.result || 'IN PROGRESS'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
