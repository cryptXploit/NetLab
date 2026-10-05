import { db, type SavedLab } from './db';
import { SimulationEngine } from '../simulation/SimulationEngine';

export class LibraryService {
  static async saveCurrentLab(engine: SimulationEngine, name: string): Promise<void> {
    const snapshot = engine.createSnapshot();
    
    // Strip active/volatile state just like sharing
    const strippedSnapshot = {
      devices: snapshot.devices,
      links: snapshot.links,
      eventQueue: [],
      eventHistory: [],
      activePackets: [],
      currentTick: 0
    };

    const newLab: SavedLab = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      snapshot: strippedSnapshot
    };

    await db.savedLabs.add(newLab);
  }

  static async getSavedLabs(): Promise<SavedLab[]> {
    return await db.savedLabs.orderBy('createdAt').reverse().toArray();
  }

  static async deleteLab(id: string): Promise<void> {
    await db.savedLabs.delete(id);
  }
}
