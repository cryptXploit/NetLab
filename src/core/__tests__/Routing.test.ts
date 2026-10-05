import { describe, it, expect } from 'vitest';
import { findLongestPrefixMatch } from '../network/Routing';
import { type Route } from '../domain/NetworkTypes';

describe('Routing LPM', () => {
  it('should prefer a more specific route over a default route', () => {
    const routes: Route[] = [
      { network: '0.0.0.0', prefix: 0, interfaceId: 'if-default' },
      { network: '192.168.1.0', prefix: 24, interfaceId: 'if-specific' },
    ];

    const match = findLongestPrefixMatch('192.168.1.5', routes);
    expect(match).toBeDefined();
    expect(match?.interfaceId).toBe('if-specific');
  });

  it('should fallback to default route if no specific route matches', () => {
    const routes: Route[] = [
      { network: '0.0.0.0', prefix: 0, interfaceId: 'if-default' },
      { network: '192.168.1.0', prefix: 24, interfaceId: 'if-specific' },
    ];

    const match = findLongestPrefixMatch('10.0.0.5', routes);
    expect(match).toBeDefined();
    expect(match?.interfaceId).toBe('if-default');
  });

  it('should return undefined if no routes match', () => {
    const routes: Route[] = [
      { network: '192.168.1.0', prefix: 24, interfaceId: 'if-specific' },
    ];

    const match = findLongestPrefixMatch('10.0.0.5', routes);
    expect(match).toBeUndefined();
  });
});
