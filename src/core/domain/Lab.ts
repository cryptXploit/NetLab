

export type Skill = 
  | 'FOUNDATIONS' | 'ETHERNET' | 'ARP' | 'IPV4' | 'SUBNETTING'
  | 'DNS' | 'DHCP' 
  | 'SWITCHING' | 'MAC_LEARNING' | 'BROADCAST_DOMAINS'
  | 'ROUTING' | 'STATIC_ROUTES' | 'LONGEST_PREFIX' | 'GATEWAY'
  | 'TRANSPORT' | 'TCP' | 'UDP' | 'PORTS'
  | 'APPLICATION' | 'HTTP' 
  | 'TROUBLESHOOTING' | 'NAT' | 'VLAN' | 'ACL';

export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LabCategory = 'Foundations' | 'Switching' | 'Routing' | 'Services' | 'Transport' | 'Application' | 'Troubleshooting' | 'Advanced';
export type PracticeType = 'Prediction' | 'Configuration' | 'Subnetting';

export interface LabHint {
  id: string;
  message: string;
  cost?: number;
}

export type VerificationRuleType = 'PACKET_DELIVERED' | 'INTERFACE_IP' | 'ROUTE_EXISTS';

export interface VerificationRule {
  type: VerificationRuleType;
  
  // For PACKET_DELIVERED
  protocol?: string;
  sourceIp?: string;
  destinationIp?: string;

  // For INTERFACE_IP
  deviceId?: string;
  interfaceId?: string;
  expectedIp?: string;

  // For ROUTE_EXISTS
  network?: string;
  prefix?: number;
  nextHop?: string;
}

export type LabMode = 'tutorial' | 'troubleshooting';

export interface TroubleshootingConfig {
  objective: string;
  symptom: string;
  rootCause: string;
  solutionExplanation: string;
  verificationRules: VerificationRule[];
}

export interface LabStep {
  id: string;
  title: string;
  instruction: string;
  actionRequired?: string;
  observation?: string;
  explanation?: string;
  verificationRules?: VerificationRule[];
}

export interface LabDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: LabCategory;
  difficulty: LabDifficulty;
  estimatedTime: number; // minutes
  description: string;
  learningObjectives: string[];
  skills?: Skill[];
    prerequisites?: string[];
    isProRequired?: boolean;
    practiceMapping?: string[];
  
  initialStateHash?: string; // If using the stringified hash from ScenarioGenerator
  initialState?: { devices: any[]; links: any[] };
  // Note: initialStateGenerator is deprecated in favor of fully serializable initialState

  steps: LabStep[];
  hints: LabHint[];

  isChallenge?: boolean;
  mode?: LabMode;
  troubleshootingConfig?: TroubleshootingConfig;
}

export interface EvidenceEntry {
  id: string;
  timestamp: number;
  tool: 'PING' | 'ARP' | 'ROUTE' | 'DNS' | 'INTERFACE' | 'CLI';
  target: string;
  result: string;
  observation?: string;
}

export interface LabProgress {
  labId: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  currentStepIndex: number;
  hintsUsed: string[];
  bestScore?: number;
  attempts: number;
  lastAttemptAt?: number;
  investigationLog?: EvidenceEntry[];
}
