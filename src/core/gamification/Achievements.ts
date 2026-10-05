export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_PING',
    title: 'Packet Detective',
    description: 'Successfully dispatch your first network ping.',
    icon: 'Radar'
  },
  {
    id: 'DIAGNOSTIC_EXPERT',
    title: 'Zero-Hint Solver',
    description: 'Successfully resolve a network fault and earn a healthy diagnostic.',
    icon: 'Stethoscope'
  },
  {
    id: 'SUBNET_NOVICE',
    title: 'Subnetting Novice',
    description: 'Score 50 XP in the Practice Arena.',
    icon: 'TerminalSquare'
  }
];
