import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { InvariantChecker } from '../simulation/InvariantChecker';
import { createHost } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createLink } from '../domain/Link';

describe('InvariantChecker', () => {
  it('should validate a clean engine', () => {
    const eng = new SimulationEngine();
    const res = InvariantChecker.checkInvariants(eng);
    expect(res.valid).toBe(true);
  });

  it('should catch duplicate interface bindings', () => {
    const eng = new SimulationEngine();
    const iface1 = createNetworkInterface('if1', 'MAC1', '10.0.0.1');
    const iface2 = createNetworkInterface('if2', 'MAC2', '10.0.0.2');
    const iface3 = createNetworkInterface('if3', 'MAC3', '10.0.0.3');
    eng.addDevice(createHost('h1', 'H1', [iface1]));
    eng.addDevice(createHost('h2', 'H2', [iface2, iface3]));

    eng.addLink(createLink('link1', 'if1', 'if2'));
    eng.addLink(createLink('link2', 'if1', 'if3')); // if1 is bound twice

    const res = InvariantChecker.checkInvariants(eng);
    expect(res.valid).toBe(false);
    expect(res.errors).toContain('Interface if1 is occupied by multiple links');
  });
});
