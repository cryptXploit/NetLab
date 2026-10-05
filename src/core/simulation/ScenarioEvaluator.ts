import { SimulationEngine } from './SimulationEngine';
import { SimulationEventType } from '../events/SimulationEvent';
import type { VerificationRule } from '../domain/Lab';

export function evaluateRules(rules: VerificationRule[], engine: SimulationEngine): boolean {
  if (rules.length === 0) return true;

  const history = engine.getEventHistory();

  for (const rule of rules) {
    if (rule.type === 'PACKET_DELIVERED') {
      const delivered = history.some(e => {
        if (e.type !== SimulationEventType.PACKET_DELIVERED) return false;
        const p = e.payload.packet;
        if (!p) return false;

        if (rule.protocol && p.protocol !== rule.protocol) return false;
        if (rule.sourceIp && p.sourceIp !== rule.sourceIp) return false;
        if (rule.destinationIp && p.destinationIp !== rule.destinationIp) return false;
        
        return true;
      });
      if (!delivered) return false;
    } 
    else if (rule.type === 'INTERFACE_IP') {
      const device = engine.getDevice(rule.deviceId || '');
      if (!device) return false;
      const iface = device.interfaces.find(i => i.id === rule.interfaceId);
      if (!iface || iface.ipAddress !== rule.expectedIp) return false;
    }
    else if (rule.type === 'ROUTE_EXISTS') {
      const device = engine.getDevice(rule.deviceId || '');
      if (!device) return false;
      const route = device.routingTable.find(r => 
        r.network === rule.network && 
        r.prefix === rule.prefix && 
        (rule.nextHop ? r.nextHop === rule.nextHop : true)
      );
      if (!route) return false;
    }
    else {
      // Unsupported rule type
      return false;
    }
  }

  return true;
}
