import React from 'react';
import { useProfileStore } from '../../../app/store/useProfileStore';
import { X, Award, Terminal, Zap, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ACHIEVEMENTS } from '../../../core/gamification/Achievements';
import * as Icons from 'lucide-react';
import { Download, Upload } from 'lucide-react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { BackupService } from '../../../core/persistence/BackupService';
import { useToastStore } from '../../../app/store/useToastStore';
import { db, type ActivityHistory } from '../../../core/persistence/db';

export const ProfileModal: React.FC = () => {
  const { totalXp, level, topicMastery, isProfileOpen, toggleProfile } = useProfileStore();
  const [history, setHistory] = useState<ActivityHistory[]>([]);
  const [backupPassword, setBackupPassword] = useState('');

    const engine = useSimulationStore(state => state.engine);
  const restoreSnapshot = useSimulationStore(state => state.restoreSnapshot);
  const initializeProfile = useProfileStore(state => state.initializeProfile);
  const addToast = useToastStore(state => state.addToast);

  const handleExport = async () => {
    try {
      const json = backupPassword.length > 0 
        ? await BackupService.exportProtectedBackup(engine, backupPassword)
        : await BackupService.exportBackup(engine);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'netlab-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('Backup Exported', 'Your profile and lab state have been downloaded.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Export Failed', 'An error occurred while generating the backup.', 'info');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let importedLab;
        if (parsed.isEncrypted) {
          if (!backupPassword) {
            addToast('Decryption Failed', 'Password required to decrypt this backup.', 'info');
            return;
          }
          importedLab = await BackupService.importProtectedBackup(text, backupPassword);
        } else {
          importedLab = await BackupService.importBackup(text);
        }
        
        await initializeProfile();
        restoreSnapshot(importedLab);
        
        addToast('Backup Restored', 'Profile and lab state have been successfully imported.', 'success');
      } catch (err: any) {
        console.error(err);
        if (err.name === 'OperationError' || err.message?.includes('decryption')) {
          addToast('Import Failed', 'Incorrect password or corrupted file.', 'info');
        } else {
          addToast('Import Failed', 'Invalid or corrupted backup file.', 'info');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

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
    <div className="absolute inset-0 bg-overlay flex items-center justify-center z-[200] backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-base border border-border-base rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border-base/50 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-surface border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Award className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary tracking-tight">Level {level} Technician</h2>
              <p className="text-secondary text-sm">Network Operations Center</p>
            </div>
          </div>
          <button 
            onClick={toggleProfile}
            className="text-muted hover:text-secondary transition-colors bg-surface p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Section */}
        <div className="p-6 bg-surface/30">
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm font-bold text-secondary uppercase tracking-wider">Total XP</span>
            <div className="text-right">
              <span className="text-xl font-black text-indigo-400">{totalXp}</span>
              <span className="text-xs text-muted ml-1">/ {xpForNextLevel}</span>
            </div>
          </div>
          <div className="h-3 w-full bg-surface rounded-full overflow-hidden border border-border-base">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            ></div>
          </div>
          <div className="text-right mt-1">
            <span className="text-[10px] text-muted">{xpForNextLevel - totalXp} XP to Level {level + 1}</span>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="p-6 flex flex-col gap-4 border-t border-border-base/50">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Topic Mastery</h3>
          
          <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border-base/80 hover:border-blue-500/30 transition-colors">
            <div className="p-3 bg-blue-900/20 text-accent rounded-lg">
              <Terminal className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-primary">Subnetting & CIDR</div>
              <div className="text-xs text-muted">IP Math, Masks, Broadcasts</div>
            </div>
            <div className="text-lg font-black text-accent">{topicMastery.subnetting} <span className="text-xs text-muted font-normal">XP</span></div>
          </div>

          <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border-base/80 hover:border-orange-500/30 transition-colors">
            <div className="p-3 bg-orange-900/20 text-warning rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-primary">Troubleshooting</div>
              <div className="text-xs text-muted">Fault isolation, diagnostics</div>
            </div>
            <div className="text-lg font-black text-warning">{topicMastery.troubleshooting} <span className="text-xs text-muted font-normal">XP</span></div>
          </div>
        </div>


        {/* Achievements Section */}
        <div className="p-6 pt-0 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
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
                      : 'bg-surface/30 border-border-base/50 opacity-50 grayscale'
                  }`}
                  title={ach.description}
                >
                  <div className={`p-2 rounded-full mb-2 ${isUnlocked ? 'bg-indigo-900/50 text-indigo-400' : 'bg-elevated text-muted'}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className={`text-xs font-bold leading-tight ${isUnlocked ? 'text-primary' : 'text-muted'}`}>
                    {ach.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="p-6 pt-0 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h3>
          {history.length === 0 ? (
            <div className="text-muted text-sm italic">No recent activity.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((record, idx) => (
                <div key={record.id || idx} className="flex items-center justify-between bg-surface/50 p-3 rounded-lg border border-border-base/50">
                  <div className="text-sm text-secondary">{record.description}</div>
                  <div className="text-xs font-bold text-success">+{record.xpEarned} XP</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data & Backup Section */}
        <div className="p-6 pt-0 flex flex-col gap-3 border-t border-border-base/50 mt-4 pt-4">
          <input
            type="password"
            placeholder="Backup Password (Optional)"
            className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-secondary focus:outline-none focus:border-indigo-500 transition-colors"
            value={backupPassword}
            onChange={(e) => setBackupPassword(e.target.value)}
          />
          <div className="flex justify-between gap-4">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-elevated hover:bg-border-strong text-secondary rounded-lg transition-colors text-sm font-bold border border-border-strong"
            >
              <Download className="w-4 h-4" />
              Export Backup
            </button>
            <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 rounded-lg transition-colors text-sm font-bold border border-indigo-500/40 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Backup
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
