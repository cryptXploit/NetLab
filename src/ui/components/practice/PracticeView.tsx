import React, { useMemo } from 'react';
import { usePracticeStore } from '../../../app/store/usePracticeStore';
import { Play, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { generateWrongGatewayPractice } from '../../../core/simulation/ScenarioGenerator';
import { RecommendationEngine } from '../../../core/learning/RecommendationEngine';
import { MasteryEngine } from '../../../core/learning/MasteryEngine';
import type { SkillMastery } from '../../../core/learning/MasteryEngine';

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

    startPractice('generated-gw', 'Troubleshooting' as any, seed, labDef.skills, labDef.difficulty);
    setTab('sandbox');
  };

  const { recommendation, allMastery } = useMemo(() => {
    const rec = RecommendationEngine.recommendNext(history);
    const profs: SkillMastery[] = [];
    for (const skill of RecommendationEngine.ALL_SKILLS) {
      const attempts = history.filter(h => h.skills?.includes(skill));
      profs.push(MasteryEngine.calculateMastery(skill, attempts));
    }
    return { recommendation: rec, allMastery: profs };
  }, [history]);

  const strongSkills = allMastery.filter(s => s.score >= 80 && s.state !== 'UNSEEN');
  const weakSkills = allMastery.filter(s => s.score < 80 && s.state !== 'UNSEEN');

  return (
    <div className="w-full h-full flex flex-col bg-base overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-primary mb-2">Practice Engine</h1>
        <p className="text-secondary mb-8">Test your skills, track your mastery, and get intelligent recommendations.</p>
        
        {/* RECOMMENDATION ENGINE */}
        {recommendation && (
          <div className="bg-accent/10 border-2 border-accent rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target className="w-24 h-24 text-accent" />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-bold text-accent uppercase tracking-wider mb-2 block flex items-center gap-2">
                <Zap className="w-4 h-4" /> Recommended Next Step
              </span>
              <h2 className="text-xl font-bold text-primary mb-2">{recommendation.scenario.title}</h2>
              <p className="text-sm text-primary font-medium mb-1">{recommendation.reason}</p>
              <p className="text-xs text-secondary mb-6">{recommendation.scenario.description}</p>
              <button 
                onClick={handleStart}
                className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-accent/20 hover:bg-accent-hover transition-colors"
              >
                <Play className="w-4 h-4 fill-current" /> Start Challenge
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* MASTERY OVERVIEW */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" /> Strong Skills
            </h2>
            {strongSkills.length === 0 ? (
              <p className="text-sm text-muted">Keep practicing to build your mastery.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {strongSkills.map(s => (
                  <span key={s.skill} className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-bold">
                    {s.skill} ({s.score}%)
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-danger" /> Needs Work
            </h2>
            {weakSkills.length === 0 ? (
              <p className="text-sm text-muted">No weaknesses detected. Great job!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {weakSkills.map(s => (
                  <span key={s.skill} className="px-3 py-1 bg-danger/10 text-danger border border-danger/20 rounded-full text-xs font-bold">
                    {s.skill} ({s.state})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold text-primary mb-4">Your History</h2>
        {history.length === 0 ? (
          <div className="bg-surface border border-border border-dashed rounded-xl p-8 text-center text-muted">
            No practice attempts yet.
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice().reverse().map(attempt => (
              <div key={attempt.id} className="bg-surface border border-border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-primary">{attempt.type} Practice</p>
                  <p className="text-xs text-secondary mb-1">
                    {new Date(attempt.startTime).toLocaleDateString()} • Mistakes: {attempt.mistakes} • Hints: {attempt.hintsUsed}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {attempt.skills?.map(s => (
                      <span key={s} className="text-[10px] bg-elevated px-1.5 py-0.5 rounded text-muted uppercase">
                        {s}
                      </span>
                    ))}
                  </div>
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
