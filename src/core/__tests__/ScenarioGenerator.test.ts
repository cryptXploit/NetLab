import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { generateWrongGatewayPractice } from '../simulation/ScenarioGenerator';
import { InvariantChecker } from '../simulation/InvariantChecker';

describe('ScenarioGenerator', () => {
  it('should generate valid scenarios', () => {
    const eng = new SimulationEngine();
    const lab = generateWrongGatewayPractice(42);
    lab.initialState?.devices.forEach(d => eng.addDevice(d));
    lab.initialState?.links.forEach(l => eng.addLink(l));
    const res = InvariantChecker.checkInvariants(eng);
    expect(res.valid).toBe(true);
  });
});
