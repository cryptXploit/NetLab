import { calculateNetworkAddress, calculateBroadcastAddress } from '../network/IPv4';

export interface PracticeQuestion {
  id: string;
  type: string;
  prompt: string;
  correctAnswer: string;
  explanation: string;
}

function generateRandomIp(): string {
  // Generate random IP avoiding 0.x.x.x, 127.x.x.x, 224-255.x.x.x
  const octet1 = Math.floor(Math.random() * 223) + 1; 
  if (octet1 === 127) return generateRandomIp(); // simple retry

  const octet2 = Math.floor(Math.random() * 256);
  const octet3 = Math.floor(Math.random() * 256);
  const octet4 = Math.floor(Math.random() * 256);

  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

function generateRandomPrefix(): number {
  // Common prefixes between /8 and /30
  return Math.floor(Math.random() * 23) + 8;
}

export function generateNetworkAddressQuestion(): PracticeQuestion {
  const ip = generateRandomIp();
  const prefix = generateRandomPrefix();
  const network = calculateNetworkAddress(ip, prefix);

  return {
    id: `net-${Math.random().toString(36).substring(2, 9)}`,
    type: 'NETWORK_ADDRESS',
    prompt: `What is the Network Address for ${ip}/${prefix}?`,
    correctAnswer: network,
    explanation: `The prefix /${prefix} masks out the host bits. Performing a bitwise AND on the IP (${ip}) with the subnet mask yields the Network Address ${network}.`
  };
}

export function generateBroadcastAddressQuestion(): PracticeQuestion {
  const ip = generateRandomIp();
  const prefix = generateRandomPrefix();
  const broadcast = calculateBroadcastAddress(ip, prefix);

  return {
    id: `bcast-${Math.random().toString(36).substring(2, 9)}`,
    type: 'BROADCAST_ADDRESS',
    prompt: `What is the Broadcast Address for ${ip}/${prefix}?`,
    correctAnswer: broadcast,
    explanation: `The prefix /${prefix} defines the network. Setting all host bits to 1 yields the Broadcast Address ${broadcast}.`
  };
}

export function generateQuestion(): PracticeQuestion {
  const roll = Math.random();
  if (roll < 0.5) {
    return generateNetworkAddressQuestion();
  } else {
    return generateBroadcastAddressQuestion();
  }
}
