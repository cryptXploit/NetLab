import React, { useState, useRef } from 'react';
import { X, Download, Upload, AlertTriangle, ShieldAlert } from 'lucide-react';
import { BackupService } from '../../../core/persistence/BackupService';
import { HapticService } from '../../../core/native/HapticService';
import { useToastStore } from '../../../app/store/useToastStore';

interface DataBackupModalProps {
  onClose: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'IDLE' | 'IMPORT_CONFIRM' | 'RESET_CONFIRM'>('IDLE');
  const [importData, setImportData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useToastStore(state => state.addToast);

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const data = await BackupService.exportBackup();
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `netlab-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      HapticService.success();
      addToast('Backup exported successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export backup', 'error');
      HapticService.error();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      addToast('Backup file is too large', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        // Pre-validate before asking for confirmation
        BackupService.validateBackup(text);
        setImportData(text);
        setStep('IMPORT_CONFIRM');
        HapticService.selection();
      } catch (err: any) {
        addToast(err.message || 'Invalid backup file', 'error');
        HapticService.error();
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const confirmImport = async () => {
    if (!importData) return;
    try {
      setIsProcessing(true);
      await BackupService.importBackup(importData);
      HapticService.success();
      addToast('Backup restored successfully', 'success');
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to restore backup', 'error');
      HapticService.error();
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmReset = async () => {
    try {
      setIsProcessing(true);
      await BackupService.resetAllData();
      HapticService.success();
      addToast('All data has been reset', 'success');
      onClose();
    } catch (err) {
      addToast('Failed to reset data', 'error');
      HapticService.error();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border-base rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-border-base bg-elevated">
          <h2 className="text-lg font-bold text-primary">Data & Backup</h2>
          <button onClick={onClose} disabled={isProcessing} className="p-2 -mr-2 text-muted hover:text-primary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {step === 'IDLE' && (
            <>
              <p className="text-sm text-secondary">
                Your data is stored securely and offline on your device. You can back it up to a file and restore it later.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-between p-4 bg-elevated border border-border-strong rounded-xl hover:border-accent transition-colors"
                >
                  <div className="flex items-center gap-3 text-primary font-medium">
                    <Download className="w-5 h-5 text-accent" />
                    Export Backup
                  </div>
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-between p-4 bg-elevated border border-border-strong rounded-xl hover:border-accent transition-colors"
                >
                  <div className="flex items-center gap-3 text-primary font-medium">
                    <Upload className="w-5 h-5 text-accent" />
                    Import Backup
                  </div>
                </button>
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </div>

              <div className="pt-4 border-t border-border-base mt-2">
                <button 
                  onClick={() => setStep('RESET_CONFIRM')}
                  disabled={isProcessing}
                  className="w-full p-4 flex items-center justify-center gap-2 text-red-500 font-medium bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                >
                  <ShieldAlert className="w-5 h-5" />
                  Reset All Local Data
                </button>
              </div>
            </>
          )}

          {step === 'IMPORT_CONFIRM' && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-primary">Overwrite Current Data?</h3>
              <p className="text-sm text-secondary">
                Importing this backup will completely replace your current labs, practice history, and settings. This cannot be undone.
              </p>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setStep('IDLE')}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-elevated border border-border-strong rounded-xl font-bold text-primary"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmImport}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-bold text-black transition-colors"
                >
                  {isProcessing ? 'Restoring...' : 'Yes, Restore'}
                </button>
              </div>
            </div>
          )}

          {step === 'RESET_CONFIRM' && (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-2">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-primary">Reset Everything?</h3>
              <p className="text-sm text-secondary">
                Are you absolutely sure you want to delete all saved networks, mastery history, and preferences? This will return the app to a blank state.
              </p>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setStep('IDLE')}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-elevated border border-border-strong rounded-xl font-bold text-primary"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmReset}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-white transition-colors"
                >
                  {isProcessing ? 'Resetting...' : 'Yes, Delete All'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
