import React, { useState } from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { TopologyView } from '../topology/TopologyView';
import { SimulationControls } from '../controls/SimulationControls';
import { PacketInspector } from '../inspector/PacketInspector';
import { Terminal } from '../terminal/Terminal';
import { DeviceConfigPanel } from '../config/DeviceConfigPanel';
import { NetworkDoctorPanel } from '../doctor/NetworkDoctorPanel';
import { PredictionModal } from '../prediction/PredictionModal';
import { PredictionResultModal } from '../prediction/PredictionResultModal';
import { ShareLabModal } from '../sharing/ShareLabModal';
import { ImportLabModal } from '../sharing/ImportLabModal';
import { Stethoscope, ShieldAlert, Save, Library } from 'lucide-react';
import { useLibraryStore } from '../../../app/store/useLibraryStore';
import { useToastStore } from '../../../app/store/useToastStore';
import { LibraryService } from '../../../core/persistence/LibraryService';
import { LabLibraryModal } from '../library/LabLibraryModal';

export const SandboxView: React.FC = () => {
  const isPredictionModeEnabled = useWorkspaceStore(state => state.isPredictionModeEnabled);
  const togglePredictionMode = useWorkspaceStore(state => state.togglePredictionMode);
  const runDiagnostics = useWorkspaceStore(state => state.runDiagnostics);
  const toggleLibrary = useLibraryStore(state => state.toggleLibrary);
  const injectFault = useSimulationStore(state => state.injectFault);
  const engine = useSimulationStore(state => state.engine);
  const addToast = useToastStore(state => state.addToast);
  
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleSaveLab = async () => {
    const name = window.prompt("Enter a name for this lab:");
    if (!name) return;
    try {
      await LibraryService.saveCurrentLab(engine, name);
      addToast('Lab Saved', `Successfully saved "${name}" to your library.`, 'success');
    } catch (e) {
      addToast('Save Failed', 'Failed to save the lab.', 'info');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-base">
      
      {/* Sandbox Minimal Top Bar */}
      <div className="absolute top-0 left-0 w-full bg-elevated/80 backdrop-blur-md border-b border-border-strong z-40 px-4 py-2 flex items-center justify-between">
        <h1 className="font-bold text-primary text-sm tracking-widest uppercase">Sandbox Workspace</h1>
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          
          <button 
            onClick={togglePredictionMode}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              isPredictionModeEnabled 
                ? 'bg-purple-900/50 text-purple-300 border border-purple-500/50' 
                : 'bg-surface text-secondary hover:text-primary border border-border-base'
            }`}
          >
            Prediction: {isPredictionModeEnabled ? 'ON' : 'OFF'}
          </button>
          
          <button 
            onClick={runDiagnostics}
            className="p-1.5 text-accent hover:bg-accent-soft rounded-md transition-colors"
            title="Network Doctor"
          >
            <Stethoscope className="w-5 h-5" />
          </button>

          <button 
            onClick={() => injectFault('LINK_DOWN')}
            className="p-1.5 text-danger hover:bg-danger/20 rounded-md transition-colors"
            title="Inject Fault"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-border-strong mx-1" />

          <button 
            onClick={handleSaveLab}
            className="p-1.5 text-secondary hover:text-primary hover:bg-surface rounded-md transition-colors"
            title="Save Lab"
          >
            <Save className="w-5 h-5" />
          </button>
          
          <button 
            onClick={toggleLibrary}
            className="p-1.5 text-secondary hover:text-primary hover:bg-surface rounded-md transition-colors"
            title="Library"
          >
            <Library className="w-5 h-5" />
          </button>

        </div>
      </div>
      
      <TopologyView />
      <SimulationControls />
      <PacketInspector />
      <Terminal />
      <DeviceConfigPanel />
      <NetworkDoctorPanel />
      <PredictionModal />
      <PredictionResultModal />
      
      <ShareLabModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      <ImportLabModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <LabLibraryModal />
    </div>
  );
};
