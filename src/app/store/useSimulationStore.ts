import { create } from 'zustand';
import { SimulationEngine } from '../../core/simulation/SimulationEngine';
import { createHost, createRouter, type Device } from '../../core/domain/Device';
import { createNetworkInterface } from '../../core/domain/NetworkInterface';
import { createLink, type Link } from '../../core/domain/Link';
import { type SimulationEvent } from '../../core/events/SimulationEvent';

interface SimulationStoreState {
  engine: SimulationEngine;
  devices: Device[];
  links: Link[];
  currentTick: number;
  eventHistory: SimulationEvent[];
  
  initLab: () => void;
  stepForward: () => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationStoreState>((set, get) => {
  const engine = new SimulationEngine();

  return {
    engine,
    devices: [],
    links: [],
    currentTick: 0,
    eventHistory: [],

    initLab: () => {
      // Clear existing state by creating a new engine instance if needed, 
      // but for now we just use the same engine and assume it's fresh.
      // Wait, there's no `engine.clear()` method, so we instantiate a new one.
      const newEngine = new SimulationEngine();
      
      const iface1 = createNetworkInterface('if-host1', '00:00:00:00:00:01', '192.168.1.10');
      const host1 = createHost('host1', 'PC-1', [iface1]);
      host1.metadata = { x: 200, y: 300 };

      const iface2 = createNetworkInterface('if-router1', '00:00:00:00:00:02', '192.168.1.1');
      const router1 = createRouter('router1', 'R1', [iface2]);
      router1.metadata = { x: 600, y: 300 };

      const link1 = createLink('link1', 'if-host1', 'if-router1');

      newEngine.addDevice(host1);
      newEngine.addDevice(router1);
      newEngine.addLink(link1);

      set({ engine: newEngine });
      
      // We must call syncState after updating the engine reference 
      // but since we don't have it locally in this scope without `get().engine`, we use the new one:
      set({
        devices: newEngine.getDevices(),
        links: newEngine.getLinks(),
        currentTick: newEngine.getCurrentTick(),
        eventHistory: newEngine.getEventHistory(),
      });
    },

    stepForward: () => {
      const currentEngine = get().engine;
      currentEngine.tick(1);
      set({
        devices: currentEngine.getDevices(),
        links: currentEngine.getLinks(),
        currentTick: currentEngine.getCurrentTick(),
        eventHistory: currentEngine.getEventHistory(),
      });
    },

    reset: () => {
      // Re-initialize from scratch
      get().initLab();
    }
  };
});
