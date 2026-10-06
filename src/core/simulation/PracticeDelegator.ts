import type { LabDefinition } from '../domain/Lab';
import { generateWrongGatewayPractice, generateDHCPFailurePractice, generateDNSFailurePractice } from './ScenarioGenerator';

export function generateRandomPractice(seed: number, specificType?: string): LabDefinition {
  // Use part of the seed to pick which generator to use if not specified
  const types = ['GATEWAY', 'DHCP', 'DNS'];
  
  let typeToUse = specificType;
  if (!typeToUse) {
     const index = seed % types.length;
     typeToUse = types[index];
  }

  switch(typeToUse) {
    case 'GATEWAY': return generateWrongGatewayPractice(seed);
    case 'DHCP': return generateDHCPFailurePractice(seed);
    case 'DNS': return generateDNSFailurePractice(seed);
    default: return generateWrongGatewayPractice(seed);
  }
}
