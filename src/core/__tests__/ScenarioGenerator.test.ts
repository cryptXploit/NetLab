import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { generateRandomTroubleshootingLab } from '../simulation/ScenarioGenerator';
import { evaluateNetworkHealth } from '../simulation/NetworkDoctor';

describe('ScenarioGenerator', () => {
  it('generates a 3-device topology with exactly one fault', () => {
    const engine = new SimulationEngine();
    generateRandomTroubleshootingLab(engine);

    const devices = engine.getDevices();
    const links = engine.getLinks();

    expect(devices.length).toBe(3);
    
    const hosts = devices.filter(d => d.type === 'HOST');
    const routers = devices.filter(d => d.type === 'ROUTER');
    
    expect(hosts.length).toBe(2);
    expect(routers.length).toBe(1);
    expect(links.length).toBe(2);

    // Verify it is unhealthy
    const health = evaluateNetworkHealth(engine);
    expect(health.isHealthy).toBe(false);
    expect(health.issues.length).toBeGreaterThanOrEqual(1);
  });
});
