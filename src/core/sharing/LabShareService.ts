import LZString from 'lz-string';
import { SimulationEngine, type SimulationState } from '../simulation/SimulationEngine';

export class LabShareService {
  static exportLabToHash(engine: SimulationEngine): string {
    const snapshot = engine.createSnapshot();
    
    // Strip out active packets and history for compact sharing
    const strippedLab = {
      devices: snapshot.devices,
      links: snapshot.links
    };

    const jsonStr = JSON.stringify(strippedLab);
    return LZString.compressToEncodedURIComponent(jsonStr);
  }

  static importLabFromHash(hash: string): SimulationState {
    const jsonStr = LZString.decompressFromEncodedURIComponent(hash);
    if (!jsonStr) {
      throw new Error('Invalid or corrupted lab hash.');
    }

    const parsed = JSON.parse(jsonStr);
    
    // Ensure we have devices and links at minimum
    if (!Array.isArray(parsed.devices) || !Array.isArray(parsed.links)) {
      throw new Error('Corrupted lab data: Missing devices or links.');
    }

    return {
      devices: parsed.devices,
      links: parsed.links,
      eventQueue: [],
      eventHistory: [],
      activePackets: [],
      currentTick: 0
    };
  }
}
