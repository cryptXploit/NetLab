import { useEffect } from 'react';
import { useSimulationStore } from './app/store/useSimulationStore';
import { TopologyView } from './ui/components/topology/TopologyView';
import { SimulationControls } from './ui/components/controls/SimulationControls';
import { PacketInspector } from './ui/components/inspector/PacketInspector';
import { Terminal } from './ui/components/terminal/Terminal';
import { AppHeader } from './ui/components/layout/AppHeader';
import { DeviceConfigPanel } from './ui/components/config/DeviceConfigPanel';

function App() {
  const loadBasicLab = useSimulationStore((state) => state.loadBasicLab);

  useEffect(() => {
    loadBasicLab();
  }, [loadBasicLab]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950 flex flex-col">
      <AppHeader />
      <div className="flex-1 relative overflow-hidden">
        <TopologyView />
        <SimulationControls />
        <PacketInspector />
        <Terminal />
        <DeviceConfigPanel />
      </div>
    </div>
  );
}

export default App;
