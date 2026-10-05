

export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LabCategory = 'Foundations' | 'Addressing' | 'Transport' | 'Services' | 'Switching' | 'Routing' | 'Troubleshooting';
export type PracticeType = 'Prediction' | 'Configuration' | 'Subnetting';

export interface LabHint {
  id: string;
  message: string;
  cost?: number;
}

export type LabMode = 'tutorial' | 'troubleshooting';

export interface TroubleshootingConfig {
  objective: string;
  symptom: string;
  rootCause: string;
  solutionExplanation: string;
  verificationCondition: (engineState: any, eventHistory: any[]) => boolean;
}

export interface LabStep {
  id: string;
  title: string;
  instruction: string;
  actionRequired?: string;
  observation?: string;
  explanation?: string;
  successCondition?: (engineState: any, eventHistory: any[]) => boolean;
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
  
  initialStateHash?: string; // If using the stringified hash from ScenarioGenerator
  initialStateGenerator?: (engine: any) => void; // If using code to build topology

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
