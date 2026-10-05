import { useEffect } from 'react';
import { useSimulationStore } from './app/store/useSimulationStore';
import { useWorkspaceStore } from './app/store/useWorkspaceStore';
import { TopologyView } from './ui/components/topology/TopologyView';
import { SimulationControls } from './ui/components/controls/SimulationControls';
import { PacketInspector } from './ui/components/inspector/PacketInspector';
import { Terminal } from './ui/components/terminal/Terminal';
import { AppHeader } from './ui/components/layout/AppHeader';
import { DeviceConfigPanel } from './ui/components/config/DeviceConfigPanel';
import { NetworkDoctorPanel } from './ui/components/doctor/NetworkDoctorPanel';
import { PredictionModal } from './ui/components/prediction/PredictionModal';
import { PredictionResultModal } from './ui/components/prediction/PredictionResultModal';

import { PracticeView } from './ui/components/practice/PracticeView';

import { ProfileModal } from './ui/components/profile/ProfileModal';
import { ToastContainer } from './ui/components/notifications/ToastContainer';

import { useProfileStore } from './app/store/useProfileStore';
import { useSettingsStore } from './app/store/useSettingsStore';
import { SettingsModal } from './ui/components/settings/SettingsModal';
import { LabLibraryModal } from './ui/components/library/LabLibraryModal';
import { TutorialOverlay } from './ui/components/tutorial/TutorialOverlay';
import { useTutorialStore } from './app/store/useTutorialStore';
import { AppBootService } from './core/native/AppBootService';

function App() {
  const loadBasicLab = useSimulationStore((state) => state.loadBasicLab);
  const currentView = useWorkspaceStore(state => state.currentView);
  const initializeProfile = useProfileStore((state) => state.initializeProfile);
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);
  const isProfileLoaded = useProfileStore((state) => state.isLoaded);
  const startTutorial = useTutorialStore((state) => state.startTutorial);

  useEffect(() => {
    loadBasicLab();
    initializeProfile();
    initializeSettings();
    AppBootService.initializeNativeApp();
  }, [loadBasicLab, initializeProfile, initializeSettings]);

  useEffect(() => {
    if (isProfileLoaded) {
      const state = useProfileStore.getState() as any;
      if (!state.tutorialCompleted) {
        startTutorial();
      }
    }
  }, [isProfileLoaded, startTutorial]);

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-zinc-950 flex flex-col">
      <div className="order-2 md:order-1 w-full shrink-0 z-50">
        <AppHeader />
      </div>
      <div className="flex-1 relative w-full h-full overflow-hidden order-1 md:order-2 z-0">
        {currentView === 'LAB' ? (
          <>
            <TopologyView />
            <SimulationControls />
            <PacketInspector />
            <Terminal />
            <DeviceConfigPanel />
            <NetworkDoctorPanel />
            <PredictionModal />
            <PredictionResultModal />
          </>
        ) : (
          <PracticeView />
        )}
      </div>
      <ProfileModal />
      <SettingsModal />
      <LabLibraryModal />
      <ToastContainer />
      <TutorialOverlay />
    </div>
  );
}

export default App;
