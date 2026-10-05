import { useEffect } from 'react';
import { useSimulationStore } from './app/store/useSimulationStore';
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

function App() {
  const loadBasicLab = useSimulationStore((state) => state.loadBasicLab);
  const currentView = useSimulationStore((state) => state.currentView);
  const initializeProfile = useProfileStore((state) => state.initializeProfile);

  useEffect(() => {
    loadBasicLab();
    initializeProfile();
  }, [loadBasicLab, initializeProfile]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950 flex flex-col">
      <AppHeader />
      <div className="flex-1 relative overflow-hidden">
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
      <ToastContainer />
    </div>
  );
}

export default App;
