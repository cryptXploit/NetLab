import { useEffect } from 'react';
import { useSimulationStore } from './app/store/useSimulationStore';
import { useWorkspaceStore } from './app/store/useWorkspaceStore';
import { PracticeView } from './ui/components/practice/PracticeView';
import { ToastContainer } from './ui/components/notifications/ToastContainer';
import { useProfileStore } from './app/store/useProfileStore';
import { useSettingsStore } from './app/store/useSettingsStore';
import { TutorialOverlay } from './ui/components/tutorial/TutorialOverlay';
import { useTutorialStore } from './app/store/useTutorialStore';
import { AppBootService } from './core/native/AppBootService';
import { ErrorBoundary } from './ui/components/core/ErrorBoundary';

// Mobile Shell Components
import { BottomNav } from './ui/components/navigation/BottomNav';
import { HomeView } from './ui/components/screens/HomeView';
import { LabsView } from './ui/components/screens/LabsView';
import { ProfileView } from './ui/components/screens/ProfileView';
import { SandboxView } from './ui/components/screens/SandboxView';

function App() {
  const loadBasicLab = useSimulationStore((state) => state.loadBasicLab);
  const currentTab = useWorkspaceStore(state => state.currentTab);
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
    <ErrorBoundary>
      <div className="relative h-[100dvh] w-screen overflow-hidden bg-base flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full overflow-hidden z-0">
        
        {currentTab === 'home' && <HomeView />}
        {currentTab === 'labs' && <LabsView />}
        {currentTab === 'practice' && <PracticeView />}
        {currentTab === 'profile' && <ProfileView />}
        
        {/* Sandbox is always rendered but hidden if not active to preserve heavy DOM state */}
        <div style={{ display: currentTab === 'sandbox' ? 'block' : 'none', width: '100%', height: '100%' }}>
          <SandboxView />
        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Overlays */}
      <ToastContainer />
      <TutorialOverlay />
    </div>
    </ErrorBoundary>
  );
}

export default App;
