import { describe, it, expect } from 'vitest';
import {
  ipToNumber,
  numberToIp,
  getMaskFromPrefix,
  calculateNetworkAddress,
  calculateBroadcastAddress,
  isInSameSubnet,
  isValidIPv4
} from '../network/IPv4';

describe('IPv4 Math Utilities', () => {
  describe('isValidIPv4', () => {
    it('validates correctly formatted IPs', () => {
      expect(isValidIPv4('192.168.1.1')).toBe(true);
      expect(isValidIPv4('0.0.0.0')).toBe(true);
      expect(isValidIPv4('255.255.255.255')).toBe(true);
    });

    it('rejects invalid formatted IPs', () => {
      expect(isValidIPv4('256.1.1.1')).toBe(false);
      expect(isValidIPv4('192.168.1')).toBe(false);
      expect(isValidIPv4('192.168.01.1')).toBe(false); // leading zeros
      expect(isValidIPv4('not.an.ip')).toBe(false);
    });
  });

  describe('ipToNumber and numberToIp', () => {
    it('round-trips IPs correctly', () => {
      const ip = '192.168.1.5';
      const num = ipToNumber(ip);
      // 192 = C0, 168 = A8, 1 = 01, 5 = 05 -> C0A80105
      // Decimal: 3232235781
      expect(num).toBe(3232235781);
      expect(numberToIp(num)).toBe(ip);
    });

    it('handles boundary cases', () => {
      expect(ipToNumber('0.0.0.0')).toBe(0);
      expect(numberToIp(0)).toBe('0.0.0.0');

      expect(ipToNumber('255.255.255.255')).toBe(4294967295);
      expect(numberToIp(4294967295)).toBe('255.255.255.255');
    });

    it('throws on invalid IP or numbers', () => {
      expect(() => ipToNumber('999.999.999.999')).toThrow();
      expect(() => numberToIp(-1)).toThrow();
      expect(() => numberToIp(4294967296)).toThrow();
    });
  });

  describe('getMaskFromPrefix', () => {
    it('calculates common masks correctly', () => {
      expect(getMaskFromPrefix(24)).toBe('255.255.255.0');
      expect(getMaskFromPrefix(8)).toBe('255.0.0.0');
      expect(getMaskFromPrefix(16)).toBe('255.255.0.0');
      expect(getMaskFromPrefix(32)).toBe('255.255.255.255');
      expect(getMaskFromPrefix(0)).toBe('0.0.0.0');
    });

    it('throws on invalid prefixes', () => {
      expect(() => getMaskFromPrefix(-1)).toThrow();
      expect(() => getMaskFromPrefix(33)).toThrow();
    });
  });

  describe('calculateNetworkAddress', () => {
    it('calculates correct network boundaries', () => {
      expect(calculateNetworkAddress('192.168.1.5', 24)).toBe('192.168.1.0');
      expect(calculateNetworkAddress('10.15.20.25', 8)).toBe('10.0.0.0');
      expect(calculateNetworkAddress('172.16.5.99', 16)).toBe('172.16.0.0');
      expect(calculateNetworkAddress('192.168.1.130', 25)).toBe('192.168.1.128');
    });
  });

  describe('calculateBroadcastAddress', () => {
    it('calculates correct broadcast addresses', () => {
      expect(calculateBroadcastAddress('192.168.1.5', 24)).toBe('192.168.1.255');
      expect(calculateBroadcastAddress('10.15.20.25', 8)).toBe('10.255.255.255');
      expect(calculateBroadcastAddress('172.16.5.99', 16)).toBe('172.16.255.255');
      expect(calculateBroadcastAddress('192.168.1.130', 25)).toBe('192.168.1.255');
    });
  });

  describe('isInSameSubnet', () => {
    it('returns true when IPs are in the same subnet', () => {
      expect(isInSameSubnet('192.168.1.5', '192.168.1.250', 24)).toBe(true);
      expect(isInSameSubnet('10.0.0.1', '10.255.255.254', 8)).toBe(true);
      expect(isInSameSubnet('192.168.1.130', '192.168.1.254', 25)).toBe(true);
    });

    it('returns false when IPs are in different subnets', () => {
      expect(isInSameSubnet('192.168.1.5', '192.168.2.5', 24)).toBe(false);
      expect(isInSameSubnet('192.168.1.5', '192.168.1.130', 25)).toBe(false);
    });
  });
});
