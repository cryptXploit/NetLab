import { type Route } from '../domain/NetworkTypes';
import { isInSameSubnet } from './IPv4';

/**
 * Finds the best route using Longest Prefix Match (LPM).
 * @param ip The target IPv4 address.
 * @param routes The routing table array.
 * @returns The matching Route object, or undefined if no route matches.
 */
export function findLongestPrefixMatch(ip: string, routes: Route[]): Route | undefined {
  const matches = routes.filter(route => isInSameSubnet(ip, route.network, route.prefix));
  
  if (matches.length === 0) {
    return undefined;
  }

  // Sort by prefix descending (longest match first)
  matches.sort((a, b) => b.prefix - a.prefix);

  return matches[0];
}
