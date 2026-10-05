import React, { useState } from 'react';
import { useSimulationStore } from '../../../app/store/useSimulationStore';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';
import { TopologyView } from '../topology/TopologyView';
import { SimulationControls } from '../controls/SimulationControls';
import { PacketContextSheet } from '../context/PacketContextSheet';
import { Terminal } from '../terminal/Terminal';
import { DeviceContextSheet } from '../context/DeviceContextSheet';
import { ConnectionSheet } from '../context/ConnectionSheet';
import { LabOverlay } from '../context/LabOverlay';
import { NetworkDoctorPanel } from '../doctor/NetworkDoctorPanel';
import { PredictionModal } from '../prediction/PredictionModal';
import { PredictionResultModal } from '../prediction/PredictionResultModal';
import { ShareLabModal } from '../sharing/ShareLabModal';
import { ImportLabModal } from '../sharing/ImportLabModal';
import { Stethoscope, ShieldAlert, Save, Library, MoreVertical, ChevronLeft } from 'lucide-react';
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
  const setTab = useWorkspaceStore(state => state.setTab);
  
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSaveLab = async () => {
    setMenuOpen(false);
    const name = window.prompt("Enter a name for this lab:");
    if (!name) return;
    try {
      await LibraryService.saveCurrentLab(engine, name);
      addToast('Lab Saved', `Successfully saved "${name}" to your library.`, 'success');
    } catch (e) {
      addToast('Save Failed', 'Failed to save the lab.', 'info');
    }
  };

  
  const handleDiagnose = () => {
    setMenuOpen(false);
    runDiagnostics();
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-base">
      
      {/* Top Workspace Bar */}
      <div className="absolute top-0 left-0 w-full bg-base/80 backdrop-blur-md border-b border-border-strong z-40 px-4 py-2 flex items-center justify-between pointer-events-auto">
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTab('home')}
            className="p-1.5 -ml-1.5 text-secondary hover:text-primary transition-colors rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-primary text-sm leading-tight">Untitled Network</h1>
            <p className="text-[10px] text-muted font-mono uppercase tracking-widest">Sandbox</p>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-secondary hover:text-primary hover:bg-elevated rounded-md transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {menuOpen && (
            <div className="absolute top-full mt-2 right-0 w-48 bg-surface border border-border-strong rounded-xl shadow-2xl py-2 flex flex-col pointer-events-auto z-50">
              <button 
                onClick={togglePredictionMode}
                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center justify-between"
              >
                Prediction Mode
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPredictionModeEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-border-strong text-muted'}`}>
                  {isPredictionModeEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
              
              <div className="h-px w-full bg-border-base my-1" />
              
              <button 
                onClick={handleDiagnose}
                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-accent" /> Network Doctor
              </button>
              
              <button 
                onClick={() => { setMenuOpen(false); injectFault('LINK_DOWN'); }}
                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-warning" /> Link Down Fault
              </button>
              <button 
                onClick={() => { setMenuOpen(false); injectFault('BAD_GATEWAY'); }}
                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-danger" /> Bad Gateway Fault
              </button>
              
              <div className="h-px w-full bg-border-base my-1" />
              
              <button 
                onClick={handleSaveLab}
                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-secondary" /> Save Lab
              </button>
              
              <button 
                onClick={() => { setMenuOpen(false); toggleLibrary(); }}
                className="px-4 py-2 text-left text-sm font-medium text-primary hover:bg-elevated flex items-center gap-2"
              >
                <Library className="w-4 h-4 text-secondary" /> Open Library
              </button>
            </div>
          )}
        </div>

      </div>
      
      {/* Main Canvas */}
      <TopologyView />
      
      {/* Contextual Action Layer */}
      <SimulationControls />
      <PacketContextSheet />
      <DeviceContextSheet />
      <ConnectionSheet />
      
      {/* Floating Modals / Overlays */}
      <Terminal />
      <NetworkDoctorPanel />
      <PredictionModal />
      <PredictionResultModal />
      <ShareLabModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      <ImportLabModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <LabLibraryModal />
    </div>
  );
};
