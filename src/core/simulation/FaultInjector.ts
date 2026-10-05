import { SimulationEngine } from './SimulationEngine';

export function injectLinkFailure(engine: SimulationEngine, linkId: string) {
  const links = engine.getLinks();
  const link = links.find(l => l.id === linkId);
  if (link) {
    link.status = 'DOWN';
  }
}

export function injectWrongGateway(engine: SimulationEngine, deviceId: string, badGateway: string) {
  const device = engine.getDevice(deviceId);
  if (device) {
    const defaultRoute = device.routingTable.find(r => r.network === '0.0.0.0' && r.prefix === 0);
    if (defaultRoute) {
      defaultRoute.nextHop = badGateway;
    } else {
      device.routingTable.push({
        network: '0.0.0.0',
        prefix: 0,
        nextHop: badGateway,
        interfaceId: device.interfaces[0].id
      });
    }
  }
}
