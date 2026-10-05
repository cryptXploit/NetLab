export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;

  for (const part of parts) {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
    // Disallow leading zeros, e.g. "192.168.01.1"
    if (part.length > 1 && part.startsWith('0')) return false;
  }
  return true;
}

export function isValidPrefix(prefix: number): boolean {
  return Number.isInteger(prefix) && prefix >= 0 && prefix <= 32;
}

export function ipToNumber(ip: string): number {
  if (!isValidIPv4(ip)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function numberToIp(num: number): string {
  if (typeof num !== 'number' || num < 0 || num > 4294967295) {
    throw new Error(`Invalid IPv4 number: ${num}`);
  }
  const unsigned = num >>> 0;
  const p1 = (unsigned >>> 24) & 255;
  const p2 = (unsigned >>> 16) & 255;
  const p3 = (unsigned >>> 8) & 255;
  const p4 = unsigned & 255;
  return `${p1}.${p2}.${p3}.${p4}`;
}

export function getMaskFromPrefix(prefix: number): string {
  if (!isValidPrefix(prefix)) {
    throw new Error(`Invalid prefix length: ${prefix}`);
  }
  const maskNumber = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return numberToIp(maskNumber);
}

export function calculateNetworkAddress(ip: string, prefix: number): string {
  if (!isValidPrefix(prefix)) {
    throw new Error(`Invalid prefix length: ${prefix}`);
  }
  const ipNum = ipToNumber(ip);
  const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const networkNum = (ipNum & maskNum) >>> 0;
  return numberToIp(networkNum);
}

export function calculateBroadcastAddress(ip: string, prefix: number): string {
  if (!isValidPrefix(prefix)) {
    throw new Error(`Invalid prefix length: ${prefix}`);
  }
  const ipNum = ipToNumber(ip);
  const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  // Inverse mask (wildcard mask)
  const wildcardNum = (~maskNum) >>> 0;
  const broadcastNum = (ipNum | wildcardNum) >>> 0;
  return numberToIp(broadcastNum);
}

export function isInSameSubnet(ip1: string, ip2: string, prefix: number): boolean {
  if (!isValidPrefix(prefix)) {
    throw new Error(`Invalid prefix length: ${prefix}`);
  }
  const net1 = calculateNetworkAddress(ip1, prefix);
  const net2 = calculateNetworkAddress(ip2, prefix);
  return net1 === net2;
}
