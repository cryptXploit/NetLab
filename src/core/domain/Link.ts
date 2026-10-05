export interface Link {
  id: string;
  interface1Id: string;
  interface2Id: string;
  isUp: boolean;
  bandwidthMbps: number; // e.g., 100, 1000
  status: 'UP' | 'DOWN';
}

export function createLink(
  id: string,
  interface1Id: string,
  interface2Id: string,
  bandwidthMbps: number = 1000
): Link {
  if (interface1Id === interface2Id) {
    throw new Error('Link must connect two different interfaces');
  }
  return {
    id,
    interface1Id,
    interface2Id,
    isUp: true,
    bandwidthMbps,
    status: 'UP',
  };
}
