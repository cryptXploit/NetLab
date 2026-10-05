import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { generateRandomTroubleshootingLab } from '../simulation/ScenarioGenerator';
import { InvariantChecker } from '../simulation/InvariantChecker';

describe('ScenarioGenerator', () => {
  it('should generate valid scenarios', () => {
    const eng = new SimulationEngine();
    generateRandomTroubleshootingLab(eng);
    const res = InvariantChecker.checkInvariants(eng);
    expect(res.valid).toBe(true);
  });
});
