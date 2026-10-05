import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../simulation/SimulationEngine';
import { createHost, createRouter } from '../domain/Device';
import { createNetworkInterface } from '../domain/NetworkInterface';
import { createLink } from '../domain/Link';
import { evaluateNetworkHealth } from '../simulation/NetworkDoctor';
import { injectLinkFailure, injectWrongGateway } from '../simulation/FaultInjector';

describe('NetworkDoctor', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();

    const ifaceA = createNetworkInterface('if-A', 'AA:AA:AA:AA:AA:AA', '192.168.1.10');
    const hostA = createHost('hostA', 'Host A', [ifaceA]);
    hostA.routingTable = [{ network: '0.0.0.0', prefix: 0, nextHop: '192.168.1.1', interfaceId: 'if-A' }];

    const ifaceR1_1 = createNetworkInterface('if-R1-1', 'R1:R1:R1:R1:R1:01', '192.168.1.1');
    const router = createRouter('router1', 'R1', [ifaceR1_1]);

    const link = createLink('link1', 'if-A', 'if-R1-1');

    engine.addDevice(hostA);
    engine.addDevice(router);
    engine.addLink(link);
  });

  it('reports healthy when no faults exist', () => {
    const report = evaluateNetworkHealth(engine);
    expect(report.isHealthy).toBe(true);
    expect(report.issues.length).toBe(0);
  });

  it('detects disconnected link anomaly', () => {
    injectLinkFailure(engine, 'link1');
    const report = evaluateNetworkHealth(engine);
    
    expect(report.isHealthy).toBe(false);
    expect(report.issues).toContain('Physical layer anomaly: Link link1 is disconnected.');
  });

  it('detects routing anomaly when gateway is bad', () => {
    injectWrongGateway(engine, 'hostA', '192.168.1.99');
    const report = evaluateNetworkHealth(engine);
    
    expect(report.isHealthy).toBe(false);
    expect(report.issues).toContain('Routing anomaly on Host A: Invalid next-hop gateway (192.168.1.99).');
  });

  it('detects multiple anomalies concurrently', () => {
    injectLinkFailure(engine, 'link1');
    injectWrongGateway(engine, 'hostA', '192.168.1.99');
    const report = evaluateNetworkHealth(engine);
    
    expect(report.isHealthy).toBe(false);
    expect(report.issues.length).toBe(2);
  });
});
