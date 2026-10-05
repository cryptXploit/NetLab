import React from 'react';
import { useProfileStore } from '../../../app/store/useProfileStore';
import { X, Award, Terminal, Zap, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ACHIEVEMENTS } from '../../../core/gamification/Achievements';
import * as Icons from 'lucide-react';
import { db, type ActivityHistory } from '../../../core/persistence/db';

export const ProfileModal: React.FC = () => {
  const { totalXp, level, topicMastery, isProfileOpen, toggleProfile } = useProfileStore();
  const [history, setHistory] = useState<ActivityHistory[]>([]);

  useEffect(() => {
    if (isProfileOpen) {
      db.history.orderBy('timestamp').reverse().limit(5).toArray().then(setHistory).catch(console.error);
    }
  }, [isProfileOpen, totalXp]);

  if (!isProfileOpen) return null;

  // Level thresholds (each level takes more XP)
  // Level 1: 0, Level 2: 100, Level 3: 400, Level 4: 900
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const progressPercent = ((totalXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[200] backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-800/50 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Award className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Level {level} Technician</h2>
              <p className="text-zinc-400 text-sm">Network Operations Center</p>
            </div>
          </div>
          <button 
            onClick={toggleProfile}
            className="text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-900 p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Section */}
        <div className="p-6 bg-zinc-900/30">
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Total XP</span>
            <div className="text-right">
              <span className="text-xl font-black text-indigo-400">{totalXp}</span>
              <span className="text-xs text-zinc-500 ml-1">/ {xpForNextLevel}</span>
            </div>
          </div>
          <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            ></div>
          </div>
          <div className="text-right mt-1">
            <span className="text-[10px] text-zinc-500">{xpForNextLevel - totalXp} XP to Level {level + 1}</span>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="p-6 flex flex-col gap-4 border-t border-zinc-800/50">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Topic Mastery</h3>
          
          <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800/80 hover:border-blue-500/30 transition-colors">
            <div className="p-3 bg-blue-900/20 text-blue-400 rounded-lg">
              <Terminal className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-zinc-200">Subnetting & CIDR</div>
              <div className="text-xs text-zinc-500">IP Math, Masks, Broadcasts</div>
            </div>
            <div className="text-lg font-black text-blue-400">{topicMastery.subnetting} <span className="text-xs text-zinc-600 font-normal">XP</span></div>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800/80 hover:border-orange-500/30 transition-colors">
            <div className="p-3 bg-orange-900/20 text-orange-400 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-zinc-200">Troubleshooting</div>
              <div className="text-xs text-zinc-500">Fault isolation, diagnostics</div>
            </div>
            <div className="text-lg font-black text-orange-400">{topicMastery.troubleshooting} <span className="text-xs text-zinc-600 font-normal">XP</span></div>
          </div>
        </div>


        {/* Achievements Section */}
        <div className="p-6 pt-0 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievements
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map(ach => {
              const isUnlocked = useProfileStore.getState().unlockedAchievements.includes(ach.id);
              const IconComponent = (Icons as any)[ach.icon] || Icons.Award;
              
              return (
                <div 
                  key={ach.id} 
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    isUnlocked 
                      ? 'bg-indigo-900/20 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                      : 'bg-zinc-900/30 border-zinc-800/50 opacity-50 grayscale'
                  }`}
                  title={ach.description}
                >
                  <div className={`p-2 rounded-full mb-2 ${isUnlocked ? 'bg-indigo-900/50 text-indigo-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {ach.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="p-6 pt-0 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h3>
          {history.length === 0 ? (
            <div className="text-zinc-600 text-sm italic">No recent activity.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((record, idx) => (
                <div key={record.id || idx} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                  <div className="text-sm text-zinc-300">{record.description}</div>
                  <div className="text-xs font-bold text-green-400">+{record.xpEarned} XP</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
