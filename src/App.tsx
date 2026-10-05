import { useEffect } from 'react';
import { useSimulationStore } from './app/store/useSimulationStore';
import { TopologyView } from './ui/components/topology/TopologyView';
import { SimulationControls } from './ui/components/controls/SimulationControls';
import { PacketInspector } from './ui/components/inspector/PacketInspector';

function App() {
  const initLab = useSimulationStore((state) => state.initLab);

  useEffect(() => {
    initLab();
  }, [initLab]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950">
      <TopologyView />
      <SimulationControls />
      <PacketInspector />
    </div>
  );
}

export default App;
